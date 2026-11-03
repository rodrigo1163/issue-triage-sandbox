import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('webhooks/github')
export class WebhookGithubController {
  @Post()
  handle(
    @Req() req: Request,
    @Body() body: any,
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-github-delivery') githubDelivery?: string,
  ) {
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Evento:', githubEvent);
    console.log('Delivery ID:', githubDelivery);
    console.log('Body:', JSON.stringify(body, null, 2));

    return {
      ok: true,
      message: 'Webhook recebido com sucesso',
    };
  }
}