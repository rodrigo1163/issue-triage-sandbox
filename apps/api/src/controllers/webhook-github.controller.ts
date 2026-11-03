import { Body, Controller, Headers, Post, Req, type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import z from 'zod';
import { GithubWebhookSignatureService } from 'src/services/github-webhook-signature.service';

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

export type GithubIssueWebhook = z.infer<
  typeof githubIssueWebhookSchema
>;

const bodyValidationPipe = new ZodValidationPipe(githubIssueWebhookSchema)

@Controller('webhooks/github')
export class WebhookGithubController {
  constructor(
    private readonly signatureService: GithubWebhookSignatureService,
  ) { }


  @Post()
  handle(
    @Req() request: RawBodyRequest<Request>,
    @Body(bodyValidationPipe) body: GithubIssueWebhook,
    @Headers('x-hub-signature-256') signature?: string,
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-github-delivery') githubDelivery?: string,
  ) {
    this.signatureService.verify(request.rawBody, signature);

    const { action, issue, repository, sender } = body

    console.log({
      action,
      issue,
      repository,
      sender
    })

    return {
      ok: true,
      message: 'Webhook recebido com sucesso',
    };
  }
}
