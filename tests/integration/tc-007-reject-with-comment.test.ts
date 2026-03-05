/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-007
 *
 * Given  JWT (CUSTOMER)
 * And    TaxReturn = PENDING
 * When   POST /customers/:id/years/:year/tax-declaration/reject { reason: "Lohnausweis falsch" }
 * Then   200 OK
 * And    TaxReturn.status = REJECTED
 * And    Freeze aufgehoben
 * And    Audit-Log: "Tax Return rejected: Lohnausweis falsch"
 *
 * TODO: E-Mail-Notification an FIN nicht implementiert (kein Mail-Service konfiguriert).
 * TODO: Spec zeigt URL als /tax-declaration/reject (ohne customer/year prefix).
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaxReturnStatus } from '@prisma/client';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-007 | AT-API-007: Reject mit Kommentar', () => {
  it('returns 200, sets REJECTED, lifts freeze, writes audit log', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    await createCase(profile.id, {
      taxYear: 2024,
      taxReturnStatus: TaxReturnStatus.PENDING,
      isFrozen: true,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/reject`)
      .set(authHeader(account.id, Role.CUSTOMER))
      .send({ reason: 'Lohnausweis falsch' });

    expect(res.status).toBe(200);
    expect(res.body.case.taxReturnStatus).toBe('REJECTED');
    expect(res.body.case.isFrozen).toBe(false);

    const auditLog = await prisma.auditLog.findFirst({
      where: { actorAccountId: account.id },
    });
    expect(auditLog?.action).toBe('Tax Return rejected: Lohnausweis falsch');
  });
});
