import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// AT-API-001: Upload via Task → 201 + Wrapper + AuditLog
// AT-API-002: Upload blockiert bei Freeze → 423 FREEZE_ACTIVE
// POST /customers/:customerId/years/:year/tasks/:taskId/wrappers
router.post(
  '/customers/:customerId/years/:year/tasks/:taskId/wrappers',
  requireAuth,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year, taskId } = req.params;
    const taxYear = parseInt(year, 10);
    const actorId = req.user!.id;

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    if (taxCase.isFrozen) {
      res.status(423).json({ error: 'FREEZE_ACTIVE' });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, caseId: taxCase.id },
    });

    if (!task) {
      res.status(404).json({ error: 'TASK_NOT_FOUND' });
      return;
    }

    if (!task.isActive) {
      res.status(422).json({ error: 'TASK_NOT_ACTIVE' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'FILE_REQUIRED' });
      return;
    }

    const wrapper = await prisma.wrapper.create({
      data: {
        caseId: taxCase.id,
        name: task.source ?? file.originalname,
        taskId: task.id,
        documents: {
          create: {
            mimeType: file.mimetype,
            storageKey: `uploads/${taxCase.id}/${task.id}/${file.originalname}`,
            uploadedById: actorId,
          },
        },
      },
      include: { documents: true },
    });

    await prisma.auditLog.create({
      data: {
        actorAccountId: actorId,
        action: `Upload: ${file.originalname}`,
        entityType: 'Document',
        entityId: wrapper.documents[0].id,
      },
    });

    res.status(201).json({ wrapper });
  },
);

export default router;
