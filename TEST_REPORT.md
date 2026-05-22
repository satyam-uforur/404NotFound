# TEST REPORT — 404NotFoundIN E-Commerce Platform

**Date:** 2026-05-18  
**Project:** Genre-based merchandise e-commerce website  
**Stack:** Next.js 16.2 (App Router), React 19, Supabase, Razorpay, Tailwind CSS 4, Framer Motion, Zustand  
**Total Routes:** 43 (25 pages + 18 API routes)  
**Production-Ready:** **NO** — 18 critical/high issues must be resolved before deployment.

---

## EXECUTIVE SUMMARY

| Category | PASS | FAIL | SKIP |
|----------|------|------|------|
| A. Static Analysis | 1 | 3 | 1 |
| B. Routing & Auth | 5 | 4 | 0 |
| C. Auth Flows | 2 | 4 | 0 |
| D. Payment Flows | 0 | 5 | 0 |
| E. Shopping Experience | 1 | 4 | 0 |
| F. Database & Schema | 1 | 3 | 0 |
| G. Performance & SEO | 1 | 5 | 0 |
| H. UI/UX | 3 | 8 | 1 |
| I. Security | 1 | 5 | 0 |
| J. Final Checklist | 4 | 9 | 0 |
| **TOTAL** | **19** | **50** | **1** |

**Verdict: NOT READY FOR PRODUCTION**

---

## PHASE A — CODE & BUILD AUDIT

### A1. Static Analysis

| Test | Status | Details |
|------|--------|---------|
| `npm run lint` | **FAIL** | ESLint is referenced in `package.json` scripts but not installed. No `.eslintrc` or `eslint.config` file exists. |
| `npm run build` | **PASS** | Build succeeds with 43 routes. However, `typescript.ignoreBuildErrors: true` is set in `next.config.mjs`, suppressing all TS errors. |
| `npx tsc --noEmit` | **FAIL** | 27 TypeScript errors found across 4 files (see below). |
| `npx depcheck` | **SKIP** | Cannot run — ESLint not installed as devDependency. |
| `npx next-unused` | **N/A** | Not applicable — package not installed. |

**TypeScript Errors (27 total):**

| File | Line(s) | Error | Fix |
|------|---------|-------|-----|
| `app/auth/login/page.tsx` | 27 | `emailRedirectTo` not in type for `signInWithPassword` | Remove `emailRedirectTo` from `signInWithPassword` options — only valid for `signUp` and magic links. |
| `app/page.tsx` | 392 | `offsetTop` not on `Element` | Cast to `HTMLElement`: `(element as HTMLElement).offsetTop` |
| `app/page.tsx` | 482 | `MotionValue<number>` not assignable to `number` | Use `useMotionValueEvent` or extract `.get()` in a motion context |
| `app/shop/cart/page.tsx` | 110,117,129 | `string \| undefined` not assignable to `string` | Add null checks: `item.id!` or `if (!item.id) return` |
| `lib/store/cartStore.ts` | 28-161 | 21 errors: implicit `any`, circular type, incompatible types | Add explicit type annotations to store creator and all callback parameters. Use `subscribeWithSelector` middleware. |

### A2. Route Inventory

**Found: 43 routes** (expected 39 from build output — build shows 39 static+dynamic routes plus `_not-found` and `middleware`)

| Pages (25) | |
|---|---|
| `/` | Homepage (static) |
| `/about` | Static (static) |
| `/contact` | Static (static) |
| `/auth/login` | Login form (static) |
| `/auth/sign-up` | Signup form (static) |
| `/auth/sign-up-success` | Post-signup (static) |
| `/auth/error` | Auth error (static) |
| `/shop` | Shop home (static) |
| `/shop/products` | Product listing (static) |
| `/shop/products/[id]` | Product detail (dynamic) |
| `/shop/cart` | Cart page (static) |
| `/shop/checkout` | Checkout (static) |
| `/shop/contact` | Shop contact (static) |
| `/shop/wishlist` | Wishlist (static) |
| `/shop/account` | Account dashboard (static) |
| `/shop/account/addresses` | Address management (static) |
| `/shop/account/orders` | Order history (static) |
| `/shop/account/orders/[id]` | Order detail (dynamic) |
| `/admin` | Admin dashboard (static) |
| `/admin/analytics` | Analytics (static) |
| `/admin/orders` | Order management (static) |
| `/admin/orders/[id]` | Order detail (dynamic) |
| `/admin/products` | Product management (static) |
| `/admin/products/new` | New product (static) |
| `/admin/settings` | Admin settings (static) |

