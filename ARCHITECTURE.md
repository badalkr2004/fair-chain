# FairChain Architecture and Codebase Guide

This document is the single-point reference for understanding what FairChain does, how it is structured, and how the app and backend work together.

## 1. What FairChain Is

FairChain is a multi-stakeholder agriculture platform with three primary user roles:

- `FARMER`: Lists produce/products, receives bids, manages traceability.
- `INTERMEDIARY`: Places bids, handles logistics/processing/storage services.
- `CONSUMER`: Browses products, places orders, tracks order/traceability.

Core platform capabilities:

- Role-based authentication and profiles
- Product/produce listing and discovery
- Bid lifecycle between intermediaries and farmers
- Order and transaction lifecycle
- Supply-chain and traceability timeline
- Forecasting and market trends

---

## 2. High-Level Architecture

The project has three top-level folders:

- `app/`: Expo React Native mobile app (primary client)
- `backend/`: Express + Prisma API server
- `web/`: separate web project (ignored here by request)

Runtime shape:

1. Mobile app calls backend REST APIs.
2. Backend validates auth/roles and executes business logic.
3. Prisma persists data in PostgreSQL.
4. Some app screens use fallback/mock data when API endpoints fail or are missing.

---

## 3. Repository Structure (Focused on `app` and `backend`)

```text
fairchain-main/
  app/
    app/                  # Expo router screens (feature + role based)
    services/             # API clients and domain service wrappers
    types/                # Shared TS types for app layer
    components/           # UI + reusable components
    utils/                # Helpers (token/date/storage utils)
    assets/               # Images/fonts/static assets
    config.ts             # App-level constants (also has API URL reference)
    package.json

  backend/
    src/
      controllers/        # Business logic handlers per domain
      routes/             # Express route registration
      middleware/         # Auth + validation middleware
      lib/                # Prisma client, server init, validation schemas
      config/             # Auth configuration
      generated/prisma/   # Prisma generated client output
    prisma/
      schema.prisma       # Data model and enums
      migrations/         # DB migrations
      seed.ts             # Seed data script
    index.ts              # Server bootstrap and route mounting
    package.json
```

---

## 4. Frontend (`app/`) Architecture

## 4.1 Routing model

Expo Router file-based navigation under `app/app/`:

- `(auth)/`: login/signup entry and role selection
- `farmer/`: farmer onboarding, dashboard, produce/traceability flows
- `intermediary/`: bid and operations dashboard
- `consumer/`: marketplace, cart/order/profile flows
- `orders/`, `products/`, `traceability/`, `bids/`: shared feature routes

## 4.2 Service layer

`app/services/` contains domain-specific API wrappers:

- `auth.ts`, `api.ts`
- `products.ts`, `produce.ts`
- `bids.ts`, `bid.ts` (two versions exist)
- `orders.ts`
- `transaction.ts`, `transactions.ts` (two versions exist)
- `traceability.ts`, `supplyChain.ts`, `forecasting.ts`
- `cart.ts`, `wishlist.ts`, `reviews.ts`

Important: there are old + new services coexisting. Some point to endpoints that backend does not expose, and many screens include fallback mock data.

## 4.3 State/data pattern

Most screens:

- call service methods in `useEffect`
- store API response in component-local state
- show loader/error
- fall back to mock data for demo continuity

## 4.4 API base URL behavior

Multiple URL sources currently exist:

- `app/services/api.ts`
- `app/config.ts`
- `app/services/forecasting.ts` (external forecasting API URL)

This can cause environment inconsistencies and should be unified.

---

## 5. Backend (`backend/`) Architecture

## 5.1 Server bootstrap

`backend/index.ts`:

- initializes Express middleware (`cors`, JSON parsing)
- mounts all domain routes
- starts server after `initializeServer()`

`backend/src/lib/server.ts`:

- verifies DB connection
- registers scheduled jobs (forecast + market price updates)

## 5.2 Route to controller mapping

Mounted base paths:

