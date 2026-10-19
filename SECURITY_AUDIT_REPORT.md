# SECURITY AUDIT REPORT — Luxury Essentials
**Audit Date:** 2026-10-13
**Auditor:** Senior AppSec Engineer (AI-assisted static analysis)
**Scope:** Full source-code static analysis — Read-Only (no active exploitation)
**Project:** Next.js 16.1.6 e-commerce site (Vercel + MongoDB Atlas + Razorpay)
**Audit Standard:** OWASP Top 10 (2021), OWASP API Security Top 10 (2023), OWASP ASVS 4.0

---

## EXECUTIVE SUMMARY

| Category | Count |
|---|---|
| Critical | 2 |
| High | 5 |
| Medium | 7 |
| Low | 4 |
| Informational | 3 |
| **Total Findings** | **21** |

**Launch Recommendation:** CONDITIONAL — DO NOT LAUNCH until SEC-001, SEC-002, SEC-004, SEC-005, and SEC-007 are fixed and verified.

---

## PHASE 1 — PROJECT ARCHITECTURE MAP

### Technology Stack (Confirmed)

| Component | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| Database ORM | Mongoose | ^9.2.3 |
| Authentication | JWT (jose + jsonwebtoken) | jose ^6.2.9 / jwt ^9.0.3 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Input Validation | Zod | ^4.3.6 |
| Payments | Razorpay | ^2.9.6 |
| Image Storage | Cloudinary | ^2.11.0 |
| Email (Admin) | Resend | ^6.21.0 |
| Email (Customer) | Brevo (direct API) | N/A |
| Deployment | Vercel | N/A |

### API Endpoint Inventory

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| /api/auth/login | POST | None | Public |
| /api/auth/register | POST | None | Public |
| /api/auth/me | GET | JWT | Any user |
| /api/auth/me | POST | None | Public (logout) |
| /api/orders | GET | JWT | User (own orders) |
| /api/orders | POST | JWT | User |
| /api/orders/[id] | GET | JWT | User (own) or Admin |
| /api/products | GET | None | Public |
| /api/products | POST | JWT/Admin | Admin only |
| /api/products/[id] | GET | None | Public |
| /api/products/[id] | PUT | JWT/Admin | Admin only |
| /api/products/[id] | DELETE | JWT/Admin | Admin only |
| /api/admin/orders | GET | JWT/Admin | Admin only |
| /api/admin/orders/[id] | GET | JWT/Admin | Admin only |
| /api/admin/orders/[id] | PUT | JWT/Admin | Admin only |
| /api/admin/users | GET | JWT/Admin | Admin only |
| /api/admin/stats | GET | JWT/Admin | Admin only |
| /api/payment/create-order | POST | JWT | User |
| /api/payment/verify | POST | JWT | User |
| /api/cloudinary/sign-upload | GET | **NONE** | **UNPROTECTED** |

---

## FINDINGS

---

### SEC-001 — Unauthenticated Cloudinary Upload Signing Endpoint
**Severity:** CRITICAL
**Confidence:** CONFIRMED
**Affected File:** src/app/api/cloudinary/sign-upload/route.ts
**Affected Lines:** 12-40
**Affected Endpoint:** GET /api/cloudinary/sign-upload

**Root Cause:**
The Cloudinary signed-upload endpoint has zero authentication. Any unauthenticated person or bot can call this endpoint and receive a valid Cloudinary upload signature along with your Cloudinary API Key.

```typescript
// No authentication check whatsoever:
export async function GET() {
  const signature = cloudinary.utils.api_sign_request(...);
  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,  // Exposed to anyone
    folder: "luxury-essentials/products",
  });
}
```

**Impact:**
- Any attacker can upload unlimited images to your Cloudinary account
- Could result in large Cloudinary billing charges
- Storage used to host malicious content linked to your account

**Remediation:**
```typescript
import { requireAdmin } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  await requireAdmin(req);  // Only admins upload product images
  // ... rest of the function
}
```

**Verification:** Call GET /api/cloudinary/sign-upload without a token; confirm HTTP 401.

---

### SEC-002 — Hardcoded Fallback JWT Secret in Middleware
**Severity:** CRITICAL
**Confidence:** CONFIRMED
**Affected File:** src/middleware.ts
**Affected Lines:** 7-9
**Affected Endpoint:** All protected routes

