import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { EnvService } from '../../env/env.service.js';

export type IssueCreatedMessage = {
  eventId: string;
  type: 'issue.created';
  occurredAt: string;
  data: {
    repository: string;
    issueNumber: number;
    title: string;
    description: string;
  };
};

@Injectable()
export class SqsPublisher implements OnModuleDestroy {
  private readonly client: SQSClient;
  private readonly queueUrl: string;


  constructor(private readonly env: EnvService) {
    this.client = new SQSClient({
      region: this.env.get('AWS_REGION'),
      profile: this.env.get('AWS_PROFILE')
    });

    this.queueUrl = this.env.get('SQS_QUEUE_URL');
  }

  async publish(event: IssueCreatedMessage): Promise<string> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(event),
    });

    const response = await this.client.send(command);

    if (!response.MessageId) {
      throw new Error('SQS did not return a MessageId');
    }

    return response.MessageId;
  }

  onModuleDestroy() {
    this.client.destroy();
  }
}
