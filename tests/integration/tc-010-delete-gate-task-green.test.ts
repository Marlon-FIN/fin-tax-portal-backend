/**
 * Spec: fin-tax-portal-specs @ spec-v1.0 | AT-API-010
 *
 * Given  JWT (CUSTOMER)
 * And    Task = grün
 * When   DELETE /customers/:id/years/:year/files/:fileId
 * Then   422 Unprocessable Entity
 * And    { "error": "TASK_NOT_RED" }
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Role, TaskStatus } from '@prisma/client';
import { app } from '../../src/app';
import {
  createAccount,
  createCustomerProfile,
  createCase,
  createTask,
  createWrapper,
  createDocument,
} from './helpers/factories';
import { authHeader } from './helpers/auth';

describe('TC-010 | AT-API-010: Delete-Gate – Task grün', () => {
  it('returns 422 TASK_NOT_RED when the associated task is GREEN', async () => {
    const account = await createAccount({ role: Role.CUSTOMER });
    const profile = await createCustomerProfile(account.id);
    const taxCase = await createCase(profile.id, { taxYear: 2024, isFrozen: false });
    const task = await createTask(taxCase.id, { status: TaskStatus.GREEN });
    const wrapper = await createWrapper(taxCase.id, { taskId: task.id });
    const doc = await createDocument(wrapper.id, account.id);

    const res = await request(app)
      .delete(`/customers/${profile.id}/years/2024/files/${doc.id}`)
      .set(authHeader(account.id, Role.CUSTOMER))
      .send({ confirmation: 'DELETE' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('TASK_NOT_RED');
  });
});