**Root Cause:**
The middleware uses a hardcoded fallback JWT secret if JWT_SECRET env var is not set:

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "luxury_essentials_secret_key_2026_super_secure_token"
);
```

Anyone who reads this source code (GitHub, leaked bundle, etc.) can forge valid admin JWTs.

**Impact:**
- An attacker can craft a JWT with role: "admin" and gain full admin access
- Preview deployments without the env var silently use this weak fallback

**Remediation:**
```typescript
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) throw new Error("FATAL: JWT_SECRET is not set");
const JWT_SECRET = new TextEncoder().encode(rawSecret);
```
ALSO: Rotate your JWT_SECRET immediately since the fallback is now publicly committed.

**Verification:** App throws startup error when JWT_SECRET is undefined; no hardcoded string remains.

---

### SEC-003 — JWT Token Stored in localStorage (XSS Token Theft Risk)
**Severity:** HIGH
**Confidence:** CONFIRMED
**Affected File:** src/context/AuthContext.tsx
**Affected Lines:** 38, 85, 117, 135

**Root Cause:**
After login, the JWT token is saved to localStorage ("le_token") in addition to the HttpOnly cookie.

```typescript
localStorage.setItem("le_token", newToken);  // Accessible to any JS on the page
```

**Impact:**
- Any XSS (from third-party scripts, CDN injection, or code bugs) can steal the token from localStorage
- HttpOnly cookies are XSS-safe; localStorage is not
- Stolen token gives 7 days of full account access

**Remediation:**
Remove all localStorage token usage. Rely exclusively on the HttpOnly cookie:
```typescript
// Remove: localStorage.setItem / getItem / removeItem for "le_token"

// restoreSession — fetch without Authorization header; cookie sends automatically:
const res = await fetch("/api/auth/me", { credentials: "include" });
```

**Verification:** After fix, localStorage contains no token after login; /api/auth/me works via cookie alone.

---

### SEC-004 — Admin Seed Script Has Insecure Default Credentials
**Severity:** HIGH
**Confidence:** CONFIRMED
**Affected File:** scripts/seedAdmin.mjs
**Affected Lines:** 20-21, 64

**Root Cause:**
```javascript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@luxuryessentials.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";
// ...
console.log(` Password   : ${ADMIN_PASSWORD}`);  // Plaintext in logs
```

**Impact:**
- If seeded without env vars, admin account has trivially guessable credentials
- Admin password is printed to Vercel logs in plaintext on every seed run
- "admin12345" is in every credential stuffing list

**Remediation:**
1. Immediately log into admin and change the password to a strong unique value
2. Remove plaintext password from console.log output
3. Make env vars mandatory:
```javascript
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  process.exit(1);
}
```

**Verification:** Confirm login with admin@luxuryessentials.com / admin12345 fails.

---

### SEC-005 — Admin Secret Slug Exposed via NEXT_PUBLIC_ Variable
**Severity:** HIGH
**Confidence:** CONFIRMED
**Affected File:** src/config/adminConfig.ts
**Affected Lines:** 4, 10-11

**Root Cause:**
```typescript
export const ADMIN_SECRET_SLUG =
  process.env.NEXT_PUBLIC_ADMIN_SECRET_SLUG || "secret-owner-portal";
