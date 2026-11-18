-- CreateEnum
CREATE TYPE "HumanReviewReason" AS ENUM ('UNKNOWN_REPOSITORY', 'MISSING_DESCRIPTION');

-- AlterEnum
ALTER TYPE "TriageStatus" ADD VALUE 'HUMAN_REVIEW';

-- AlterTable
ALTER TABLE "IssueTriage" ADD COLUMN     "humanReviewReason" "HumanReviewReason";
