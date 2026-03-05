/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-008
 *
 * Given  JWT (FIN_MANDATSLEITER) [mapped: Role.ADMIN]
 * And    TaxReturn = PENDING
 * When   POST /customers/:id/years/:year/tax-declaration/accept
 * Then   403 Forbidden
 * And    { "error": "ROLE_INSUFFICIENT" }
 *
 * TODO: Spec zeigt URL als /tax-declaration/accept (ohne customer/year prefix).
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaxReturnStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-008 | AT-API-008: FIN kann nicht akzeptieren', () => {
  it('returns 403 ROLE_INSUFFICIENT when FIN_MANDATSLEITER tries to accept', async () => {
    const finAccount = await createAccount({ role: Role.ADMIN });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      taxReturnStatus: TaxReturnStatus.PENDING,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/accept`)
      .set(authHeader(finAccount.id, Role.ADMIN));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ROLE_INSUFFICIENT');
  });
});
