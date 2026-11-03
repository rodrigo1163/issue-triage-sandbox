import { Injectable, Logger } from '@nestjs/common';
import type { Message } from '@aws-sdk/client-sqs';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import z from 'zod';
import { ISSUE_TRIAGE_QUEUE_NAME } from './sqs-queue.constants';

const issueCreatedMessageSchema = z.object({
  eventId: z.string().min(1),
  type: z.literal('issue.created'),
  occurredAt: z.iso.datetime(),
  data: z.object({
    repository: z.string().min(1),
    issueNumber: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string(),
  }),
});

type IssueCreatedMessage = z.infer<typeof issueCreatedMessageSchema>;

@Injectable()
export class SqsConsumerService {
  private readonly logger = new Logger(SqsConsumerService.name);

  @SqsMessageHandler(ISSUE_TRIAGE_QUEUE_NAME, false)
  async handleMessage(message: Message): Promise<Message> {
    if (!message.Body) {
      throw new Error('SQS message body is empty');
    }

    const event = this.parseMessage(message.Body);

    await this.processIssueCreated(event);

    return message;
  }

  @SqsConsumerEventHandler(ISSUE_TRIAGE_QUEUE_NAME, 'processing_error')
  handleProcessingError(error: Error, message: Message): void {
    this.logger.error(
      `Failed to process SQS message ${message.MessageId ?? 'unknown'}: ${error.message}`,
      error.stack,
    );
  }

  @SqsConsumerEventHandler(ISSUE_TRIAGE_QUEUE_NAME, 'error')
  handleConsumerError(error: Error): void {
    this.logger.error(`SQS consumer error: ${error.message}`, error.stack);
  }

  private parseMessage(body: string): IssueCreatedMessage {
    let payload: unknown;

    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error('SQS message body is not valid JSON');
    }

    return issueCreatedMessageSchema.parse(payload);
  }

  private async processIssueCreated(event: IssueCreatedMessage): Promise<void> {
    this.logger.log(
      `Issue event received: ${event.data.repository}#${event.data.issueNumber}`,
    );
  }
}
