import { afterEach, afterAll } from 'vitest';
import { prisma } from '../../src/lib/prisma';

async function cleanDb() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taxReturnAttachmentConfig.deleteMany();
  await prisma.taxReturnDraft.deleteMany();
  await prisma.deletedDocument.deleteMany();
  await prisma.document.deleteMany();
  await prisma.wrapper.deleteMany();
  await prisma.task.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.archiveRecord.deleteMany();
  await prisma.caseParticipant.deleteMany();
  await prisma.case.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.account.deleteMany();
}

afterEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
