-- Migration: add-wrapper-task-pending-status
-- Spec: fin-tax-portal-specs @ spec-v1.0

-- Step 1: Rename SUBMITTED → PENDING in TaxReturnStatus enum
-- PostgreSQL doesn't support DROP VALUE, so we rename the existing value.
ALTER TYPE "TaxReturnStatus" RENAME VALUE 'SUBMITTED' TO 'PENDING';

-- Step 2: Add nullable name column to Wrapper
ALTER TABLE "Wrapper" ADD COLUMN "name" TEXT;

-- Step 3: Add nullable taskId column to Wrapper
ALTER TABLE "Wrapper" ADD COLUMN "taskId" TEXT;

-- Step 4: Add FK constraint Wrapper.taskId → Task.id (SET NULL on delete)
ALTER TABLE "Wrapper"
  ADD CONSTRAINT "Wrapper_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Add index on Wrapper(taskId)
CREATE INDEX "Wrapper_taskId_idx" ON "Wrapper"("taskId");
