import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import z from 'zod';
import { GithubWebhookSignatureService } from '../services/github/github-webhook-signature.service.js';
import { SqsPublisher } from 'src/services/aws/sqs-publisher.service';

export const githubIssueWebhookSchema = z.object({
  // GitHub sends different actions for the `issues` event, such as
  // opened, edited, closed, reopened, labeled, and assigned.
  action: z.string().min(1),

  issue: z.object({
    id: z.number().int(),
    number: z.number().int().positive(),
    title: z.string().min(1),
    body: z.string().nullable(),
    html_url: z.url(),
    state: z.enum(['open', 'closed']),
    created_at: z.iso.datetime(),
  }),

  repository: z.object({
    id: z.number().int(),
    name: z.string().min(1),
    full_name: z.string().min(1),
    private: z.boolean(),
  }),

  sender: z.object({
    login: z.string().min(1),
  }),
});

export type GithubIssueWebhook = z.infer<typeof githubIssueWebhookSchema>;

const bodyValidationPipe = new ZodValidationPipe(githubIssueWebhookSchema);

@Controller('webhooks/github')
export class WebhookGithubController {
  constructor(
    private readonly signatureService: GithubWebhookSignatureService,
    private readonly sqsPublisher: SqsPublisher,
  ) { }

  @Post()
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Body(bodyValidationPipe) body: GithubIssueWebhook,
    @Headers('x-hub-signature-256') signature?: string,
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-github-delivery') githubDelivery?: string,
  ) {
    this.signatureService.verify(request.rawBody, signature);

    const { action, issue, repository, sender } = body;

    if (!githubDelivery) {
      return
    }

    const messageId = await this.sqsPublisher.publish({
      eventId: githubDelivery,
      type: 'issue.created',
      occurredAt: issue.created_at,
      data: {
        repository: repository.full_name,
        issueNumber: issue.number,
        title: issue.title,
        description: issue.body ?? '',
      },
    });

    console.log('Mensagem publicada no SQS:', messageId);

    return {
      accepted: true,
      messageId,
    };
  }
}
