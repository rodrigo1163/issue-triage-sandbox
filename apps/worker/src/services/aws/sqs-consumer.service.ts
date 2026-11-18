import { Injectable, Logger } from '@nestjs/common';
import type { Message } from '@aws-sdk/client-sqs';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import z from 'zod';
import { ISSUE_TRIAGE_QUEUE_NAME } from './sqs-queue.constants';
import { TriageStatus } from '@prisma/client';
import { IssueTriageRepository } from '../triage/issue-triage.repository.js';
import { ProjectCatalogService } from '../catalog/project-catalog.service.js';

const issueCreatedMessageSchema = z.object({
  eventId: z.string().min(1),
  type: z.literal('issue.created'),
  occurredAt: z.iso.datetime(),
  data: z.object({
    repository: z.string().min(1),
    issueNumber: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullable(),
    missingInformation: z.array(z.literal('description')),
  }),
});

type IssueCreatedMessage = z.infer<typeof issueCreatedMessageSchema>;

@Injectable()
export class SqsConsumerService {
  private readonly logger = new Logger(SqsConsumerService.name);

  constructor(
    private readonly issueTriageRepository: IssueTriageRepository,
    private readonly projectCatalogService: ProjectCatalogService,
  ) {}

  @SqsMessageHandler(ISSUE_TRIAGE_QUEUE_NAME, false)
  async handleMessage(message: Message): Promise<Message> {
    if (!message.Body) {
      throw new Error('SQS message body is empty');
    }

    const event = this.parseMessage(message.Body);
    this.logger.log(`Mensagem recebida do SQS: ${event.eventId}`);

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
    const triage = await this.issueTriageRepository.findByEventId(
      event.eventId,
    );

    if (!triage) {
      throw new Error(`Triage not found for event ${event.eventId}`);
    }

    if (triage.status !== TriageStatus.QUEUED) {
      throw new Error(
        `Triage ${triage.id} is not ready for processing: ${triage.status}`,
      );
    }

    const project = await this.projectCatalogService.findByRepository(
      triage.repository,
    );

    if (!project) {
      this.logger.warn(
        `Project not found in catalog: ${triage.repository}; human review will be handled in a later step`,
      );
      return;
    }

    this.logger.log(
      `Project context loaded for ${triage.repository}#${triage.issueNumber}: ${project.responsibles.join(', ')}`,
    );
  }
}