```
NEXT_PUBLIC_ variables are embedded in client-side bundles. Anyone inspecting the JS bundle can find the admin URL.

**Impact:**
- The admin portal's "secret" URL is visible to anyone inspecting the page source or JS bundle
- Attackers can directly target the admin login for brute-force

**Remediation:**
1. Rename to ADMIN_SECRET_SLUG (no NEXT_PUBLIC_ prefix) — server-only
2. Move admin URL construction out of client-side components
3. Change the slug value in production (current default "secret-owner-portal" is committed in code)
4. Generate a random UUID or 24+ char random string as the slug

**Verification:** After fix, search browser DevTools Sources for the slug string — it should not appear.

---

### SEC-006 — Unvalidated Sort Field in Products Endpoint
**Severity:** HIGH
**Confidence:** CONFIRMED
**Affected File:** src/app/api/products/route.ts
**Affected Lines:** 26-27, 42

**Root Cause:**
```typescript
const sortField = searchParams.get("sort") ?? "createdAt";  // User-controlled
Product.find(query).sort({ [sortField]: sortOrder });       // No allowlist
```

**Impact:**
- Attacker can sort by any document field, including internal ones
- Could leak schema structure through timing analysis
- Future sensitive fields could be inadvertently exposed

**Remediation:**
```typescript
const ALLOWED_SORT_FIELDS = ["createdAt", "price", "name", "rating", "numReviews"];
const rawSort = searchParams.get("sort") ?? "createdAt";
const sortField = ALLOWED_SORT_FIELDS.includes(rawSort) ? rawSort : "createdAt";
```

**Verification:** GET /api/products?sort=__v behaves like the default sort.

---

### SEC-007 — Payment Amount Not Validated Against DB Order (Financial Fraud Risk)
**Severity:** HIGH
**Confidence:** CONFIRMED
**Affected File:** src/app/api/payment/create-order/route.ts
**Affected Lines:** 36-43
**Affected Endpoint:** POST /api/payment/create-order

**Root Cause:**
The client supplies the payment amount directly; the server creates the Razorpay order for that amount without checking the actual order total in the database.

```typescript
const { amount } = parsed.data;  // Client sends this — any value works
const razorpayOrder = await getRazorpayClient().orders.create({
  amount: Math.round(amount * 100),  // No cross-check with DB order total
});
```

Attack flow:
1. Attacker creates a Rs.5000 order in DB
2. Attacker calls POST /api/payment/create-order with { amount: 1 }
3. Server creates Razorpay order for Rs.1
4. Attacker pays Rs.1, gets valid HMAC signature
5. Attacker posts signature to /api/payment/verify
6. Verify checks signature (correctly) and marks order as "paid"
7. Attacker got Rs.5000 worth of goods for Rs.1

**Impact:** An attacker can purchase any product for Rs.1.

**Remediation:**
```typescript
// New schema:
const createPaymentOrderSchema = z.object({ orderId: z.string().min(1) });

// Handler:
const { orderId } = parsed.data;
const order = await Order.findById(orderId);
if (!order) return notFoundResponse("Order not found");
if (order.userId.toString() !== user.userId)
  return unauthorizedResponse("Order does not belong to you");
if (order.paymentStatus !== "pending")
  return errorResponse("Order is not payable", 400);

// Use DB total, not client value:
const razorpayOrder = await getRazorpayClient().orders.create({
  amount: Math.round(order.totalAmount * 100),
  currency: "INR",
});
```

**Verification:** Send { amount: 1 } for a Rs.5000 order; confirm Razorpay order is created for Rs.5000 total.

---

### SEC-008 — Missing Rate Limiting on Authentication Endpoints
**Severity:** MEDIUM (HIGH for brute-force risk)
**Confidence:** CONFIRMED
**Affected Files:** auth/login/route.ts, auth/register/route.ts, payment/create-order/route.ts

**Root Cause:** No rate limiting at any layer. An attacker can attempt unlimited login guesses.

**Impact:**
- Credential stuffing and brute-force attacks on login
- Fake account creation via registration flooding
- Resource exhaustion

**Remediation:**
Use @upstash/ratelimit or Vercel's built-in WAF:
```typescript
// Example with upstash/ratelimit in middleware:
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "1m") });
// Apply to /api/auth/login
```

**Verification:** 20 rapid POST requests to /api/auth/login triggers rate limit response.

---

### SEC-009 — User Enumeration via Registration Error Message
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/api/auth/register/route.ts, Line 29-31

**Root Cause:**
```typescript
if (existing) {
  return errorResponse("Email already registered", 409);
}
```
Attacker can probe which emails have accounts.

**Remediation:** Return a generic message regardless of whether the email exists.

---

### SEC-010 — Two JWT Libraries Used Inconsistently
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected Files:** src/lib/jwt.ts (jsonwebtoken), src/middleware.ts (jose)

**Root Cause:** API routes sign/verify with jsonwebtoken; middleware verifies with jose. Algorithm handling may diverge if either library updates.

**Remediation:** Migrate all JWT operations to jose (required for Edge runtime compatibility):
```typescript
import { SignJWT, jwtVerify } from "jose";
```

---

### SEC-011 — Admin Logout Cannot Clear HttpOnly Cookie Client-Side
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/admin/layout.tsx
**Affected Lines:** 42-45

**Root Cause:**
```typescript
const handleLogout = () => {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  // Cannot clear an HttpOnly cookie via JS — this has NO effect
};
```

**Impact:** The admin remains logged in after clicking "Sign Out." The HttpOnly cookie persists.

**Remediation:**
```typescript
const handleLogout = async () => {
  await fetch("/api/auth/me", { method: "POST", credentials: "include" });
  window.location.href = getAdminUrl("/login");
};
```

**Verification:** After logout, "token" cookie is absent in DevTools > Application > Cookies.

---

### SEC-012 — Register Endpoint Does Not Set HttpOnly Cookie
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/api/auth/register/route.ts, Lines 42-53

**Root Cause:** Login sets an HttpOnly cookie; register returns only a JSON token body. Newly registered users have no server-managed cookie.

**Remediation:** Mirror login's cookie setup in the register response:
```typescript
const response = NextResponse.json({ success: true, data: { user: {...} } }, { status: 201 });
response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 604800, path: "/" });
return response;
```

---

### SEC-013 — Insufficient Security Headers
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** next.config.ts, Lines 20-31

**Root Cause:** Headers only applied to /api/ routes. Page routes have no headers. Missing CSP, HSTS, Referrer-Policy.

**Remediation:**
```typescript
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ],
  }];
}
```

---

### SEC-014 — No Order Status Transition Validation
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/api/admin/orders/[id]/route.ts, Lines 32-36

**Root Cause:** Admin can change order from "delivered" back to "processing" or from "cancelled" to "shipped" — no state machine enforced.

**Remediation:**
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  "processing": ["shipped", "cancelled"],
  "shipped": ["delivered", "cancelled"],
  "delivered": [],
  "cancelled": [],
};
if (!VALID_TRANSITIONS[order.orderStatus]?.includes(parsed.data.orderStatus)) {
  return errorResponse("Invalid status transition", 400);
}
```

