/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-002
 *
 * Given  Tax Return = PENDING (Freeze aktiv)
 * When   POST /customers/:id/years/:year/tasks/:taskId/wrappers
 * Then   423 Locked
 * And    { "error": "FREEZE_ACTIVE" }
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaxReturnStatus } from '@prisma/client';
import { app } from '../../src/app';
import { createAccount, createCustomerProfile, createCase, createTask } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-002 | AT-API-002: Upload blockiert bei Freeze', () => {
  it('returns 423 FREEZE_ACTIVE when case is frozen', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    const taxCase = await createCase(profile.id, {
      taxYear: 2024,
      isFrozen: true,
      taxReturnStatus: TaxReturnStatus.PENDING,
    });
    const task = await createTask(taxCase.id, { status: 'RED' });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tasks/${task.id}/wrappers`)
      .set(authHeader(account.id, Role.CUSTOMER))
      .attach('file', Buffer.from('%PDF-1.4 test'), {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(423);
    expect(res.body.error).toBe('FREEZE_ACTIVE');
  });
});
