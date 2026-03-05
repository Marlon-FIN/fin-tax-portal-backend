/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-005
 *
 * Given  JWT (FIN_SACHBEARBEITER) [mapped: Role.ADVISOR]
 * And    Ampel = GREEN
 * When   POST /customers/:id/years/:year/tax-declaration/publish
 * Then   403 Forbidden
 * And    { "error": "ROLE_INSUFFICIENT" }
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TrafficLightStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-005 | AT-API-005: Sachbearbeiter kann nicht publizieren', () => {
  it('returns 403 ROLE_INSUFFICIENT for ADVISOR (FIN_SACHBEARBEITER)', async () => {
    const advisorAccount = await createAccount({ role: Role.ADVISOR });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      trafficLightStatus: TrafficLightStatus.GREEN,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/publish`)
      .set(authHeader(advisorAccount.id, Role.ADVISOR));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ROLE_INSUFFICIENT');
  });
});
