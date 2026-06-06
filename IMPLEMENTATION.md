# ArenaBook — Implementation Guide

## Overview

ArenaBook is a sports arena booking platform with three applications:

| App | Description | Default Port |
|-----|-------------|-------------|
| `apps/api` | NestJS REST API | 3000 |
| `apps/admin` | Arena Owner Dashboard (React) | 5173 |
| `apps/web` | Player Booking Website (React) | 5174 |

---

## Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL (via Supabase)
- Cloudinary account (for arena image uploads)
- Cashfree account (for wallet top-up — test credentials work)

---

## 1. Environment Setup

### API (`apps/api/.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=3000

# Email (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Cashfree (use TEST credentials for development)
CASHFREE_APP_ID="your-cashfree-app-id"
CASHFREE_SECRET_KEY="your-cashfree-secret"
CASHFREE_ENV="TEST"

# App URLs
API_URL="http://localhost:3000"
ADMIN_URL="http://localhost:5173"
WEB_URL="http://localhost:5174"
```

### Admin (`apps/admin/.env`)

```env
VITE_API_URL=http://localhost:3000
```

### Web (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_CASHFREE_ENV=TEST
```

---

## 2. Database Setup

The project uses Supabase PostgreSQL. The schema is managed via Prisma.

```bash
# From apps/api/
cd apps/api

# Apply schema to database (development)
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

---

## 3. Running the Project

### Option A: Run each app separately (recommended for development)

```bash
# Terminal 1 — API
cd apps/api
npm install
npm run start:dev

# Terminal 2 — Admin Panel
cd apps/admin
npm install
npm run dev

# Terminal 3 — Web (Player Portal)
cd apps/web
npm install
npm run dev
```

### Option B: Build for production

```bash
# API
cd apps/api
npm run build
npm run start:prod

# Admin
cd apps/admin
npm run build
# Serve dist/ via nginx or Vercel

# Web
cd apps/web
npm run build
# Serve dist/ via nginx or Vercel
```

---

## 4. API Reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/auth/admin/register` | `{email, password}` | Admin registration (sends OTP) |
| POST | `/auth/admin/verify-otp` | `{name, email, phone, otp}` | Verify OTP + get JWT |
| POST | `/auth/admin/login` | `{email, password}` | Admin login |
| POST | `/auth/player/register` | `{email, password}` | Player registration (sends OTP) |
| POST | `/auth/player/verify-otp` | `{name, email, phone, otp}` | Verify OTP + get JWT |
| POST | `/auth/player/login` | `{email, password}` | Player login |

> All protected routes require: `Authorization: Bearer <token>`

### Arena

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/arena/public` | No | List public arenas (filter: ?city=&sport=) |
| GET | `/arena/public/:id` | No | Arena detail with courts |
| POST | `/arena` | Admin | Create arena |
| PATCH | `/arena/:id` | Admin | Update arena |
| GET | `/arena` | Admin | Get my arena |

### Games & Courts

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/games/arena/:arenaId` | No | List games for arena |
| POST | `/games` | Admin | Create game `{name, arenaId}` |
| PATCH | `/games/:id` | Admin | Update game |
| DELETE | `/games/:id` | Admin | Delete game |
| GET | `/games/courts/game/:gameTypeId` | No | List courts for game |
| POST | `/games/courts` | Admin | Create court `{name, gameTypeId, slotDuration?}` |
| PATCH | `/games/courts/:id` | Admin | Update court |
| DELETE | `/games/courts/:id` | Admin | Delete court |

