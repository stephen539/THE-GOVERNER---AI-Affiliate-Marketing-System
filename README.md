# THE GOVERNER - AI Affiliate Marketing System

THE GOVERNER is a production-oriented autonomous affiliate marketing command center for AI-generated digital image offers.
This repository contains a React/Vite dashboard, Express API, WebSocket telemetry, and Drizzle PostgreSQL schema foundation.

## Stack

- React + Vite + TypeScript
- TanStack React Query with 30-second refresh
- Recharts dashboard visualizations
- Express + TypeScript API
- WebSocket telemetry stream at `/ws`
- Drizzle ORM schema for PostgreSQL

## Development

```bash
npm install
npm run dev
```

The development server listens on port `5000` by default. Vite proxies `/api` and `/ws` during client development.

## Verification

```bash
npm run check
npm run build
npm audit --omit=dev
```

## Production publishing checklist

All production work targets `https://guvnorregent.xyz`.

Before enabling live production mode:

1. Run the Publish DB-schema flow for the Drizzle tables in `shared/schema.ts`.
2. Set `DATABASE_URL`.
3. Set `ADMIN_TOKEN` for deployment-mode controls.
4. Set `API_KEY_VAULT_SECRET` before using key-vault workflows.
5. Confirm AI gateway secrets are available in dev and prod.
6. Configure Resend with `RESEND_FROM_EMAIL` on a verified domain and `RESEND_WEBHOOK_SECRET`.

The hidden deployment console is available at `/admin`. It will not switch modes unless `ADMIN_TOKEN` is configured and
provided via the UI.
