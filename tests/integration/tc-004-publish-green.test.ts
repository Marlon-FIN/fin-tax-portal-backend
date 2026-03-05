/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-004
 *
 * Given  JWT (FIN_MANDATSLEITER) [mapped: Role.ADMIN]
 * And    Ampel = GREEN
 * When   POST /customers/:id/years/:year/tax-declaration/publish
 * Then   200 OK
 * And    TaxReturn.status = PENDING
 * And    Freeze aktiv
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TrafficLightStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-004 | AT-API-004: Publish – Ampel GREEN → Freeze', () => {
  it('returns 200, sets taxReturnStatus=PENDING and isFrozen=true', async () => {
    const finAccount = await createAccount({ role: Role.ADMIN });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      trafficLightStatus: TrafficLightStatus.GREEN,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/publish`)
      .set(authHeader(finAccount.id, Role.ADMIN));

    expect(res.status).toBe(200);
    expect(res.body.case.taxReturnStatus).toBe('PENDING');
    expect(res.body.case.isFrozen).toBe(true);
  });
});
