import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { WebhookGithubController } from './controllers/webhook-github.controller';

@Module({
  imports: [],
  controllers: [HealthController, WebhookGithubController],
  providers: [],
})
export class AppModule { }