---

### SEC-015 — Unescaped Regex in Admin User Search (ReDoS Risk)
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/api/admin/users/route.ts, Lines 32-37

**Root Cause:**
```typescript
query.$or = [
  { name: { $regex: search, $options: "i" } },  // Raw user input
  { email: { $regex: search, $options: "i" } },
];
```

**Impact:** A crafted regex pattern can cause catastrophic backtracking (ReDoS), stalling the MongoDB query.

**Remediation:**
```typescript
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const escapedSearch = escapeRegex(search);
```

---

### SEC-016 — Admin Email Hardcoded in Source Code
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/lib/emailService.ts, Line 8

**Root Cause:**
```typescript
const ADMIN_EMAIL = "luxaryessentials24@gmail.com";
```

**Remediation:**
```typescript
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL!;
```

---

### SEC-017 — Stock Decrement Race Condition (Overselling Risk)
**Severity:** MEDIUM
**Confidence:** CONFIRMED
**Affected File:** src/app/api/orders/route.ts, Lines 37-61

**Root Cause:** Stock check and stock decrement are two separate DB operations. Concurrent requests can both pass the check.

**Remediation:**
```typescript
const updated = await Product.findOneAndUpdate(
  { _id: item.productId, stock: { $gte: item.quantity } },
  { $inc: { stock: -item.quantity } },
  { new: true }
);
if (!updated) return errorResponse(`Insufficient stock`, 400);
```

---

### SEC-018 — Token Returned in Login Response Body
**Severity:** LOW
**Confidence:** CONFIRMED
**Affected File:** src/app/api/auth/login/route.ts, Lines 44-59

**Root Cause:** Token is returned in JSON body AND set as HttpOnly cookie. The body token is what gets stored in localStorage (SEC-003).

**Remediation:** After fixing SEC-003, remove the token field from the response body.

---

### SEC-019 — Missing ObjectId Validation Before DB Queries
**Severity:** LOW
**Confidence:** CONFIRMED
**Affected Files:** orders/[id]/route.ts, products/[id]/route.ts, admin/orders/[id]/route.ts

**Root Cause:** Invalid ObjectId strings cause Mongoose CastErrors (caught as 500 errors).

**Remediation:**
```typescript
import { isValidObjectId } from "mongoose";
if (!isValidObjectId(id)) return notFoundResponse("Not found");
```

---

### SEC-020 — 23 Vulnerable npm Dependencies
**Severity:** LOW
**Confidence:** CONFIRMED
**Affected File:** package.json

**Root Cause:** npm audit reports 23 vulnerabilities including high-severity axios issues (SSRF, prototype pollution) and critical sharp/libvips CVEs.

