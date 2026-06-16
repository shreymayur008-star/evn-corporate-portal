# EVN Digital Portal — Eletricidade Vantara Nacional, E.P.

> **Live Production URL:** https://evn-corporate-portal.vercel.app  
> **Advanced Web Technologies — Examination Project 2026**  
> **Student:** Shrey Mayur

---

## Project Overview

The EVN Digital Portal is a full-stack, enterprise-grade web application built for **Eletricidade Vantara Nacional, E.P.** — Mozambique's national electricity operator. The system provides citizens with a unified digital access point for all utility services and includes a professional Content Management System for EVN operational staff.

---

## Live Demo

| Surface | URL |
|---|---|
| Public Portal | https://evn-corporate-portal.vercel.app |
| Admin CMS | https://evn-corporate-portal.vercel.app/admin/cms |

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.1 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| CSS Framework | Tailwind CSS | v4 |
| Animation | Framer Motion | 11.x |
| ORM | Prisma | 7.x |
| Database | PostgreSQL (Neon Cloud) | 16 |
| Admin Auth | NextAuth | v5 beta |
| Public Auth | Custom JWT (jose) | 5.x |
| Validation | Zod | 3.x |
| Email | Resend | 6.x |
| Analytics | Supabase | - |
| Payments | Vodacom MZ MPesa API | - |
| Deployment | Vercel Edge Network | - |

---

## Examination Exercises — 4 Completed

### Exercise 1 — Supabase Visitor Analytics

**What was built:** A silent, invisible visitor analytics tracker that captures and stores data for up to 10 unique visitors in a separate Supabase PostgreSQL database.

**Key files:**
- `lib/supabase-analytics.ts` — Supabase client
- `lib/visitorData.ts` — Browser and device detection helpers
- `components/ui/VisitorTracker.tsx` — Silent client component (renders null)

**Data captured per visitor:**

| Field | Description |
|---|---|
| mobile | Boolean — true if mobile device |
| location | City and country via ipapi.co geolocation |
| browser | Browser name and version from userAgent |
| session_time | Seconds on site — tracked via beforeunload |
| screen_size | Screen resolution (e.g. 1920x1080) |
| os | Operating system (Windows, iOS, Android, macOS) |
| device_type | Mobile, Tablet, or Desktop |
| ip_address | Visitor IP address |

**Technical details:**
- Supabase project: EVN-ANALYTICS
- Table: `visitor_analytics` (12 columns)
- 10-visitor limit enforced via count check before every insert
- Injected into root layout — completely invisible to visitors

---

### Exercise 2 — Contact Form with OTP Email Verification

**What was built:** A two-step email identity verification flow integrated into the EVN Customer Support modal. Users submit a contact form, receive a 6-digit OTP by email, and must verify before the message is saved.

**Key files:**
- `app/api/contact/send-otp/route.ts` — Generates OTP, saves to DB, sends branded email
- `app/api/contact/verify-otp/route.ts` — Validates OTP, marks used, saves ContactMessage
- `components/modals/ContactModal.tsx` — 3-step UI: form → OTP input → success

**Security features:**
- OTP expires after 10 minutes
- Single-use — blocked after first verification
- Old OTPs deleted before issuing new ones
- ContactMessage saved ONLY after verified OTP
- 60-second resend countdown timer

