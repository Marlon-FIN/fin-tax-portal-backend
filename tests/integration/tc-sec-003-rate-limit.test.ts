/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | TC-SEC-003
 *
 * Given  Download-Endpoint ist rate-limited (DOWNLOAD_RATE_LIMIT_MAX=2 in Tests)
 * When   Mehr als MAX Requests in einem Fenster gesendet werden
 * Then   429 TOO_MANY_REQUESTS
 * And    RateLimit-Header sind in der Response enthalten
 *
 * Testet: Rate Limiting ist aktiv auf Download-Endpoints.
 * Ref: security/SECURITY_BASELINE_AWS.md §6
 * Note: DOWNLOAD_RATE_LIMIT_MAX=2 gesetzt in vitest.config.ts
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';
import { app } from '../../src/app';
import {
  createAccount,
  createCustomerProfile,
  createCase,
  createWrapper,
  createDocument,
} from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-SEC-003: Rate Limit auf Download-Endpoint', () => {
  it('returns 429 TOO_MANY_REQUESTS after exceeding DOWNLOAD_RATE_LIMIT_MAX', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    const taxCase = await createCase(profile.id, { taxYear: 2024 });
    const wrapper = await createWrapper(taxCase.id);
    const doc = await createDocument(wrapper.id, account.id);

    const url = `/customers/${profile.id}/years/2024/files/${doc.id}/download`;
    const headers = authHeader(account.id, Role.CUSTOMER);

    // First requests should succeed (up to DOWNLOAD_RATE_LIMIT_MAX=2)
    const res1 = await request(app).get(url).set(headers);
    const res2 = await request(app).get(url).set(headers);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Rate limit headers present on successful response
    expect(res1.headers['ratelimit-limit'] ?? res1.headers['x-ratelimit-limit']).toBeDefined();

    // Third request should be rate limited
    const res3 = await request(app).get(url).set(headers);
    expect(res3.status).toBe(429);
    expect(res3.body.error).toBe('TOO_MANY_REQUESTS');
  });
});
