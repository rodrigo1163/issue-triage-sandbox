-- CreateEnum
CREATE TYPE "TriageStatus" AS ENUM ('RECEIVED', 'QUEUED');

-- CreateTable
CREATE TABLE "IssueTriage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "status" "TriageStatus" NOT NULL DEFAULT 'RECEIVED',
    "sqsMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueTriage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IssueTriage_eventId_key" ON "IssueTriage"("eventId");

-- CreateIndex
CREATE INDEX "IssueTriage_status_idx" ON "IssueTriage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IssueTriage_repository_issueNumber_key" ON "IssueTriage"("repository", "issueNumber");
