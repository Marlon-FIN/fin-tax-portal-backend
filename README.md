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

## Setup

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Datenbank starten
docker compose up -d

# 3. Prisma Client generieren + erste Migration ausführen
npx prisma migrate dev --name init

# 4. Server starten
npm run dev
```

Server läuft auf: `http://localhost:3000`
Health-Check: `GET http://localhost:3000/health` → `{ "status": "ok" }`

## Prisma

```bash
# Client neu generieren (nach Schema-Änderungen)
npx prisma generate

# Migration erstellen
npx prisma migrate dev --name <name>

# DB-Studio öffnen
npx prisma studio
```
