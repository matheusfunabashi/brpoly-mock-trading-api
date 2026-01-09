# BrPoly Backend (Fastify + Prisma)

## Quick start

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

The API listens on `PORT` (default `3001`).

## Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret for signing JWT bearer tokens.
- `PORT`: HTTP port (defaults to 3001).

## Seed data

- User: `maria@example.com` / `Pass123!`
- Markets + trades align with `openapi.yaml` probabilities.

## Frontend real mode

From repo root:

```bash
npm install
npm run dev        # runs frontend + backend
```

Ensure `.env.local` contains:

```
VITE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3001
```


