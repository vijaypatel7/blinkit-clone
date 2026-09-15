# Blinkit Clone — Production-Grade Quick-Commerce Platform

A full-stack, production-grade clone of Blinkit (instant grocery / quick-commerce), built to
handle **10,000+ concurrent users** with low p99 latency.

## Architecture Overview

```
                   USERS
                     │
                     ▼
                 FRONTEND        (React + Redux Toolkit + RTK Query)
                     │
                     ▼
                    API          (Node.js + Express)
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
         REDIS              MONGODB
         CACHE              DATABASE
            │
            ▼
         QUEUES               (BullMQ)
            │
            ▼
         WORKERS
```

**Core principle:**

- **Read-heavy traffic** → Redis cache first, MongoDB only on miss.
- **Transactional operations** → MongoDB with *atomic* operations (e.g. inventory reservation).
- **Slow / non-critical work** → background queues + workers (notifications, delivery
  assignment, analytics).

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 18, Vite, React Router, Redux Toolkit, RTK Query |
| Backend     | Node.js, Express, Mongoose, ioredis, BullMQ        |
| Cache       | Redis (product/category/home/store/inventory/OTP/rate-limit) |
| Database    | MongoDB (source of truth)                          |
| Queues      | BullMQ + workers                                   |

## Repository Layout

```
blinkit-clone/
├── frontend/      React SPA (feature-sliced)
├── backend/       Node.js API (modular monolith)
└── database/      MongoDB schemas, indexes, validators, seed, migrations
```

See each folder's own `README` (or inline header comments) for details.

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in MongoDB / Redis / JWT secrets
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database seed
```bash
cd database/mongodb
npm install
node seed/index.js
```

The seed is idempotent: re-running it upserts categories/stores/products and
**removes any category that is no longer in the seed** (e.g. a previously-renamed
or dropped category), then flushes the relevant Redis cache keys so the changes
show up immediately instead of after the cache TTL expires.

### Real product catalog

The `Snacks & Munchies` and `Masala, Oil & More` categories are seeded from real
Blinkit listings (scraped product data in `database/mongodb/seed/data/`) — real
product **names, images (cdn.grofers.com), pack sizes, prices and MRPs**, with
brand, description and rating filled in by `realProducts.js`. The remaining
categories use the deterministic generator in `products.js`.

## Authentication — Demo OTP (login / sign-up)

This build does **not** use a real SMS gateway. Instead, login and sign-up both
use a **single fixed demo OTP**:

> **Demo OTP: `123456`**

- Enter any phone number on the login page and request an OTP.
- On the "Enter OTP" step, type **`123456`** — the request succeeds and the
  account is created automatically if it's the user's first login (i.e. this
  single code powers both **login** and **sign-up**).
- The demo OTP is **not displayed anywhere in the UI** and is not returned by
  the API — it is a known constant (see `DEMO_OTP` in
  `backend/src/modules/auth/auth.constants.js`).
- Entering **any other code** is rejected with an `Invalid OTP` (401) error.

```text
POST /api/v1/auth/otp/send      { "phone": "+91XXXXXXXXXX" }   → 200 { expiresIn }
POST /api/v1/auth/otp/verify    { "phone": "+91XXXXXXXXXX", "otp": "123456" }
                                → 200 { user, accessToken, refreshToken }   (success)
                                → 401 Invalid OTP                            (wrong code)
```

## Key Design Decisions

1. **Layered module pattern** — every backend module is split into
   `controller → service → repository → model`, plus `cache`, `validation`, `mapper`,
   `routes`, and `constants`. Performance logic never lives in controllers.
2. **Redis-first reads** — products, categories, home page, store info, inventory,
   promotions, sessions, OTPs and rate-limit counters are all cached with tuned TTLs.
3. **Atomic inventory** — stock is reserved with a conditional MongoDB update
   (`availableQuantity >= requestedQuantity`) so overselling is impossible.
4. **Strict order state machine** — explicit, validated transitions; no `DELIVERED → CREATED`.
5. **Cursor-based pagination** — no unbounded `skip()` on large collections.
6. **Non-blocking side effects** — checkout returns after order creation; notifications,
   delivery assignment, analytics run in queues.
