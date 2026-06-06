# ArenaBook - Project Knowledge Base

## Project Overview

**ArenaBook** is a sports arena booking and management platform built specifically for India.

The platform connects **sports arena owners** and **players** through a centralized booking system.

Arena owners can register their arenas, configure sports, courts, schedules, pricing, and booking rules. Players can browse available arenas, view schedules, and book slots online.

The platform consists of:

1. **Public Website (Player Portal)** - Used by players to discover and book sports arenas.
2. **Admin Panel (Arena Owner Portal)** - Used by arena owners to manage their business.
3. **Backend API** - Shared backend serving both the website and admin panel.

---

# Business Model

The booking system is completely wallet-based.

## Booking Flow

1. Player adds money to their wallet.
2. Player books a slot.
3. Booking amount is deducted from the player's wallet and placed on hold.
4. Based on the arena's cancellation policy:
   - Full refund
   - Partial refund
   - No refund

5. After the slot is completed, the held amount is credited to the arena owner's wallet.
6. Arena owners can withdraw available wallet balance.

## Payment Provider

- Cashfree
- Single Cashfree account used by the platform.
- Currently only test credentials are being used.

---

# Monorepo Structure

The project follows a monorepo architecture.

```text
root/
└── apps/
    ├── admin/   # Arena Owner Frontend
    ├── web/     # Public Website Frontend
    └── api/     # NestJS Backend
```

---

# User Types

## Arena Owner

Arena owners manage their sports facilities through the admin panel.

## Player

Players browse arenas and book sports slots through the public website.

---

# Admin (Arena Owner) Flow

## Registration

Arena owner creates an account using:

- Name
- Email
- Phone Number
- Password

Verification:

- Email OTP verification

---

## Dashboard

Displays business insights such as:

- Total bookings
- Upcoming bookings
- Revenue
- Wallet balance
- Transaction summary

---

## Arena Management

Arena owners can create and manage arenas.

### Arena Details

- Arena Name
- Description
- Address
- City
- Phone
- Email
- Latitude
- Longitude
- Arena Images
- Terms & Conditions
- Custom Booking Message

### Image Upload

All arena images must be uploaded and managed through Cloudinary.

---

## Games & Courts

Arena owners can:

### Create Sports

Examples:

- Badminton
- Cricket
- Football
- Tennis

### Create Courts

Each sport can contain multiple courts.

Example:

```text
Badminton
 ├── Court 1
 ├── Court 2
 └── Court 3
```

Court Configuration:

- Court Name
- Active Status
- Default Slot Duration

Example:

```text
Court 1
Slot Duration: 60 Minutes
```

---

## Slots & Pricing

Arena owners create reusable slot definitions.

Each slot contains:

- Game
- Court
- Start Time
- End Time
- Price
- Day Type

Supported Day Types:

```text
MONDAY
TUESDAY
WEDNESDAY
THURSDAY
FRIDAY
SATURDAY
SUNDAY
CUSTOM
```

### Available Actions

- Create Slot
- Edit Slot
- Delete Slot
- Block Slot
- Activate Slot

### Filters

- Filter by Sport
- Filter by Court

### Important Design Decision

These are slot templates (definitions).

Actual bookable slots should be generated dynamically when players view a specific date.

Do not create daily slot records for an entire year.

---

## Bookings

Arena owners can:

### View Bookings

Information displayed:

- Booking ID
- Player Name
- Phone Number
- Date
- Time
- Court
- Status
- Amount

### Create Booking

Admin-assisted booking flow:

1. Search player by:
   - Name
   - Phone Number

2. Select Player
3. Select Date
4. Select Sport
5. Select Court
6. Select Slot
7. Confirm Booking

This feature supports walk-in customers and phone reservations.

---

## Players

Arena owners can view player information.

### Information Displayed

- Name
- Email
- Phone Number
- Wallet Balance
- Total Bookings

### Features

- Search by Name
- Search by Phone Number

---

## Transactions

Arena owners can view:

### Wallet Balance

Amount available for withdrawal.

### Hold Amount

Amount reserved from bookings that has not yet been settled.

### Transaction History

Supported transaction types:

- Booking Credit
- Refund
- Settlement
- Withdrawal

### Withdraw Funds

Arena owners can request withdrawal of available wallet balance.

---

## Settings

### Cancellation Rules

Configurable by arena owner.

Examples:

```text
Cancel before 24 hours -> 100% refund

Cancel before 12 hours -> 50% refund

Cancel within 2 hours -> No refund
```

### Booking Closure Rule

Example:

```text
Close booking 30 minutes before slot start time
```

### Notifications

Future enhancement.

Examples:

- Email Notifications
- WhatsApp Notifications
- SMS Notifications

---

# Player Flow

## Registration

Player creates an account using:

- Name
- Email
- Phone Number
- Password

Verification:

- Email OTP verification

---

## Profile

Players can manage:

- Name
- Email
- Phone Number
- Wallet Balance

---

## Wallet

Features:

- Add Money
- View Wallet Balance
- View Transaction History

---

## My Bookings

Players can:

- View Upcoming Bookings
- View Past Bookings
- Cancel Bookings (based on arena cancellation rules)

---

## My Arenas

Players can favorite arenas.

Feature:

```text
Join Arena
```

Favorited arenas appear in:

```text
Profile → My Arenas
```

---

## Browse Arenas

Players can:

### View Arena List

Arena cards display:

- Arena Name
- Images
- City
- Sports Available
- Starting Price

### Arena Details

Arena detail page displays:

- Images
- Description
- Location
- Terms & Conditions
- Available Sports
- Courts
- Pricing
- Available Slots
- Custom Booking Message

### Booking Flow

1. Select Date
2. Select Sport
3. Select Court
4. Select Available Slot
5. Confirm Booking

Blocked or already booked slots must not be selectable.

---

# Technology Stack

## Frontend

- React.js
- Admin Panel
- Public Website

## Backend

- NestJS
- Prisma ORM

## Database

- PostgreSQL
- Supabase

## Payments

- Cashfree

## Image Storage

- Cloudinary

## UI Design

- Figma Make

## Email

- SMTP

---

# Development Principles

1. Keep the architecture modular and scalable.
2. Use Prisma transactions for booking and wallet operations.
3. Prevent double booking through database-level constraints and transactional booking logic.
4. Maintain complete wallet transaction history.
5. Keep slot definitions separate from actual booked slots.
6. Build APIs with future multi-arena scalability in mind.
7. Avoid hardcoding enum values in the Prisma schema; maintain constants at application code level.
8. Follow a clean NestJS module structure with Controllers, Services, DTOs, and Prisma repositories.
9. Design APIs that support both Admin and Player applications.
10. Prioritize correctness of booking, wallet, refund, and settlement flows over UI features.

---

# Future Enhancements

- WhatsApp Notifications
- SMS Notifications
- Multi-language Support
- Arena Reviews & Ratings
- Promo Codes & Discounts
- Membership Plans
- Tournament Management
- Coach Booking
- Subscription-Based SaaS Plans for Arena Owners

---

This document should be treated as the primary source of truth for ArenaBook development.
