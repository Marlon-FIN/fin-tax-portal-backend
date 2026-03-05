# FIN Tax Portal – Backend

Node.js + TypeScript + Prisma + PostgreSQL

## Specs

Alle Spezifikationen sind in einem separaten Repo:
→ https://github.com/Marlon-FIN/fin-tax-portal-specs (spec-v1.0)

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

## Nächster Schritt

Prisma Schema erstellen → siehe `../fin-tax-portal-specs/CLAUDE_PROMPTS.md` Prompt 2.