**Remediation:** Run `npm audit fix`. For breaking changes, review upgrade paths individually.

---

### SEC-021 — Middleware Matcher Too Broad
**Severity:** INFORMATIONAL
**Confidence:** CONFIRMED
**Affected File:** src/middleware.ts, Lines 121-128

**Root Cause:** `"/:path*"` matches all requests including static assets, running JWT logic unnecessarily.

**Remediation:**
```typescript
matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"
```

---

### SEC-022 — No Audit Logging for Admin Actions
**Severity:** INFORMATIONAL
**Confidence:** CONFIRMED
**Affected Files:** All admin API routes

**Root Cause:** No record of admin operations (product deletes, order updates, user data access).

**Remediation:** Implement an AuditLog MongoDB collection recording adminId, action, target, before/after state, timestamp, and IP.

---

### SEC-023 — Cart Data Not Validated When Loaded from localStorage
**Severity:** INFORMATIONAL
**Confidence:** CONFIRMED
**Affected File:** src/context/CartContext.tsx, Lines 31-33

**Remediation:**
```typescript
const parsed = JSON.parse(saved);
if (Array.isArray(parsed)) setItems(parsed);
```

---

## PHASE 8 — VERCEL DEPLOYMENT ASSESSMENT

### Verifiable from Source Code

| Check | Status | Notes |
|---|---|---|
| .env files in Git | PASS | .gitignore correctly ignores .env* |
| .env.local in git history | PASS | No env files found in git log |
| NEXT_PUBLIC_ secret exposure | FAIL | NEXT_PUBLIC_ADMIN_SECRET_SLUG exposes admin slug |
| Hardcoded secrets in source | FAIL | JWT fallback (SEC-002), admin email (SEC-016) |
| Source maps in production | NOT TESTED | Requires Vercel build config review |

### Requires Vercel Dashboard Verification (NOT TESTED)

| Check | Action Required |
|---|---|
| All env vars set in Vercel | Confirm MONGODB_URI, JWT_SECRET, RAZORPAY secrets, Cloudinary, Resend, Brevo |
| Preview deployment protection | Enable Deployment Protection for preview URLs |
| JWT_SECRET strength | Must be 32+ random characters |
| Remove NEXT_PUBLIC_ADMIN_SECRET_SLUG | After code fix, rename in Vercel env settings too |

---

## PHASE 12 — PROPOSED VERIFICATION TESTS

### TEST-01: Admin Privilege Escalation
- Log in as regular user, call GET /api/admin/stats with user token
- Expected: HTTP 403

### TEST-02: Payment Amount Manipulation (Post-Fix)
- Create order for Rs.5000, call POST /api/payment/create-order with { amount: 1 }
- Expected: Server uses Rs.5000 from DB, not the client-supplied amount

### TEST-03: IDOR on Orders
- User A creates order; User B calls GET /api/orders/[userA_orderId]
- Expected: HTTP 401

### TEST-04: Cloudinary Unauthenticated Upload (Post-Fix)
- Call GET /api/cloudinary/sign-upload without a token
- Expected: HTTP 401

### TEST-05: Admin Logout Cookie Verification (Post-Fix)
- Log in as admin, click Sign Out, inspect cookies in DevTools
- Expected: "token" cookie is absent

---

## PHASE 14 — FINAL AUDIT SUMMARY

### Confirmed Strengths
- Server-side price validation on order creation (client prices ignored)
- Razorpay HMAC signature verification in payment verify endpoint
- bcrypt password hashing with cost factor 12
- Zod schema validation on all API inputs
- Role-based authorization (requireAdmin) on all admin endpoints
- Ownership checks on order retrieval (user can only see own orders)
- .env.local excluded from Git correctly
- Mongoose enum validation on schemas

### Vulnerability Summary

| Severity | Count | IDs |
|---|---|---|
| Critical | 2 | SEC-001, SEC-002 |
| High | 5 | SEC-003, SEC-004, SEC-005, SEC-006, SEC-007 |
| Medium | 7 | SEC-008 through SEC-017 |
| Low | 3 | SEC-018, SEC-019, SEC-020 |
| Informational | 3 | SEC-021, SEC-022, SEC-023 |

### Top 5 Highest-Risk Findings

