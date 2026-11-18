import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { EnvModule } from './env/env.module';
import { envSchema } from './env/env';
import { AwsModule } from './services/aws/aws.module';
import { PrismaModule } from './prisma/prisma.module.js';
import { IssueTriageModule } from './services/triage/issue-triage.module.js';
import { ProjectCatalogModule } from './services/catalog/project-catalog.module.js';
import { GraphModule } from './graph/graph.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    AwsModule,
    PrismaModule,
    IssueTriageModule,
    ProjectCatalogModule,
    GraphModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
