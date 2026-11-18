-- CreateTable
CREATE TABLE "ProjectCatalog" (
    "id" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "responsibles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "triageInstructions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCatalog_repository_key" ON "ProjectCatalog"("repository");
