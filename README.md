# FIN Tax Portal – Backend

Node.js + TypeScript + Prisma + PostgreSQL

## Specs

**Specs: fin-tax-portal-specs @ spec-v1.0**

→ https://github.com/Marlon-FIN/fin-tax-portal-specs
Lokaler Pfad: `../fin-tax-portal-specs`

## Struktur

```
/prisma       Prisma Schema + Migrations
/src          API Routes, Services, Middleware
/tests        Integrationstests (tc-###-*.int.test.ts)
```

## Tech Stack

| | |
|---|---|
| Runtime | Node.js + TypeScript |
| ORM | Prisma |
| Datenbank | PostgreSQL |
| Tests | Vitest + Supertest |

## Lokale Datenbank starten

```bash
cp .env.example .env
docker-compose up -d
```

Datenbank läuft auf: `postgresql://fin:fin_local@localhost:5432/fin_tax_portal`

## Nächster Schritt

Prisma Schema erstellen → siehe `../fin-tax-portal-specs/CLAUDE_PROMPTS.md` Prompt 3.
