# Non-Functional Requirements

## Authentication & Authorization

### Arena Owners

- Login using Email + Password.
- Email OTP verification during registration.
- JWT-based authentication.
- Protected admin routes.
- Future support for multiple staff members under a single arena owner account.

### Players

- Login using Email + Password.
- Email OTP verification during registration.
- JWT-based authentication.
- Protected player routes.

### Security

- Passwords must be hashed using bcrypt.
- Never store plain text passwords.
- Access tokens should expire.
- Refresh token support can be added later.

---

# Booking Reliability

The booking system is the most critical part of the application.

### Requirements

- Prevent double booking of slots.
- Use database transactions for booking operations.
- Wallet deduction and booking creation must occur within the same transaction.
- If any operation fails, the entire transaction must rollback.
- Slot status must always remain consistent.

### Booking Locking

When multiple users attempt to book the same slot:

- Only one booking should succeed.
- Other requests should receive an appropriate error response.
- Database-level protection should be preferred over application-level protection.

---

# Wallet System

Wallet balances must always be accurate.

### Rules

- Every wallet movement must create a WalletTransaction record.
- Never directly modify wallet balances without recording a transaction.
- Wallet balance should always match transaction history.
- Support both player wallets and owner wallets.

### Transaction Types

Examples:

- BOOKING
- REFUND
- MANUAL_CREDIT
- MANUAL_DEBIT
- SETTLEMENT
- WITHDRAWAL

---

# API Standards

### Response Format

All APIs should follow a consistent response structure.

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

### Validation

- Validate all incoming request payloads.
- Use DTOs and class-validator.
- Reject invalid requests before reaching service logic.

---

# Error Handling

### Requirements

- Handle all exceptions gracefully.
- Do not expose internal database errors.
- Return user-friendly messages.
- Log detailed errors internally.

Examples:

- Slot already booked.
- Insufficient wallet balance.
- Invalid OTP.
- Arena not found.
- Court not found.

---

# Logging

### Application Logs

Log important business events:

- User registration
- Player registration
- Login attempts
- Wallet recharge
- Wallet withdrawal
- Booking creation
- Booking cancellation
- Refund processing

### Error Logs

Store:

- Error message
- API endpoint
- User ID (if available)
- Timestamp

---

# Audit Trail

Maintain auditability for critical actions.

Examples:

- Arena created
- Arena updated
- Slot created
- Slot edited
- Slot deleted
- Cancellation rules changed
- Withdrawal requested

Future enhancement:

- Create a dedicated AuditLog table.

---

# Rate Limiting

Protect public APIs from abuse.

Examples:

- Login API
- Registration API
- OTP Verification API
- Forgot Password API

Suggested limits:

- 5 login attempts per minute
- 5 OTP requests per 10 minutes

---

# Image Management

### Cloudinary

Arena images must:

- Be stored in Cloudinary.
- Support multiple images per arena.
- Store only URLs in the database.

### Validation

- Allowed formats:
  - JPG
  - JPEG
  - PNG
  - WEBP

- Maximum image size:
  - 5 MB

---

# Database Requirements

### PostgreSQL

Primary database:

- PostgreSQL (Supabase)

### Indexing

Ensure indexes exist for:

- Phone numbers
- Email addresses
- Booking status
- Booking dates
- Arena city
- Foreign keys

### Migrations

- All schema changes must be migration-based.
- Never manually modify production database structures.

---

# Performance

### API Response Time

Target:

- Less than 500ms for standard APIs.
- Less than 2 seconds for dashboard reports.

### Pagination

Mandatory for:

- Bookings
- Transactions
- Players
- Arenas

Large datasets should never be returned in a single response.

---

# Caching (Future Enhancement)

Potential candidates:

- Arena listings
- Arena details
- Popular arenas
- Sports list

Suggested technology:

- Redis

Caching should not affect booking accuracy.

---

# Notifications (Future Enhancement)

Support:

- Email
- WhatsApp
- SMS

Trigger Events:

- Registration
- Booking Confirmation
- Booking Cancellation
- Refund Processed
- Wallet Recharge
- Withdrawal Status

---

# Monitoring & Health Checks

### Health Endpoint

Provide:

```http
GET /health
```

Checks:

- Database connectivity
- API availability

### Monitoring

Future options:

- Sentry
- OpenTelemetry
- Grafana

---

# Deployment

### Frontend

- Vercel

Applications:

- Admin Portal
- Public Website

### Backend

- Render / Railway / Fly.io (depending on free-tier availability)

### Database

- Supabase PostgreSQL

### Storage

- Cloudinary

---

# Backup Strategy

### Database

- Enable Supabase backups whenever possible.

### Critical Data

Must never be lost:

- Bookings
- Wallet transactions
- Arena details
- Player information

---

# Coding Standards

### Backend

- NestJS module-based architecture.
- Controllers should contain minimal business logic.
- Business logic should remain in services.
- Prisma should be accessed through a centralized PrismaService.

### Frontend

- Reusable components.
- API layer separated from UI components.
- Environment variables for API URLs.
- Consistent folder structure.

---

# Important Business Rules

1. Wallet balance can never become negative.
2. A slot can never have more than one active booking.
3. Booking and wallet operations must always be transactional.
4. Every wallet balance change must create a transaction record.
5. Owner settlements must be traceable.
6. Arena owners can only access their own arena data.
7. Players can only access their own bookings and wallet information.
8. Booking accuracy is more important than performance optimizations.
9. Never trust client-side calculations for wallet or booking amounts.
10. The database is the source of truth for all booking and wallet operations.
