import { randomUUID } from 'crypto';
import { prisma } from '../../../src/lib/prisma';
import {
  Role,
  MasterDataStatus,
  TrafficLightStatus,
  TaxReturnStatus,
  TaskStatus,
  Rubric,
} from '@prisma/client';

function uid(): string {
  return randomUUID().replace(/-/g, '');
}

export async function createAccount(overrides: Partial<{ email: string; role: Role }> = {}) {
  return prisma.account.create({
    data: {
      email: `test-${uid()}@example.com`,
      role: Role.CUSTOMER,
      ...overrides,
    },
  });
}

export async function createCustomerProfile(
  accountId: string,
  overrides: Record<string, unknown> = {},
) {
  const digits = uid().replace(/\D/g, '').slice(0, 12).padEnd(12, '0');
  return prisma.customerProfile.create({
    data: {
      accountId,
      ahvNumber: `756.${digits.slice(0, 4)}.${digits.slice(4, 8)}.${digits.slice(8, 10)}`,
      masterDataStatus: MasterDataStatus.COMPLETE,
      ...overrides,
    },
  });
}

export async function createCase(
  customerProfileId: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.case.create({
    data: {
      customerProfileId,
      taxYear: 2024,
      trafficLightStatus: TrafficLightStatus.RED,
      taxReturnStatus: TaxReturnStatus.DRAFT,
      isFrozen: false,
      ...overrides,
    },
  });
}

export async function createTask(
  caseId: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.task.create({
    data: {
      caseId,
      rubric: Rubric.INCOME,
      status: TaskStatus.RED,
      isActive: true,
      ...overrides,
    },
  });
}

export async function createWrapper(
  caseId: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.wrapper.create({
    data: { caseId, ...overrides },
  });
}

export async function createDocument(
  wrapperId: string,
  uploadedById: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.document.create({
    data: {
      wrapperId,
      mimeType: 'application/pdf',
      storageKey: `test/${uid()}/test.pdf`,
      uploadedById,
      ...overrides,
    },
  });
}
