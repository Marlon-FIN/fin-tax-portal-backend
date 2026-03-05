import { Router, Request, Response } from 'express';
import { TaxReturnStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// AT-API-003: Publish Gate – Ampel nicht grün → 422 AMPEL_NOT_GREEN
// AT-API-004: Publish – Ampel GREEN → 200 + PENDING + isFrozen=true
// AT-API-005: Sachbearbeiter (ADVISOR) kann nicht publizieren → 403
// Role: ADMIN (= FIN_MANDATSLEITER) only
router.post(
  '/customers/:customerId/years/:year/tax-declaration/publish',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year } = req.params;
    const taxYear = parseInt(year, 10);

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    if (taxCase.trafficLightStatus !== 'GREEN') {
      res.status(422).json({ error: 'AMPEL_NOT_GREEN' });
      return;
    }

    const updated = await prisma.case.update({
      where: { id: taxCase.id },
      data: { taxReturnStatus: TaxReturnStatus.PENDING, isFrozen: true },
    });

    res.status(200).json({ case: updated });
  },
);

// AT-API-006: Reject ohne Kommentar → 400 REJECTION_REASON_REQUIRED
// AT-API-007: Reject mit Kommentar → 200 + REJECTED + Freeze aufgehoben + AuditLog
// Role: CUSTOMER only
// TODO: Spec zeigt URL als /tax-declaration/reject (ohne customer/year prefix).
//       Hier mit vollem Pfad für Konsistenz implementiert — mit Product klären.
router.post(
  '/customers/:customerId/years/:year/tax-declaration/reject',
  requireAuth,
  requireRole(Role.CUSTOMER),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year } = req.params;
    const taxYear = parseInt(year, 10);
    const { reason } = req.body as { reason?: string };

    if (!reason || reason.trim() === '') {
      res.status(400).json({ error: 'REJECTION_REASON_REQUIRED' });
      return;
    }

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear, taxReturnStatus: TaxReturnStatus.PENDING },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    const updated = await prisma.case.update({
      where: { id: taxCase.id },
      data: { taxReturnStatus: TaxReturnStatus.REJECTED, isFrozen: false },
    });

    await prisma.auditLog.create({
      data: {
        actorAccountId: req.user!.id,
        action: `Tax Return rejected: ${reason}`,
        entityType: 'Case',
        entityId: taxCase.id,
        payload: { reason },
      },
    });

    // TODO: AT-API-007 — E-Mail-Notification an FIN nicht implementiert (kein Mail-Service konfiguriert)

    res.status(200).json({ case: updated });
  },
);

// AT-API-008: FIN kann nicht akzeptieren → 403 ROLE_INSUFFICIENT
// Role: CUSTOMER only — ADMIN (FIN_MANDATSLEITER) gets 403
// TODO: Spec zeigt URL als /tax-declaration/accept (ohne customer/year prefix).
router.post(
  '/customers/:customerId/years/:year/tax-declaration/accept',
  requireAuth,
  requireRole(Role.CUSTOMER),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year } = req.params;
    const taxYear = parseInt(year, 10);

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear, taxReturnStatus: TaxReturnStatus.PENDING },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    const updated = await prisma.case.update({
      where: { id: taxCase.id },
      data: { taxReturnStatus: TaxReturnStatus.ACCEPTED },
    });

    res.status(200).json({ case: updated });
  },
);

// AT-API-009: Withdraw → 200 + DRAFT + Freeze aufgehoben + AuditLog
//             ADVISOR → 403 ROLE_INSUFFICIENT
// Role: ADMIN (= FIN_MANDATSLEITER) only
// TODO: Spec zeigt URL als /tax-declaration/withdraw (ohne customer/year prefix).
router.post(
  '/customers/:customerId/years/:year/tax-declaration/withdraw',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, year } = req.params;
    const taxYear = parseInt(year, 10);

    const taxCase = await prisma.case.findFirst({
      where: { customerProfileId: customerId, taxYear, taxReturnStatus: TaxReturnStatus.PENDING },
    });

    if (!taxCase) {
      res.status(404).json({ error: 'CASE_NOT_FOUND' });
      return;
    }

    const updated = await prisma.case.update({
      where: { id: taxCase.id },
      data: { taxReturnStatus: TaxReturnStatus.DRAFT, isFrozen: false },
    });

    await prisma.auditLog.create({
      data: {
        actorAccountId: req.user!.id,
        action: 'Tax Return withdrawn',
        entityType: 'Case',
        entityId: taxCase.id,
      },
    });

    res.status(200).json({ case: updated });
  },
);

export default router;
