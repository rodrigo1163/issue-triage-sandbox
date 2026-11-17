import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import z from 'zod';
import { GithubWebhookSignatureService } from '../services/github/github-webhook-signature.service.js';
import {
  SqsPublisher,
  type IssueCreatedMessage,
} from '../services/aws/sqs-publisher.service.js';

export const githubIssueWebhookSchema = z.object({
  // GitHub sends different actions for the `issues` event, such as
  // opened, edited, closed, reopened, labeled, and assigned.
  action: z.string().trim().min(1),

  issue: z.object({
    id: z.number().int(),
    number: z.number().int().positive(),
    title: z.string().trim().min(1),
    body: z.string().nullable(),
    html_url: z.url(),
    state: z.enum(['open', 'closed']),
    created_at: z.iso.datetime(),
  }),

  repository: z.object({
    id: z.number().int(),
    name: z.string().trim().min(1),
    full_name: z.string().trim().min(1),
    private: z.boolean(),
  }),

  sender: z.object({
    login: z.string().trim().min(1),
  }),
});

export type GithubIssueWebhook = z.infer<typeof githubIssueWebhookSchema>;

const bodyValidationPipe = new ZodValidationPipe(githubIssueWebhookSchema);

@Controller('webhooks/github')
export class WebhookGithubController {
  constructor(
    private readonly signatureService: GithubWebhookSignatureService,
    private readonly sqsPublisher: SqsPublisher,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Body() payload: unknown,
    @Headers('x-hub-signature-256') signature?: string,
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-github-delivery') githubDelivery?: string,
  ) {
    this.signatureService.verify(request.rawBody, signature);

    const eventName = githubEvent?.trim();
    const deliveryId = githubDelivery?.trim();

    if (!eventName) {
      throw new BadRequestException('Missing x-github-event header');
    }

    if (!deliveryId) {
      throw new BadRequestException('Missing x-github-delivery header');
    }

    if (eventName !== 'issues') {
      return {
        accepted: false,
        ignored: true,
        reason: 'unsupported_event',
        event: eventName,
      };
    }

    const body = bodyValidationPipe.transform(payload);

    if (body.action !== 'opened') {
      return {
        accepted: false,
        ignored: true,
        reason: 'unsupported_action',
        action: body.action,
        eventId: deliveryId,
      };
    }

    const description = body.issue.body?.trim() || null;
    const missingInformation: IssueCreatedMessage['data']['missingInformation'] =
      description === null ? ['description'] : [];

    const event: IssueCreatedMessage = {
      eventId: deliveryId,
      type: 'issue.created',
      occurredAt: body.issue.created_at,
      data: {
        repository: body.repository.full_name.trim(),
        issueNumber: body.issue.number,
        title: body.issue.title.trim(),
        description,
        missingInformation,
      },
    };

    const messageId = await this.sqsPublisher.publish(event);

    console.log('Mensagem publicada no SQS:', messageId);

    return {
      accepted: true,
      messageId,
    };
  }
}
