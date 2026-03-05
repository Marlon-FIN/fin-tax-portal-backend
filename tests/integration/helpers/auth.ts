import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const TEST_JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-do-not-use-in-production';

export function makeToken(accountId: string, role: Role): string {
  return jwt.sign({ sub: accountId, role }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

export function authHeader(accountId: string, role: Role): Record<string, string> {
  return { Authorization: `Bearer ${makeToken(accountId, role)}` };
}
