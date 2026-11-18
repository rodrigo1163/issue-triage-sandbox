import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { IssueTriageRepository } from './issue-triage.repository.js';

@Module({
  imports: [PrismaModule],
  providers: [IssueTriageRepository],
  exports: [IssueTriageRepository],
})
export class IssueTriageModule {}
