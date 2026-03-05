/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-003
 *
 * Given  JWT (FIN_MANDATSLEITER) [mapped: Role.ADMIN]
 * And    Mind. 1 aktiver Task ist rot (trafficLightStatus != GREEN)
 * When   POST /customers/:id/years/:year/tax-declaration/publish
 * Then   422 Unprocessable Entity
 * And    { "error": "AMPEL_NOT_GREEN" }
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TrafficLightStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-003 | AT-API-003: Publish Gate – Ampel nicht grün', () => {
  it('returns 422 AMPEL_NOT_GREEN when trafficLightStatus is RED', async () => {
    const finAccount = await createAccount({ role: Role.ADMIN });
    const customerAccount = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(customerAccount.id);
    await createCase(profile.id, {
      taxYear: 2024,
      trafficLightStatus: TrafficLightStatus.RED,
    });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tax-declaration/publish`)
      .set(authHeader(finAccount.id, Role.ADMIN));

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('AMPEL_NOT_GREEN');
  });
});
