/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-009
 *
 * Given  JWT (FIN_MANDATSLEITER) [mapped: Role.ADMIN]
 * And    TaxReturn = PENDING
 * When   POST /customers/:id/years/:year/tax-declaration/withdraw
 * Then   200 OK
 * And    TaxReturn.status = DRAFT
 * And    Freeze aufgehoben
 *
 * Given  JWT (FIN_SACHBEARBEITER) [mapped: Role.ADVISOR]
 * When   POST /customers/:id/years/:year/tax-declaration/withdraw
 * Then   403 Forbidden
 *
 * TODO: Spec zeigt URL als /tax-declaration/withdraw (ohne customer/year prefix).
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaxReturnStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-009 | AT-API-009: Withdraw', () => {
  it('returns 200 and resets to DRAFT when FIN_MANDATSLEITER withdraws', async () => {
    const finAccount = await createAccount({ role: Role.ADMIN });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      taxReturnStatus: TaxReturnStatus.PENDING,
      isFrozen: true,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/withdraw`)
      .set(authHeader(finAccount.id, Role.ADMIN));

    expect(res.status).toBe(200);
    expect(res.body.case.taxReturnStatus).toBe('DRAFT');
    expect(res.body.case.isFrozen).toBe(false);
  });

  it('returns 403 ROLE_INSUFFICIENT when FIN_SACHBEARBEITER tries to withdraw', async () => {
    const advisorAccount = await createAccount({ role: Role.ADVISOR });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      taxReturnStatus: TaxReturnStatus.PENDING,
      isFrozen: true,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/withdraw`)
      .set(authHeader(advisorAccount.id, Role.ADVISOR));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ROLE_INSUFFICIENT');
  });
});