### Slots

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/slots/available?courtId=&date=` | No | Get available slots for date |
| GET | `/slots/court/:courtId` | Admin | Get all slot groups for court |
| POST | `/slots/groups` | Admin | Create slot group `{courtId, dayType, price?}` |
| PUT | `/slots/groups/:id` | Admin | Update slot group |
| DELETE | `/slots/groups/:id` | Admin | Delete slot group |
| POST | `/slots/groups/:id/definitions` | Admin | Add slot time `{startTime, endTime, price?}` |
| PUT | `/slots/definitions/:id` | Admin | Update slot time |
| DELETE | `/slots/definitions/:id` | Admin | Delete slot time |
| POST | `/slots/block` | Admin | Block a slot `{courtId, date, startTime, endTime, price}` |
| POST | `/slots/unblock` | Admin | Unblock a slot |

### Bookings

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/bookings` | Player | Create booking |
| POST | `/bookings/admin` | Admin | Admin creates booking for player |
| GET | `/bookings/player` | Player | My bookings |
| GET | `/bookings/arena/:arenaId` | Admin | Arena bookings (filter: ?status=) |
| GET | `/bookings/:id` | Player/Admin | Get booking |
| PATCH | `/bookings/:id/cancel` | Player/Admin | Cancel booking |

### Wallet

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/wallet/player` | Player | Player wallet balance |
| GET | `/wallet/admin` | Admin | Owner wallet balance |
| GET | `/wallet/transactions` | Player/Admin | Transaction history |
| POST | `/wallet/recharge/initiate` | Player | Initiate Cashfree payment `{amount}` |
| POST | `/wallet/recharge/verify` | No | Verify payment `{orderId}` |
| POST | `/wallet/recharge/webhook` | No | Cashfree webhook |
| POST | `/wallet/withdraw` | Admin | Request withdrawal |

### Settings

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/settings?arenaId=` | Admin | Get arena settings |
| PUT | `/settings` | Admin | Save settings `{arenaId, bookingCloseMins, cancellationRules[]}` |

### Dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/dashboard/stats?arenaId=` | Admin | Dashboard stats |

### Player Profile

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/player/profile` | Player | Get profile |
| PATCH | `/player/profile` | Player | Update `{name?, phone?}` |
| GET | `/player/arenas` | Player | My favourite arenas |
| POST | `/player/arenas/:arenaId/join` | Player | Add to favourites |
| DELETE | `/player/arenas/:arenaId` | Player | Remove from favourites |
| GET | `/player/list` | Admin | List/search all players |

---

## 5. Business Flow

### Admin Onboarding

1. Register at `/register` (admin portal)
2. Verify email OTP at `/verify-otp`
3. Go to Arena Management → create arena
4. Go to Games & Courts → add sports + courts
5. Go to Slots & Pricing → select sport → select court → add day schedules + times
6. Go to Settings → set cancellation rules + booking closure time

### Player Booking

1. Register at `/register` (web portal)
2. Verify email OTP
3. Dashboard → Wallet → Add Money (Cashfree test)
4. Browse Arenas → select arena → select sport/court/date/slot
5. Confirm Booking → amount deducted from wallet
6. View bookings in Dashboard → My Bookings

---

## 6. Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, Prisma, PostgreSQL (Supabase) |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Auth | JWT (7-day expiry), Email OTP (bcrypt hashed) |
| Payments | Cashfree PG (test mode) |
| Images | Cloudinary (URLs stored in DB) |
| Email | Nodemailer (Gmail SMTP) |

---

## 7. Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` to your production API URL
4. Deploy

### Backend (Render/Railway)

1. Connect GitHub repo
2. Set root directory to `apps/api`
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add all environment variables

### Database

Using Supabase PostgreSQL — already connected. Run `npx prisma db push` once to sync the schema to production.

---

## 8. Cashfree Test Credentials

For development, use Cashfree sandbox:
- Sandbox dashboard: https://merchant.cashfree.com/
- Test card: `4111 1111 1111 1111`, expiry `09/26`, CVV `123`

Set `CASHFREE_ENV=TEST` and use test App ID + Secret from the Cashfree sandbox.

---

## 9. Known Limitations / Future Work

- Cashfree webhook URL needs to be publicly accessible (use ngrok in dev)
- Cloudinary image upload widget not yet integrated in Arena Management (URLs can be added manually)
- Settlement (crediting arena owner wallet after slot completion) needs a scheduled job
- WhatsApp/SMS notifications are future enhancements
