-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVISOR', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "MasterDataStatus" AS ENUM ('PENDING', 'COMPLETE', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "TrafficLightStatus" AS ENUM ('RED', 'YELLOW', 'GREEN');

-- CreateEnum
CREATE TYPE "TaxReturnStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('RED', 'GREEN');

-- CreateEnum
CREATE TYPE "Rubric" AS ENUM ('PERSONAL_DATA', 'INCOME', 'DEDUCTIONS', 'ASSETS', 'REAL_ESTATE', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "ahvNumber" TEXT NOT NULL,
    "masterDataStatus" "MasterDataStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "customerProfileId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "trafficLightStatus" "TrafficLightStatus" NOT NULL DEFAULT 'RED',
    "taxReturnStatus" "TaxReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseParticipant" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "rubric" "Rubric" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'RED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "carryForwardKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wrapper" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wrapper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "wrapperId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedDocument" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "restoreable" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReturnDraft" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploadedPdfKey" TEXT,
    "publishedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxReturnDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReturnAttachmentConfig" (
    "id" TEXT NOT NULL,
    "taxReturnDraftId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "pageSelection" JSONB,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaxReturnAttachmentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorAccountId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveRecord" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "zipStorageKey" TEXT NOT NULL,
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Account_email_idx" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_accountId_key" ON "CustomerProfile"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_ahvNumber_key" ON "CustomerProfile"("ahvNumber");

-- CreateIndex
CREATE INDEX "CustomerProfile_ahvNumber_idx" ON "CustomerProfile"("ahvNumber");

-- CreateIndex
CREATE INDEX "Case_customerProfileId_idx" ON "Case"("customerProfileId");

-- CreateIndex
CREATE INDEX "Case_taxYear_idx" ON "Case"("taxYear");

-- CreateIndex
CREATE INDEX "Case_trafficLightStatus_idx" ON "Case"("trafficLightStatus");

-- CreateIndex
CREATE INDEX "Case_taxReturnStatus_idx" ON "Case"("taxReturnStatus");

-- CreateIndex
CREATE INDEX "CaseParticipant_caseId_idx" ON "CaseParticipant"("caseId");

-- CreateIndex
CREATE INDEX "CaseParticipant_accountId_idx" ON "CaseParticipant"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseParticipant_caseId_accountId_key" ON "CaseParticipant"("caseId", "accountId");

-- CreateIndex
CREATE INDEX "Questionnaire_caseId_idx" ON "Questionnaire"("caseId");

-- CreateIndex
CREATE INDEX "Task_caseId_idx" ON "Task"("caseId");

-- CreateIndex
CREATE INDEX "Task_rubric_idx" ON "Task"("rubric");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Wrapper_caseId_idx" ON "Wrapper"("caseId");

-- CreateIndex
CREATE INDEX "Document_wrapperId_idx" ON "Document"("wrapperId");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "DeletedDocument_documentId_key" ON "DeletedDocument"("documentId");

-- CreateIndex
CREATE INDEX "TaxReturnDraft_caseId_idx" ON "TaxReturnDraft"("caseId");

-- CreateIndex
CREATE INDEX "TaxReturnAttachmentConfig_taxReturnDraftId_idx" ON "TaxReturnAttachmentConfig"("taxReturnDraftId");

-- CreateIndex
CREATE INDEX "TaxReturnAttachmentConfig_documentId_idx" ON "TaxReturnAttachmentConfig"("documentId");

-- CreateIndex
CREATE INDEX "AuditLog_actorAccountId_idx" ON "AuditLog"("actorAccountId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_accountId_idx" ON "Notification"("accountId");

-- CreateIndex
CREATE INDEX "ArchiveRecord_caseId_idx" ON "ArchiveRecord"("caseId");

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParticipant" ADD CONSTRAINT "CaseParticipant_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParticipant" ADD CONSTRAINT "CaseParticipant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wrapper" ADD CONSTRAINT "Wrapper_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_wrapperId_fkey" FOREIGN KEY ("wrapperId") REFERENCES "Wrapper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedDocument" ADD CONSTRAINT "DeletedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnDraft" ADD CONSTRAINT "TaxReturnDraft_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnAttachmentConfig" ADD CONSTRAINT "TaxReturnAttachmentConfig_taxReturnDraftId_fkey" FOREIGN KEY ("taxReturnDraftId") REFERENCES "TaxReturnDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnAttachmentConfig" ADD CONSTRAINT "TaxReturnAttachmentConfig_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorAccountId_fkey" FOREIGN KEY ("actorAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveRecord" ADD CONSTRAINT "ArchiveRecord_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