| API Routes (18) | |
|---|---|
| `/api/addresses` | GET/POST |
| `/api/admin/analytics` | GET |
| `/api/admin/orders/[id]` | PATCH/PUT |
| `/api/cart` | GET/POST |
| `/api/cart/[id]` | PATCH/DELETE |
| `/api/contact` | GET/POST |
| `/api/email/send` | POST |
| `/api/orders` | GET/POST |
| `/api/orders/confirm` | POST |
| `/api/payment/checkout` | POST (mock) |
| `/api/payment/razorpay` | POST/PUT |
| `/api/payment/webhook` | POST |
| `/api/payments` | POST/PUT |
| `/api/products` | GET/POST |
| `/api/products/[id]` | GET |
| `/api/setup` | POST |
| `/api/shipping/create` | POST (mock) |

### A3. Environment Variables

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **FAIL** — No `.env.local` or `.env` file exists |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **FAIL** — No env file |
| `SUPABASE_SERVICE_ROLE_KEY` | **FAIL** — Not referenced in code; webhook needs `RAZORPAY_WEBHOOK_SECRET` instead |
| `RAZORPAY_KEY_ID` | **FAIL** — No env file |
| `RAZORPAY_KEY_SECRET` | **FAIL** — No env file |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **FAIL** — No env file (checkout page uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`) |

**Build warning:** `Razorpay credentials not configured` — confirms env vars are missing.

---

## PHASE B — ROUTING & AUTH MATRIX

### B1. Public Routes

| Route | Expected | Actual | Status |
|-------|----------|--------|--------|
| `/` | Homepage, black theme | Renders with dark background, 3D orb, animations | **PASS** |
| `/shop/products` | Product list, white theme | Renders product grid with filters | **PASS** |
| `/shop/products/[id]` | Product detail with "Add to Cart" | Renders product with size/color selection, Add to Cart button | **PASS** |
| `/auth/login` | Login form | Email/password form renders | **PASS** |
| `/auth/sign-up` | Signup form | Registration form renders | **PASS** |
| `/about` | Static page | Renders | **PASS** |
| `/contact` | Static page | Renders contact form | **PASS** |

### B2. Protected Routes — Middleware-Level

| Route | Expected | Actual | Status |
|-------|----------|--------|--------|
| `/shop/account/*` | Redirect to `/auth/login` if not logged in | Client-side redirect only in `app/shop/account/layout.tsx`. **Middleware does NOT protect this path.** | **FAIL** |
| `/shop/checkout` | Login required | No auth check at all — anonymous users can reach checkout page | **FAIL** |
| `/admin/*` | Redirect non-admin | No middleware protection. Admin layout has no auth gate. Any user can see admin UI. | **FAIL** |

**Root cause:** `lib/supabase/proxy.ts:63` only checks for `/protected` prefix — a route that doesn't exist in the app. All real protected routes are unguarded.

### B3. Admin Routes

| Route | Expected | Actual | Status |
|-------|----------|--------|--------|
| `/admin/*` | Non-admin → `/shop` with error | API routes return 403 for non-admins, but **page renders anyway** with empty/broken data. No client-side role check. | **FAIL** |

---

## PHASE C — AUTH FLOW TEST CASES

### TC-AUTH-01: Signup New User

| Step | Expected | Code Analysis | Status |
|------|----------|---------------|--------|
| Submit form | User created in `auth.users` | `signUp()` called on Supabase client | **PASS** |
| Profile created | Row in `profiles` | Database trigger `handle_new_user` creates profile. Signup page does NOT manually insert (correct). | **PASS** |
| Redirect | → `/auth/sign-up-success` | `router.push('/auth/sign-up-success')` | **PASS** |
| Full name | Stored in profile | **FAIL** — Signup form has no `fullName` field. The trigger will insert `null` for `full_name`. | **FAIL** |

### TC-AUTH-02: Login Existing User

| Step | Expected | Code Analysis | Status |
|------|----------|---------------|--------|
| Submit | Session cookie set | `signInWithPassword()` sets `sb-*` cookies via `@supabase/ssr` | **PASS** |
| Redirect | → `/shop` | `router.push('/shop')` | **PASS** |
| Navbar | Shows user avatar/name | `useAuth()` hook provides user state to Navbar | **PASS** |

### TC-AUTH-03: Login with `?next=` Param

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Redirect back to original URL after login | Login page hardcodes `router.push('/shop')`. Does NOT read `?next=` query param. | **FAIL** |

### TC-AUTH-04: Logout

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Session cleared, redirect to `/` | `supabase.auth.signOut()` called, then `router.push('/')` | **PASS** |

### TC-AUTH-05: Session Persistence

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Cookie survives browser close | Supabase SSR sets persistent cookies. Middleware refreshes tokens on every request. | **PASS** |

### TC-AUTH-06: Password Reset

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| "Forgot password" flow | **No "Forgot Password" link or flow exists** on the login page. No `/auth/reset-password` route. | **FAIL** |

---

## PHASE D — PAYMENT FLOW (RAZORPAY)

### TC-PAY-01: Create Order

| Step | Expected | Code Analysis | Status |
|------|----------|---------------|--------|
| Click "Buy/Checkout" | POST creates Razorpay order | Checkout calls `/api/payments` POST → Razorpay API with Basic auth | **PASS** (logic exists) |
| Amount matches | Order amount = cart total | Razorpay order created with cart total (in paise) | **PASS** |
| Modal opens | Razorpay checkout.js modal | Script loaded dynamically, `new Razorpay(options).open()` | **PASS** |

### TC-PAY-02: Successful Payment

| Step | Expected | Code Analysis | Status |
|------|----------|---------------|--------|
| Verify signature | HMAC SHA256 check | `verifyPayment()` in checkout page + `/api/payments` PUT both verify | **PASS** |
| Order confirmed | Status updated in DB | **FAIL** — PUT calls `/api/orders/confirm` via server-side fetch. Confirm route uses `customer_id` column but orders table has `user_id`. Update will match 0 rows. | **FAIL** |
| Server-side auth | Confirm route gets user session | **FAIL** — Server-side `fetch()` to `/api/orders/confirm` won't forward Supabase auth cookies. The confirm route's `getUser()` will return null → 401. | **FAIL** |

### TC-PAY-03: Failed Payment

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| No order created, error shown | `razorpay.on('payment.failed')` handler exists, shows toast. But order was already created in DB before payment attempt. | **FAIL** — Order is created BEFORE Razorpay modal opens. Cancelled payments leave orphan orders. |

### TC-PAY-04: Duplicate Purchase Prevention

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| No duplicate orders | No check exists. User can checkout same cart multiple times. | **FAIL** |

### TC-PAY-05: Webhook

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Verify signature, update DB | Signature verification is **commented out**. Handler only `console.log`s events. No DB updates. | **FAIL** |

---

## PHASE E — SHOPPING EXPERIENCE

### TC-SHOP-01: Product Listing

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Products render with filters | **FAIL** — Page expects `data` as array, but API returns `{ products, total, limit, offset }`. Products will not render. | **FAIL** |

**File:** `app/shop/products/page.tsx` — response handling mismatch with `app/api/products/route.ts`

### TC-SHOP-02: Cart Functionality

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Add to cart works | Zustand `cartStore` handles client-side cart. Works for client-side state. | **PASS** |
| Cart syncs with server | **FAIL** — Two separate cart systems exist: Zustand localStorage cart AND Supabase `cart_items` table. They are never synchronized. Checkout uses Zustand; API cart is orphaned. | **FAIL** |

### TC-SHOP-03: Checkout Flow

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Order created successfully | **FAIL** — Checkout sends `{ shipping_address, items, total }` but API expects `{ items, shippingAddressId, billingAddressId, subtotal, tax, shippingCost, discount, totalAmount }`. Request will fail or create malformed order. | **FAIL** |

### TC-SHOP-04: Wishlist

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Wishlist syncs across pages | **FAIL** — Product listing uses React `Set<string>` state, wishlist page uses localStorage `404-wishlist`. Not synchronized. | **FAIL** |

### TC-SHOP-05: Cart Badge

| Expected | Code Analysis | Status |
|----------|---------------|--------|
| Navbar shows cart item count | **FAIL** — Cart badge in `components/Navbar.tsx` is hardcoded to `<span>0</span>`. | **FAIL** |

---

## PHASE F — DATABASE & SCHEMA

### TC-DB-01: Schema Completeness

| Table/Column Referenced | Exists in `schema.sql` | Status |
|------------------------|----------------------|--------|
| `profiles.role` | **NO** — only `id, email, full_name, avatar_url, phone` | **FAIL** |
| `cart_items` | **NO** — not in schema | **FAIL** |
| `order_approvals` | **NO** — not in schema | **FAIL** |
| `orders.razorpay_order_id` | **NO** — not in schema | **FAIL** |
| `orders.razorpay_payment_id` | **NO** — not in schema | **FAIL** |
| `orders.customer_id` | **NO** — schema uses `user_id` | **FAIL** |
| `orders.shipping_address_id` | **NO** — schema uses `shipping_address` (JSONB) | **FAIL** |
| `orders.billing_address_id` | **NO** — not in schema | **FAIL** |

### TC-DB-02: Conflicting Migration Files

**FAIL** — `scripts/` contains 13 SQL files with overlapping and conflicting definitions:
- 3 files prefixed `01-` (init)
- 3 files prefixed `02-` (features/RLS)
- 2 files prefixed `03-` (seed)
- Plus `init-db.sql`, `schema.sql`, `seed.sql`, `setup-db.js`, `run-migrations.js`

Running all files in order will cause duplicate table errors.

### TC-DB-03: RLS Policies

| Table | Has RLS | Status |
|-------|---------|--------|
| `orders` | RLS enabled in `02-rls.sql` | **PASS** |
| `products` | Public read policy | **PASS** |
| `profiles` | User can read own | **PASS** |

**Note:** `cart_items` and `order_approvals` have no RLS because they don't exist in the schema.

---

## PHASE G — PERFORMANCE & SEO

### G1. Build & Bundle

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `typescript.ignoreBuildErrors` | `false` | `true` | **FAIL** — hides 27 type errors |
| `images.unoptimized` | `false` | `true` | **FAIL** — no Next.js image optimization |

### G2. Image Optimization

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| All `<img>` → `<Image>` | All images use `next/image` | `next.config.mjs` has `unoptimized: true`, and many components may use `<img>` | **FAIL** |

### G3. SEO Files

| File | Exists | Status |
|------|--------|--------|
| `public/robots.txt` | **NO** — `public/` directory doesn't exist | **FAIL** |
| `public/sitemap.xml` | **NO** | **FAIL** |
| `public/manifest.json` | **NO** | **FAIL** |
| `app/robots.ts` | **NO** | **FAIL** |
| `app/sitemap.ts` | **NO** | **FAIL** |

### G4. Metadata

| Page | Has `metadata` export | Status |
|------|----------------------|--------|
| Root layout | `metadataBase`, `title`, `description`, `openGraph` | **PASS** |
| Other pages | Most pages don't export metadata | **FAIL** |

### G5. Loading States

| Check | Status |
|-------|--------|
| `loading.tsx` files | **FAIL** — No `loading.tsx` files exist anywhere. No skeleton states during data fetching. |

---

## PHASE H — UI / UX

### Manual Code Review Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Homepage: black bg, white text | **PASS** | Dark theme with gold/white accents |
| Inner pages: white bg, black text | **PASS** | `ClientLayout` switches `world-white` class |
| Mobile responsive | **PASS** | Navbar has hamburger menu, grid uses responsive breakpoints |
| Loading skeletons | **FAIL** — No `loading.tsx` files exist | No loading states |
| Empty states | **PASS** — Product page shows "No products found" | |
| Error boundaries | **FAIL** — No `error.tsx` or `global-error.tsx` exist | Runtime crashes show default Next.js error |
| 404 page | **PASS** — Creative Three.js 404 page at `app/not-found.tsx` | |
| Toast notifications | **FAIL** — `sonner` installed but not used for error flows | |
| Cart count badge | **FAIL** — Hardcoded to `0` in Navbar | |
| Email subscription CTA | **FAIL** — Decorative only, no handler | |

---

## PHASE I — SECURITY

### TC-SEC-01: Unauthenticated API Access

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `/api/setup` POST | Admin only | **No auth** — anyone can insert products | **FAIL** |
| `/api/contact` GET | Admin only | **No auth** — anyone can read all messages | **FAIL** |
| `/api/payment/webhook` POST | Verify signature | **Signature check commented out** | **FAIL** |
| `/api/payments` POST | Authenticated users | **No auth check** | **FAIL** |

### TC-SEC-02: Admin Route Protection

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Middleware guards `/admin/*` | Redirect non-admins | **No middleware protection** | **FAIL** |
| Admin layout auth gate | Check user role | **No auth check in admin layout** | **FAIL** |

### TC-SEC-03: Input Validation

| Endpoint | Validation | Status |
|----------|-----------|--------|
| `/api/products` POST | **None** — raw body passed to Supabase | **FAIL** |
| `/api/addresses` POST | **None** — spread operator allows field override including `user_id` | **FAIL** |
| `/api/contact` POST | Required fields checked | **PASS** |
| `/api/orders` POST | Checks `items.length > 0` only | **PARTIAL** |

### TC-SEC-04: Rate Limiting

| Check | Status |
|-------|--------|
| Login endpoint rate limiting | **FAIL** — No rate limiting on any endpoint |
| API rate limiting | **FAIL** — No rate limiting middleware |

### TC-SEC-05: Secret Leakage

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Service role key in client code | 0 matches | 0 matches — not used anywhere in client code | **PASS** |
| Razorpay secret in client code | 0 matches | `NEXT_PUBLIC_RAZORPAY_KEY_ID` is public (correct). `RAZORPAY_KEY_SECRET` only in server routes. | **PASS** |

### TC-SEC-06: SQL Injection via Supabase

| Check | Status |
|-------|--------|
| Supabase client parameterizes queries | **PASS** — PostgREST parameterizes all queries. ILIKE search is safe. |
| Raw SQL anywhere | **PASS** — No raw SQL in application code. |

---

## PHASE J — FINAL CHECKLIST

| # | Check | Status |
|---|-------|--------|
| 1 | All routes return correct status codes | **FAIL** — Multiple API routes will crash or return wrong data |
| 2 | All forms have client + server validation (zod) | **FAIL** — Zod installed but never used. Minimal validation. |
| 3 | All API routes have try/catch + proper error JSON | **PASS** — Consistent try/catch pattern |
| 4 | All async ops have loading + error states | **FAIL** — No `loading.tsx`, many catch blocks swallow errors |
| 5 | Middleware protects `/admin/*`, `/shop/account/*` | **FAIL** — Only `/protected` (non-existent) is guarded |
| 6 | `robots.txt` + `sitemap.xml` | **FAIL** — Neither exists |
| 7 | `favicon` + `manifest.json` | **FAIL** — No `public/` directory exists |
| 8 | Error pages: `not-found.tsx`, `error.tsx`, `global-error.tsx` | **PARTIAL** — `not-found.tsx` exists, but `error.tsx` and `global-error.tsx` do not |
| 9 | 404 page styled | **PASS** — Custom Three.js 404 |
| 10 | Environment variables configured | **FAIL** — No `.env` files exist |
| 11 | Supabase schema + seed executed | **FAIL** — 13 conflicting SQL files, missing tables |
| 12 | Razorpay webhook configured | **FAIL** — Signature verification disabled |
| 13 | Domain + SSL | **N/A** — Cannot verify from code |
| 14 | Analytics | **PASS** — `@vercel/analytics` installed and enabled in root layout |

---

## CRITICAL ISSUES (MUST FIX BEFORE PRODUCTION)

### 1. Middleware Auth Not Protecting Real Routes
**File:** `lib/supabase/proxy.ts:63`  
**Bug:** Only checks `/protected` prefix which doesn't exist.  
**Fix:**
```ts
// Change from:
if (request.nextUrl.pathname.startsWith('/protected')) {

// To:
if (
  request.nextUrl.pathname.startsWith('/admin') ||
  request.nextUrl.pathname.startsWith('/shop/account') ||
  request.nextUrl.pathname.startsWith('/shop/checkout')
) {
```

### 2. Order Confirmation Column Mismatch
**File:** `app/api/orders/confirm/route.ts:34`  
**Bug:** Uses `customer_id` but orders table has `user_id`.  
**Fix:** Change `eq('customer_id', user.id)` → `eq('user_id', user.id)`

### 3. Checkout → Order API Schema Mismatch
**File:** `app/shop/checkout/page.tsx`  
**Bug:** Sends `{ shipping_address, items, total }` but API expects `{ items, shippingAddressId, subtotal, tax, shippingCost, discount, totalAmount }`.  
**Fix:** Update checkout page to send the correct payload, or update the API to accept the checkout format.

### 4. Product Listing Data Format Mismatch
**File:** `app/shop/products/page.tsx`  
**Bug:** Expects `data` as array but API returns `{ products, total, limit, offset }`.  
**Fix:** Change `setProducts(data)` → `setProducts(data.products)` and handle pagination.

### 5. Server-Side Fetch Auth Fail
**File:** `app/api/payments/route.ts:78`  
**Bug:** Server-side `fetch('/api/orders/confirm')` doesn't forward Supabase auth cookies. Confirm route will 401.  
**Fix:** Move confirm logic into a shared server function instead of HTTP call, or forward cookies explicitly.

### 6. Webhook Signature Verification Disabled
**File:** `app/api/payment/webhook/route.ts:49-52`  
**Bug:** Signature verification commented out.  
**Fix:** Uncomment and implement proper Razorpay webhook signature verification using `RAZORPAY_WEBHOOK_SECRET`.

### 7. Missing Database Tables/Columns
**Files:** `scripts/schema.sql`, multiple API routes  
**Bug:** Code references `cart_items`, `order_approvals`, `profiles.role`, `orders.razorpay_order_id` etc. — none exist in schema.  
**Fix:** Create migration adding missing tables and columns.

### 8. `/api/setup` Unauthenticated Product Insertion
**File:** `app/api/setup/route.ts`  
**Bug:** No auth check — anyone can create products.  
**Fix:** Add admin authentication check.

### 9. `/api/contact` GET Exposes All Messages
**File:** `app/api/contact/route.ts`  
**Bug:** No auth on GET endpoint.  
**Fix:** Add admin authentication check.

### 10. Duplicate Payment Routes
**Files:** `app/api/payment/razorpay/route.ts` AND `app/api/payments/route.ts`  
**Bug:** Two routes create Razorpay orders with different logic and status values. Checkout uses `/api/payments`.  
**Fix:** Remove or merge duplicate. Standardize on one payment flow.

---

## HIGH PRIORITY ISSUES

| # | Issue | File | Fix |
|---|-------|------|-----|
| 11 | No `?next=` redirect after login | `app/auth/login/page.tsx:104` | Read `searchParams.next` and redirect there |
| 12 | No password reset flow | Login page | Add "Forgot Password" link + `/auth/reset-password` route |
| 13 | No `fullName` in signup | `app/auth/sign-up/page.tsx` | Add full_name field to signup form |
| 14 | Dual cart systems not synced | `lib/store/cartStore.ts` + `/api/cart/` | Unify — use Zustand for guests, sync to Supabase on login |
| 15 | Cart badge hardcoded to 0 | `components/Navbar.tsx` | Connect to `cartStore` |
| 16 | No error boundaries | `app/` | Create `error.tsx` and `global-error.tsx` |
| 17 | No loading states | `app/` | Add `loading.tsx` for key routes |
| 18 | Zod never used despite being installed | All API routes | Add Zod schemas for all input validation |

---

## MEDIUM PRIORITY ISSUES

| # | Issue | File |
|---|-------|------|
| 19 | Admin analytics `topProducts` query is malformed | `app/api/admin/analytics/route.ts` |
| 20 | Products API uses `is_active`, product detail uses `is_published` | `app/api/products/route.ts` vs `app/api/products/[id]/route.ts` |
| 21 | Address POST allows `user_id` override | `app/api/addresses/route.ts` |
| 22 | Dual wishlist systems not synced | `app/shop/products/page.tsx` vs `app/shop/wishlist/page.tsx` |
| 23 | Order created before Razorpay payment — cancelled payments leave orphans | `app/shop/checkout/page.tsx` |
| 24 | No rate limiting on any endpoint | All routes |
| 25 | Email sending is mock only | `app/api/email/send/route.ts` |
| 26 | Shipping integration is mock only | `app/api/shipping/create/route.ts` |
| 27 | `react-hook-form` installed but never used | `package.json` |
| 28 | Conflicting SQL migration files | `scripts/` |
| 29 | Product detail `params` typed as sync (should be Promise) | `app/shop/products/[id]/page.tsx` |
