import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// TODO: Rename Role values in schema to FIN_MANDATSLEITER / FIN_SACHBEARBEITER
// Current mapping: ADMIN = FIN_MANDATSLEITER, ADVISOR = FIN_SACHBEARBEITER, CUSTOMER = Kunde

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-do-not-use-in-production';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'ROLE_INSUFFICIENT' });
      return;
    }
    next();
  };
}
