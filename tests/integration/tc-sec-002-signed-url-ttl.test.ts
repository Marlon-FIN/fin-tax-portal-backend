/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | TC-SEC-002
 *
 * Given  Customer ist eingeloggt + Dokument existiert
 * When   GET /customers/:id/years/:year/files/:fileId/download
 * Then   200 OK
 * And    URL enthält X-Amz-Expires (TTL-Parameter)
 * And    ttlSeconds in Response = konfigurierter Wert (60–120s)
 *
 * Testet: Signed URLs sind kurzlebig (nie permanente URLs).
 * Ref: security/SECURITY_BASELINE_AWS.md §4.2
 * Note: Nutzt MockProvider (STORAGE_PROVIDER=mock in vitest.config.ts)
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

describe('TC-SEC-002: Signed URL ist kurzlebig (TTL)', () => {
  it('returns signed URL with X-Amz-Expires parameter', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    const taxCase = await createCase(profile.id, { taxYear: 2024 });
    const wrapper = await createWrapper(taxCase.id);
    const doc = await createDocument(wrapper.id, account.id);

    const res = await request(app)
      .get(`/customers/${profile.id}/years/2024/files/${doc.id}/download`)
      .set(authHeader(account.id, Role.CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
    expect(res.body.ttlSeconds).toBeGreaterThanOrEqual(60);
    expect(res.body.ttlSeconds).toBeLessThanOrEqual(120);
    // Mock URL contains X-Amz-Expires — in prod: real AWS pre-signed URL
    expect(res.body.url).toContain('X-Amz-Expires');
  });
});