- `/auth` -> `auth.controller.ts`
- `/products` -> `product.controller.ts`
- `/produce` -> `produce.controller.ts`
- `/orders` -> `order.controller.ts`
- `/bids` -> `bid.controller.ts`
- `/transactions` -> `transaction.controller.ts`
- `/supply-chain` -> `supplyChain.controller.ts`
- `/trace` -> `traceability.controller.ts`
- `/forecast` -> `forecast.controller.ts`

## 5.3 Middleware

- `authenticate`: JWT verification + user attach on request
- Role guards: `isFarmer`, `isIntermediary`, `isConsumer`, `isAdmin`
- `validateRequest`: Zod request validation wrapper

## 5.4 Data layer

Prisma schema includes:

- users and role-specific profiles
- products + analytics
- bids
- orders + order items
- transactions
- supply chains + links
- traceability records
- forecasting models/predictions
- market prices and weather data

---

## 6. Core Business Flows

## 6.1 Signup/Login

1. App sends credentials/profile data to `/auth/signup` or `/auth/login`.
2. Backend creates role-specific profile and returns JWT.
3. App stores token/user in local storage.

## 6.2 Farmer product lifecycle

1. Farmer creates produce/product.
2. Product is listed with analytics entry.
3. Intermediaries can place bids.
4. Farmer accepts/rejects bid.

## 6.3 Bid lifecycle

1. Intermediary creates bid (`PENDING`).
2. Farmer/admin responds (`ACCEPTED`/`REJECTED`).
3. On acceptance:
   - product can move to processing
   - supply chain may be created
   - transaction record is created

## 6.4 Order lifecycle

1. Consumer creates order with items.
2. Backend validates inventory and decrements quantities.
3. Order starts `PENDING`.
4. Status changes through `CONFIRMED`, `IN_TRANSIT`, `DELIVERED` or `CANCELLED`.
5. Related transaction and traceability updates are written.

## 6.5 Traceability lifecycle

1. Events are added via `/trace/record`.
2. Records link with previous hash/current hash.
3. Product timeline is retrieved via `/trace/product/:productId`.
4. Verification can be checked via `/trace/verify/:recordId`.

---

## 7. What Is Fully Wired vs Partial/Legacy

The codebase currently has mixed maturity.

Generally well-backed by backend:

- auth, products/produce, bids, orders (core), transactions, supply-chain (core), traceability (core), forecasting (core)

Partially wired or mismatched in app:

- some services/screens call endpoints not exposed by backend
- duplicate service files with different endpoint conventions
- extensive fallback mock data for `reviews`, `wishlist`, parts of intermediary and tracking UX

Practical implication:

- many screens render and demo correctly
- not every screen is guaranteed to be fully server-driven end-to-end

---

## 8. Quick Folder Guide for New Developers

Start here for fast onboarding:

1. `backend/index.ts` and `backend/src/routes/*` for API surface
2. `backend/prisma/schema.prisma` for domain model
3. `app/services/api.ts` and `app/services/*.ts` for client-server contract
4. `app/app/farmer/index.tsx`, `app/app/intermediary/index.tsx`, `app/app/consumer/dashboard.tsx` for role dashboards
5. `app/app/traceability/*` and backend traceability controller for chain logic

---

## 9. Suggested Architecture Improvements

1. Consolidate duplicate services:
   - `bid.ts` vs `bids.ts`
   - `transaction.ts` vs `transactions.ts`
   - `product.ts` vs `products.ts`
2. Unify API base URL configuration into one source.
3. Create a strict frontend-backend API contract doc per route.
4. Remove or feature-flag mock fallbacks for production builds.
5. Add missing backend modules or remove dead frontend paths (`reviews`, `wishlist`, `cart`, etc.) until implemented.

---

## 10. Summary

FairChain is an agriculture marketplace platform with strong core architecture:

- role-based workflows
- clear domain separation in backend controllers/routes
- mobile-first frontend with service abstraction
- robust data model in Prisma

The biggest current technical theme is integration consistency (legacy endpoints + mock fallbacks). Once service contracts are unified, the platform structure is well-positioned for scaling.

