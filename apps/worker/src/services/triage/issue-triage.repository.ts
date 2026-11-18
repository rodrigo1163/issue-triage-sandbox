import { Injectable } from '@nestjs/common';
import { HumanReviewReason, TriageStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class IssueTriageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEventId(eventId: string) {
    return this.prisma.issueTriage.findUnique({
      where: { eventId },
    });
  }

  markHumanReview(id: string, reason: HumanReviewReason) {
    return this.prisma.issueTriage.updateMany({
      where: {
        id,
        status: TriageStatus.QUEUED,
      },
      data: {
        status: TriageStatus.HUMAN_REVIEW,
        humanReviewReason: reason,
      },
    });
  }
}
