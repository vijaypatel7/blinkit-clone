# MongoDB — Database Layer

This directory is the **source of truth** for the MongoDB data layer. It is kept
separate from the backend so the schema, indexes, validators, seed data and
migrations can be reviewed and applied independently of application code.

## Collections

| Collection                | Purpose                                                |
|---------------------------|--------------------------------------------------------|
| `users`                   | Customers, partners, managers, admins                  |
| `addresses`               | User delivery addresses (GeoJSON points)               |
| `stores`                  | Dark stores / fulfillment centers (2dsphere)           |
| `store_zones`             | Serviceable geographic zones per store                 |
| `categories`              | Product category tree                                  |
| `products`                | Product catalog (pricing in paise)                     |
| `inventory`               | Stock per (store, product) — atomic operations         |
| `inventory_transactions`  | Append-only stock ledger                               |
| `carts`                   | Durable cart copy (active cart lives in Redis)         |
| `orders`                  | Orders (source of truth, state machine)                |
| `order_status_history`    | Append-only order transition audit                     |
| `payments`                | Payment attempts                                       |
| `payment_transactions`    | Payment auth/capture/refund ledger                     |
| `deliveries`              | Delivery records                                       |
| `delivery_partners`       | Partner profiles + live location (2dsphere)            |
| `delivery_tracking`       | GPS breadcrumbs for live tracking                      |
| `promotions`              | Banners, carousels, offers, deals                      |
| `coupons`                 | Discount codes                                         |
| `reviews`                 | Product reviews                                        |
| `wishlists`               | Saved products per user                                |
| `notifications`           | User notification inbox                                |
| `audit_logs`              | Privileged admin action audit trail                    |

## Folder layout

- `schemas/`   — canonical Mongoose schema per collection.
- `indexes/`   — index definitions (compound, 2dsphere, TTL, etc.).
- `validators/`— MongoDB `$jsonSchema` validators.
- `seed/`      — deterministic seed data for local/dev environments.
- `migrations/`— ordered migration scripts (apply via `migrate`).

## Money convention

All monetary values are stored in **paise** (integer) to avoid floating point
errors. `₹32` = `3200`.

## Applying

This folder is a standalone ES-module package. Install its dependency once:

```bash
cd database/mongodb
npm install
```

Then run the scripts (each requires a reachable MongoDB, configurable via `MONGODB_URI`):

```bash
# Indexes
node indexes/index.js

# Validators (optional, already enforced at app layer)
node validators/index.js

# Seed
node seed/index.js
```
