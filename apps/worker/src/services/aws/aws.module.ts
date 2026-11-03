import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { EnvModule } from '../../env/env.module';
import { EnvService } from '../../env/env.service.js';
import { ISSUE_TRIAGE_QUEUE_NAME } from './sqs-queue.constants';
import { SqsConsumerService } from './sqs-consumer.service';
import { SQSClient } from '@aws-sdk/client-sqs';

@Module({
  imports: [
    EnvModule,
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
            visibilityTimeout: 30,
          },
        ],
      }),
    }),
  ],
  providers: [SqsConsumerService],
})
export class AwsModule { }
