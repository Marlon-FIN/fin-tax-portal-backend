/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | TC-SEC-001
 *
 * Given  Customer B ist eingeloggt
 * And    Dokument gehört Customer A (anderer customerProfileId)
 * When   GET /customers/<A_id>/years/2024/files/<docId>/download
 * Then   403 IDOR_FORBIDDEN
 *
 * Testet: IDOR-Schutz — Zugriff auf fremde Dokumente ist verboten.
 * Ref: security/SECURITY_BASELINE_AWS.md §4.3
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

describe('TC-SEC-001: IDOR – Fremddokument zugriff verboten', () => {
  it('returns 403 IDOR_FORBIDDEN when customer B accesses customer A document', async () => {
    // Customer A owns a document
    const accountA = await createAccount({ role: Role.CUSTOMER });
    const profileA = await createCustomerProfile(accountA.id);
    const caseA = await createCase(profileA.id, { taxYear: 2024 });
    const wrapperA = await createWrapper(caseA.id);
    const docA = await createDocument(wrapperA.id, accountA.id);

    // Customer B is a completely different user
    const accountB = await createAccount({ role: Role.CUSTOMER });

    // B tries to download A's document using A's customerId
    const res = await request(app)
      .get(`/customers/${profileA.id}/years/2024/files/${docA.id}/download`)
      .set(authHeader(accountB.id, Role.CUSTOMER));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('IDOR_FORBIDDEN');
  });

  it('returns 200 when customer A accesses their own document', async () => {
    const accountA = await createAccount({ role: Role.CUSTOMER });
    const profileA = await createCustomerProfile(accountA.id);
    const caseA = await createCase(profileA.id, { taxYear: 2024 });
    const wrapperA = await createWrapper(caseA.id);
    const docA = await createDocument(wrapperA.id, accountA.id);

    const res = await request(app)
      .get(`/customers/${profileA.id}/years/2024/files/${docA.id}/download`)
      .set(authHeader(accountA.id, Role.CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
  });
});
