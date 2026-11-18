import { Injectable } from '@nestjs/common';
import { Prisma, TriageStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { IssueCreatedMessage } from '../aws/sqs-publisher.service.js';

export type IssueTriageRegistration =
  | {
      created: true;
      triage: Awaited<ReturnType<PrismaService['issueTriage']['create']>>;
    }
  | {
      created: false;
      triage: Awaited<ReturnType<PrismaService['issueTriage']['findFirst']>>;
    };

@Injectable()
export class IssueTriageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(event: IssueCreatedMessage): Promise<IssueTriageRegistration> {
    try {
      const triage = await this.prisma.issueTriage.create({
        data: {
          eventId: event.eventId,
          repository: event.data.repository,
          issueNumber: event.data.issueNumber,
          title: event.data.title,
          description: event.data.description,
          occurredAt: new Date(event.occurredAt),
          status: TriageStatus.RECEIVED,
        },
      });

      return { created: true, triage };
    } catch (error) {
      if (!this.isUniqueConstraintViolation(error)) {
        throw error;
      }

      const triage = await this.findExistingByEventOrIssue(
        event.eventId,
        event.data.repository,
        event.data.issueNumber,
      );

      if (!triage) {
        throw error;
      }

      return { created: false, triage };
    }
  }

  async markQueued(id: string, sqsMessageId: string) {
    return this.prisma.issueTriage.update({
      where: { id },
      data: {
        status: TriageStatus.QUEUED,
        sqsMessageId,
      },
    });
  }

  private findExistingByEventOrIssue(
    eventId: string,
    repository: string,
    issueNumber: number,
  ) {
    return this.prisma.issueTriage.findFirst({
      where: {
        OR: [
          { eventId },
          {
            repository,
            issueNumber,
          },
        ],
      },
    });
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