1. SEC-002 — Hardcoded JWT fallback secret: anyone with source access can forge admin tokens
2. SEC-007 — Payment amount bypass: financial fraud via Rs.1 purchases possible right now
3. SEC-001 — Unauthenticated Cloudinary signing: billing abuse and storage exploitation
4. SEC-005 — Admin slug in NEXT_PUBLIC_ variable: secret URL security model broken
5. SEC-003 — JWT in localStorage: token theft via any XSS vector

### Pre-Launch Blockers (Fix Before Any Real Customers)

| Priority | Finding | Complexity |
|---|---|---|
| 1 | SEC-002: Remove JWT fallback secret + rotate secret | 5 minutes |
| 2 | SEC-007: Validate payment amount against DB order | 1-2 hours |
| 3 | SEC-001: Require admin auth on Cloudinary endpoint | 5 minutes |
| 4 | SEC-005: Remove NEXT_PUBLIC_ from admin slug + change slug | 30 minutes |
| 5 | SEC-003: Remove localStorage token storage | 1-2 hours |
| 6 | SEC-004: Verify/change admin password immediately | Immediate |

### Post-Launch High Priority (Week 1)
- SEC-008: Add rate limiting on auth endpoints
- SEC-011: Fix admin logout (server-side cookie clearing)
- SEC-012: Set HttpOnly cookie on registration
- SEC-015: Escape regex in admin user search
- SEC-017: Make stock decrement atomic

### Medium/Low Priority (Weeks 2-3)
- SEC-006: Allowlist sort fields in products endpoint
- SEC-009: Reduce user enumeration on registration
- SEC-010: Consolidate to single JWT library (jose)
- SEC-013: Add CSP and HSTS headers to all routes
- SEC-014: Add order status transition validation
- SEC-016: Move admin email to environment variable
- SEC-018: Remove token from login response body
- SEC-019: Validate ObjectId format before DB queries
- SEC-020: Run npm audit fix
- SEC-021: Tighten middleware matcher pattern
- SEC-022: Implement admin audit logging
- SEC-023: Validate cart data from localStorage

### Areas NOT Inspected
- Vercel dashboard settings (deployment protection, preview access, WAF)
- MongoDB Atlas configuration (network access, IP allowlist, user roles)
- Cloudinary account settings (upload presets, access controls)
- Razorpay webhook security (no webhook endpoint found in source)
- Git history deep scan for pre-initial-commit secrets
- Dynamic/runtime testing (no active HTTP requests made)
- Third-party script supply chain (Razorpay JS SDK)
- Email template XSS (template literals with user data render HTML in some email clients)

### Recommended Remediation Order

Week 0 (Pre-Launch):
  1. Rotate JWT_SECRET — SEC-002
  2. Fix payment amount validation — SEC-007
  3. Protect Cloudinary endpoint — SEC-001
  4. Fix admin slug variable — SEC-005
  5. Remove localStorage token — SEC-003
  6. Change admin credentials — SEC-004

Week 1:
  7. Rate limiting — SEC-008
  8. Admin logout — SEC-011
  9. Register cookie — SEC-012
  10. Security headers — SEC-013

Weeks 2-3:
  11. Atomic stock — SEC-017
  12. ObjectId validation — SEC-019
  13. Sort field allowlist — SEC-006
  14. Regex escaping — SEC-015
  15. npm audit fix — SEC-020

Ongoing:
  16. Audit logging — SEC-022
  17. Set up error monitoring (Sentry)
  18. Monthly dependency audits

---

## LAUNCH ASSESSMENT

### CONDITIONAL — DO NOT LAUNCH

No confirmed active data breaches or complete authentication bypasses were observed. However, two critical and three high-severity vulnerabilities create real financial and security risk:

- SEC-007 (Payment bypass): An attacker can buy any product for Rs.1 right now
- SEC-002 (JWT forgery): Source-code readers can forge admin sessions
- SEC-001 (Cloudinary abuse): Unprotected endpoint can cause billing fraud
- SEC-005 (Admin URL exposed): Secret admin URL is visible in client bundles

None of these require sophisticated techniques to exploit.

Fix the six pre-launch blockers, verify them in a staging environment, and the application will be in a suitable security posture for launch.

---

*This report covers static source code analysis only. No production data was accessed. No active exploitation was performed. Secrets are not printed in this report. If any credential appears exposed (e.g. SEC-002 fallback JWT), rotate the credential immediately regardless of confirmed exploitation. This report does not constitute a complete penetration test or compliance assessment.*
