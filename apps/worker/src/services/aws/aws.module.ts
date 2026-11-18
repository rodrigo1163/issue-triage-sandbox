import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { EnvModule } from '../../env/env.module';
import { EnvService } from '../../env/env.service.js';
import { ISSUE_TRIAGE_QUEUE_NAME } from './sqs-queue.constants';
import { SqsConsumerService } from './sqs-consumer.service';
import { SQSClient } from '@aws-sdk/client-sqs';
import { ProjectCatalogModule } from '../catalog/project-catalog.module.js';
import { IssueTriageModule } from '../triage/issue-triage.module.js';
import { GraphModule } from '../../graph/graph.module.js';

@Module({
  imports: [
    EnvModule,
    IssueTriageModule,
    ProjectCatalogModule,
    GraphModule,
    SqsModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        consumers: [
          {
            name: ISSUE_TRIAGE_QUEUE_NAME,
            queueUrl: env.get('SQS_QUEUE_URL'),
            sqs: new SQSClient({
              region: env.get('AWS_REGION'),
              profile: env.get('AWS_PROFILE'),
            }),
            batchSize: 1,
            waitTimeSeconds: 20,
            visibilityTimeout: 60,
          },
        ],
      }),
    }),
  ],
  providers: [SqsConsumerService],
})
export class AwsModule { }