**Prisma model:**
```prisma
model OtpVerification {
  id        String   @id @default(cuid())
  email     String
  otp       String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

### Exercise 3 — Shopping Cart and Checkout with Email Notification

**What was built:** The Credelec pre-paid energy top-up modal redesigned as a full multi-item shopping cart and checkout system with order confirmation emails.

**Key files:**
- `app/api/orders/create/route.ts` — Validates cart, saves order, sends confirmation email
- `app/api/orders/[ref]/route.ts` — Get/update order by reference
- `components/modals/CredelecModal.tsx` — 4-step cart → checkout → payment → confirmation

**Cart features:**
- 11-digit meter number validation with live progress bar
- Amount selector: 50, 100, 200, 500, 1000 MZN
- Multi-item cart — duplicate meters blocked
- Running total updates dynamically
- Order confirmation email sent via Resend

**Prisma model:**
```prisma
model Order {
  id         String      @id @default(cuid())
  orderRef   String      @unique
  nome       String
  email      String
  phone      String
  items      Json
  total      Float
  status     OrderStatus @default(PENDING)
  paymentRef String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  CANCELLED
}
```

---

### Exercise 4 — Real Vodacom Mozambique MPesa Payment Integration

**What was built:** A complete, production-grade integration with the real Vodacom Mozambique MPesa Business API. Real USSD popups appear on customer phones. Real Vodacom transaction IDs are returned. No simulation.

**Key files:**
- `lib/mpesa-mz.ts` — RSA-4096 authentication, C2B via mpesa-node-api, query, reversal
- `app/api/payment/mpesa-mz/initiate/route.ts` — C2B payment initiation + background polling
- `app/api/payment/mpesa-mz/callback/route.ts` — Vodacom payment confirmation webhook
- `app/api/payment/mpesa-mz/query/route.ts` — Transaction status polling
- `app/api/payment/mpesa-mz/reversal/route.ts` — Admin B2C refund (admin only)
- `app/api/payment/mpesa-mz/manual-confirm/route.ts` — Manual PIN confirmation
- `app/api/orders/stream/[ref]/route.ts` — Server-Sent Events real-time updates

**Authentication:**
Vodacom MZ uses RSA-4096 encryption — not OAuth. The API Key is encrypted using the 4096-bit RSA Public Key and sent as a Bearer token on every request:

```typescript
const encrypted = crypto.publicEncrypt(
  { key: pubKeyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
  Buffer.from(apiKey, 'utf8')
)
const bearer = encrypted.toString('base64')
// Header: Authorization: Bearer {bearer}
```

**Payment flow:**
1. Customer enters Mozambican phone number (+258 84/85/86/82/83)
2. System calls Vodacom MZ C2B API via `mpesa-node-api` package
3. Real USSD popup appears on customer's phone
4. Customer enters MPesa PIN
5. Background polling detects confirmation via Vodacom query API
6. Order updates to PAID — SSE pushes update to browser in real-time
7. Payment receipt email sent via Resend with real Vodacom transaction ID

**All 10 Vodacom response codes handled:**

| Code | Meaning |
|---|---|
| INS-0 | Payment processed successfully |
| INS-5 | Transaction cancelled by customer |
| INS-6 | Transaction failed |
| INS-9 | Request timed out |
| INS-10 | Phone not registered on MPesa |
| INS-13 | Cannot initiate transaction |
| INS-993 | Authentication failed |
| INS-2006 | Insufficient MPesa balance |
| INS-2051 | Wrong PIN too many times |
| INS-2057 | Daily transaction limit exceeded |

**Server-Sent Events:**
Real-time order status updates using the browser's native `EventSource` API. When Vodacom confirms payment, the database updates and the SSE stream pushes the status change to the browser — no page refresh required.

**CMS Encomendas Tab:**
Admin dashboard tab showing all orders with real Vodacom transaction IDs, status badges, search/filter, and a refund button that calls the real Vodacom B2C reversal API.

---

## Project Architecture

```
├── app/
│   ├── page.tsx                    # Public homepage — 16 service modals
│   ├── layout.tsx                  # Root server layout — admin button injection
│   ├── admin/cms/page.tsx          # CMS dashboard — 6 tabs
│   └── api/
│       ├── contact/                # OTP send and verify
│       ├── orders/                 # Create, get, stream (SSE)
│       ├── payment/mpesa-mz/       # Initiate, callback, query, reversal, confirm
│       ├── admin/                  # Protected CRUD endpoints
│       └── auth/user/              # Public user authentication
├── components/
│   ├── modals/                     # 16 public service modals
│   ├── admin/                      # CMS components
│   └── ui/                         # Shared UI components
├── lib/
│   ├── mpesa-mz.ts                 # Vodacom MZ API integration
│   ├── supabase-analytics.ts       # Supabase client
│   ├── visitorData.ts              # Browser/device detection
│   ├── auth.ts                     # NextAuth configuration
│   ├── publicAuth.ts               # Custom JWT for public users
│   └── db.ts                       # Prisma singleton
└── prisma/
    └── schema.prisma               # 10 data models + 3 enums
```

---

## Database — 10 Prisma Models

| Model | Purpose |
|---|---|
| AdminUser | CMS administrator accounts |
| NewsArticle | News articles with rich text and workflow |
| ServiceDocument | Downloadable PDF documents |
| NetworkAlert | Real-time network outage alerts |
| AvariaReport | Customer fault reports with GPS |
| ContactMessage | Customer contact form submissions |
| OtpVerification | Email OTP records with expiry |
| PublicUser | Public user accounts |
| PublicSession | JWT session records |
| MediaAsset | Uploaded file library |
| Order | MPesa payment orders |

---

## REST API Endpoints

### Public
- `GET /api/news` — Published news articles
- `GET /api/alerts` — Active network alerts
- `GET /api/services` — Service documents
- `GET /api/pdf` — Server-side PDF generation
- `POST /api/avaria` — Submit fault report
- `POST /api/contact/send-otp` — Send OTP email
- `POST /api/contact/verify-otp` — Verify OTP and save message

### Authentication
- `POST /api/auth/user/register` — Public user registration
- `POST /api/auth/user/login` — Public user login
- `GET /api/auth/user/me` — Current session
- `POST /api/auth/user/logout` — Clear session

### Orders and Payments
- `POST /api/orders/create` — Create order and send confirmation email
- `GET /api/orders/[ref]` — Get order by reference
- `GET /api/orders/stream/[ref]` — SSE real-time status stream
- `POST /api/payment/mpesa-mz/initiate` — Initiate Vodacom MZ C2B payment
- `POST /api/payment/mpesa-mz/callback` — Vodacom payment confirmation webhook
- `POST /api/payment/mpesa-mz/query` — Poll transaction status
- `POST /api/payment/mpesa-mz/reversal` — Admin B2C refund
- `POST /api/payment/mpesa-mz/manual-confirm` — Manual PIN confirmation

### Admin (protected)
- `GET/POST /api/admin/news` — News CRUD
- `GET/POST /api/admin/alerts` — Alerts CRUD
- `GET/POST /api/admin/services` — Services CRUD
- `GET/PATCH/DELETE /api/admin/avarias` — Fault report management
- `GET/PATCH/DELETE /api/admin/contact` — Message management
- `GET/DELETE /api/admin/media` — Media library management
- `GET/POST /api/admin/orders` — Order management
- `PATCH /api/admin/orders/[id]` — Update order status

---

## Security

- **Password hashing:** bcryptjs with salt factor 12
- **JWT tokens:** HMAC-SHA256 via jose — HttpOnly, SameSite=Lax cookies
- **Input validation:** Zod schemas on all API endpoints
- **SQL injection:** Prisma ORM — parameterised queries only
- **CSRF protection:** SameSite=Lax cookies
- **Database:** TLS 1.3 enforced — sslmode=require
- **Secrets:** Encrypted in Vercel Dashboard — never in version control
- **TypeScript:** 0 compilation errors across the entire codebase

---

## Environment Variables

```bash
# Database
DATABASE_URL=

# Authentication
AUTH_SECRET=
PUBLIC_AUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=

# Supabase Analytics (Exercise 1)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Vodacom MZ MPesa (Exercise 4)
MPESA_MZ_API_KEY=
MPESA_MZ_PUBLIC_KEY=
MPESA_MZ_SERVICE_PROVIDER_CODE=
MPESA_MZ_ENV=
MPESA_MZ_SANDBOX_HOST=
MPESA_MZ_SANDBOX_PORT=
MPESA_MZ_PROD_HOST=
MPESA_MZ_PROD_PORT=
MPESA_MZ_ORIGIN=
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/shreymayur008-star/evn-corporate-portal.git
cd evn-corporate-portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in the values

# Push database schema
npx prisma db push

# Seed the database
npx ts-node scripts/seed.ts

# Start development server
npm run dev
```

---

## Deployment

The project uses automatic CI/CD via Vercel. Every push to the `main` branch triggers a new production deployment automatically.

```bash
# Manual deployment
vercel --prod
```

---

## Key Features

- ⚡ **16 interactive service modals** on the public portal
- 🗄️ **Professional CMS** with 6 management tabs
- 📧 **OTP email verification** for contact form
- 🛒 **Shopping cart and checkout** with email notifications
- 📱 **Real MPesa payments** — real Vodacom MZ API — real phone popups
- 📊 **Visitor analytics** via Supabase
- 🔄 **Server-Sent Events** for real-time payment status
- 🔐 **Dual authentication** — admin (NextAuth) + public (Custom JWT)
- 📱 **Fully responsive** — tested at 375px, 390px, 414px
- 🇲🇿 **Portuguese pt-MZ** — fully localised for Mozambique

---

## License

Academic project — Eletricidade Vantara Nacional, E.P. — 2026
