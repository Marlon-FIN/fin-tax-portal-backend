/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-006
 *
 * Given  JWT (CUSTOMER)
 * And    TaxReturn = PENDING
 * When   POST /customers/:id/years/:year/tax-declaration/reject (body: {})
 * Then   400 Bad Request
 * And    { "error": "REJECTION_REASON_REQUIRED" }
 *
 * TODO: Spec zeigt URL als /tax-declaration/reject (ohne customer/year prefix).
 *       Mit vollem Pfad implementiert — mit Product klären.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaxReturnStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-006 | AT-API-006: Reject ohne Kommentar', () => {
  it('returns 400 REJECTION_REASON_REQUIRED when body is empty', async () => {
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
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('REJECTION_REASON_REQUIRED');
  });
});
