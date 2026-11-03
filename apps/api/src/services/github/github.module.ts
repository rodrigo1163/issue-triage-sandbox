import { Module } from '@nestjs/common';
import { EnvModule } from '../../env/env.module';
import { GithubWebhookSignatureService } from './github-webhook-signature.service';

@Module({
  imports: [EnvModule],
  providers: [GithubWebhookSignatureService],
  exports: [GithubWebhookSignatureService],
})
export class GithubModule { }
