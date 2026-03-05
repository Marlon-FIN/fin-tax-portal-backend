import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { downloadRateLimit } from '../middleware/rateLimit';
import { storage } from '../storage';

const router = Router();

const SIGNED_URL_TTL = parseInt(process.env.SIGNED_URL_TTL ?? '60', 10);

// TC-SEC-001: IDOR check — customer can only access their own documents
// TC-SEC-002: Signed URL is short-lived (TTL 60–120s)
// TC-SEC-003: Rate limited (DOWNLOAD_RATE_LIMIT_MAX per 15min)
// GET /customers/:customerId/years/:year/files/:fileId/download
router.get(
  '/customers/:customerId/years/:year/files/:fileId/download',
  requireAuth,
  downloadRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year, fileId } = req.params;
    const taxYear = parseInt(year, 10);
    const requesterId = req.user!.id;

    // IDOR: verify requester owns or is participant of the case
    const taxCase = await prisma.case.findFirst({
      where: {
        customerProfileId: customerId,
        taxYear,
        OR: [
          { customerProfile: { accountId: requesterId } },
          { participants: { some: { accountId: requesterId } } },
        ],
      },
    });

    if (!taxCase) {
      res.status(403).json({ error: 'IDOR_FORBIDDEN' });
      return;
    }

    // Verify document belongs to this case
    const doc = await prisma.document.findFirst({
      where: { id: fileId, isDeleted: false, wrapper: { caseId: taxCase.id } },
    });

    if (!doc) {
      res.status(404).json({ error: 'DOCUMENT_NOT_FOUND' });
      return;
    }

    const signedUrl = await storage.getSignedDownloadUrl(doc.storageKey, SIGNED_URL_TTL);

    await prisma.auditLog.create({
      data: {
        actorAccountId: requesterId,
        action: `Document:Download-URL-Issued: ${doc.storageKey.split('/').pop()}`,
        entityType: 'Document',
        entityId: doc.id,
        payload: { ttlSeconds: SIGNED_URL_TTL },
      },
    });

    res.status(200).json({ url: signedUrl, ttlSeconds: SIGNED_URL_TTL });
  },
);

export default router;
