# AI Agent Instructions for ArenaBook

This document defines rules that ALL AI agents (Codex, Copilot, Cursor, etc.) must follow when working on this codebase. These rules exist because past violations caused data loss and unintended breaking changes.

---

## CRITICAL: Things you must NEVER do without explicit user confirmation

### Database
- **Never run `prisma migrate deploy`, `prisma migrate dev`, or any destructive migration command** without the user explicitly typing "run the migration" or equivalent.
- **Never reset the database** (`prisma migrate reset`, `prisma db push --force-reset`, or similar).
- **Never drop tables, columns, or relations** directly or via a migration you trigger autonomously.
- **Never seed or wipe production data.**
- If a migration is needed, generate it and show the user the SQL diff first. Wait for approval before running it.

### External Services & APIs
- **Never switch a third-party service/provider** (email provider, payment gateway, SMS provider, etc.) without first presenting all available options and waiting for the user to choose one.
- **Never add API keys, secrets, or credentials** to any file — always ask the user to provide and place them.
- **Never make calls to paid external APIs** during development/testing without confirming it won't incur unexpected charges.

### Infrastructure & Deployment
- **Never push to `main` or any production branch** without explicit instruction.
- **Never modify CI/CD pipeline files** (render.yaml, vercel.json at root, GitHub Actions, etc.) without asking first.
- **Never change environment variable values** in hosted environments (Render, Vercel, etc.) — only suggest what to change and where.

---

## Things you must ALWAYS do

### Before implementing anything non-trivial
- **Present options first.** If there are multiple valid approaches (e.g. different email providers, auth strategies, DB schema designs), list them with trade-offs and wait for the user to choose. Do not pick one and implement it unilaterally.
- **Confirm scope before starting** on tasks that touch the database schema, authentication, payments, or email/SMS delivery.

### When writing database migrations
- Generate the migration file and show the user what SQL it will execute.
- Explicitly call out any destructive operations (DROP, ALTER that removes a column, data transforms).
- Wait for a clear "go ahead" before running it.

### When installing packages
- Prefer installing in the specific app directory (`apps/api`, `apps/web`, `apps/admin`) rather than the root, to avoid disrupting the pnpm workspace.
- Use `--ignore-scripts` if the root has a `husky` postinstall hook that fails in the current environment.

---

## Project context

- **Monorepo structure:** `apps/api` (NestJS), `apps/web` (React/Vite), `apps/admin` (React/Vite)
- **Database:** PostgreSQL via Prisma ORM — hosted on a managed cloud instance
- **Hosting:** API on Render (free tier), Web & Admin on Vercel
- **Package manager:** pnpm (workspace) — avoid running plain `npm install` at the repo root

---

## Tone & process

- If unsure whether an action is safe, **ask first, act second.**
- Prefer reversible actions. Flag irreversible ones explicitly before taking them.
- Do not explain what you did after the fact if the action could have caused harm — the priority is to not take the action in the first place.
