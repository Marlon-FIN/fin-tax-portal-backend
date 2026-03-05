/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-001
 *
 * Given  Gültiger JWT (CUSTOMER)
 * And    Task existiert + rot + kein Freeze
 * When   POST /customers/:id/years/:year/tasks/:taskId/wrappers (mit PDF)
 * Then   201 Created
 * And    Wrapper mit Task-Name erstellt
 * And    Audit-Log Eintrag: "Upload: Dateiname.pdf"
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { createAccount, createCustomerProfile, createCase, createTask } from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-001 | AT-API-001: Upload via Task', () => {
  it('returns 201, creates wrapper and audit log entry', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    const taxCase = await createCase(profile.id, { taxYear: 2024, isFrozen: false });
    const task = await createTask(taxCase.id, { status: 'RED', isActive: true });

    const res = await request(app)
      .post(`/customers/${profile.id}/years/2024/tasks/${task.id}/wrappers`)
      .set(authHeader(account.id, Role.CUSTOMER))
      .attach('file', Buffer.from('%PDF-1.4 test'), {
        filename: 'Lohnausweis.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.wrapper).toBeDefined();
    expect(res.body.wrapper.taskId).toBe(task.id);

    const auditLog = await prisma.auditLog.findFirst({
      where: { actorAccountId: account.id },
    });
    expect(auditLog?.action).toBe('Upload: Lohnausweis.pdf');
  });
});
