import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { WebhookGithubController } from './controllers/webhook-github.controller';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { AwsModule } from './services/aws/aws.module';
import { GithubModule } from './services/github/github.module';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    AwsModule,
    GithubModule,
    PrismaModule,
  ],
  controllers: [HealthController, WebhookGithubController],
  providers: [],
})
export class AppModule {}
