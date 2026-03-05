import { Router, Request, Response } from 'express';
import { TaskStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// AT-API-010: Delete-Gate – Task grün → 422 TASK_NOT_RED
// AT-API-011: Delete mit Bestätigung → 200 + Deleted Documents + AuditLog
// DELETE /customers/:customerId/years/:year/files/:fileId
router.delete(
  '/customers/:customerId/years/:year/files/:fileId',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year, fileId } = req.params;
    const taxYear = parseInt(year, 10);
    const { confirmation } = req.body as { confirmation?: string };
    const actorId = req.user!.id;

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    const doc = await prisma.document.findFirst({
      where: { id: fileId, wrapper: { caseId: taxCase.id } },
      include: { wrapper: { include: { task: true } } },
    });

    if (!doc) {
      res.status(404).json({ error: 'DOCUMENT_NOT_FOUND' });
      return;
    }

    // Delete-Gate: task must be RED (AT-API-010)
    if (doc.wrapper.task && doc.wrapper.task.status === TaskStatus.GREEN) {
      res.status(422).json({ error: 'TASK_NOT_RED' });
      return;
    }

    // Freeze gate
    if (taxCase.isFrozen) {
      res.status(423).json({ error: 'FREEZE_ACTIVE' });
      return;
    }

    // Confirmation required (AT-API-011)
    if (confirmation !== 'DELETE') {
      res.status(422).json({ error: 'DELETE_CONFIRMATION_REQUIRED' });
      return;
    }

    await prisma.document.update({
      where: { id: doc.id },
      data: { isDeleted: true },
    });

    await prisma.deletedDocument.create({
      data: { documentId: doc.id, restoreable: true },
    });

    const filename = doc.storageKey.split('/').pop() ?? doc.id;
    await prisma.auditLog.create({
      data: {
        actorAccountId: actorId,
        action: `Delete: ${filename}`,
        entityType: 'Document',
        entityId: doc.id,
      },
    });

    res.status(200).json({ deleted: true });
  },
);

export default router;
