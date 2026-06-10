# Ghaly Gents Salon Digital Service Form
## Codex Implementation Brief — V1

**Project type:** reusable Astro + Cloudflare teaser product  
**First target business:** Ghaly Gents Salon / صالون غالي للرجال  
**Primary goal:** digitize the salon's existing paper service-selection workflow into a working mobile-first web experience that can be demonstrated to the owners as a teaser.  
**Secondary goal:** keep the code reusable so the same small operational shell can be adapted for another salon or small business if this lead does not convert.

---

## 1. Business context

A roommate suggested Ghaly Gents Salon as a potential website client. The salon already uses a printed service-selection form at reception. Instead of pitching a generic website verbally or building a full free website, the plan is to build one small operational asset that solves a real visible problem:

1. The customer scans a QR code or opens a URL.
2. The customer chooses one of the salon packages.
3. The customer selects the permitted services.
4. The customer enters their name, phone number, optional staff preference, and notes.
5. The request is saved in a Cloudflare D1 database.
6. A Telegram bot sends the salon a notification.
7. Authorized salon staff open a protected dashboard route and see incoming requests.

This must feel like a small real product, not a disposable design mock-up. It must also remain deliberately narrow. Do not turn it into a salon ERP before the owner pays.

---

## 2. Source material

The original paper form is included separately:

`Ghaly_Gents_Double_A4_Form_260523_203435.pdf`

The PDF contains two duplicated copies of the same A5-style form on a single A4 sheet for printing and cutting. Use one side as the design reference.

### Information visible in the PDF

The paper form includes:

- Brand name: `GHALY GENTS SALON`
- Arabic brand name: `صالون غالي للرجال`
- Shield logo with a crown and the letter `G`
- Black, gold, and warm ivory visual identity
- Decorative grooming icons: scissors, comb, and shaving brush
- Fields:
  - Name / الاسم
  - Phone / Phone
  - Date / التاريخ
  - Staff / الموظف
  - Notes / ملاحظات
- Three service packages:
  - `AED 95 OFFER`
  - `AED 150 OFFER`
  - `ROYAL VIP AED 300`

The PDF is sufficient to build a convincing concept teaser. It is not sufficient for a final production website because the original vector logo and approved photography are still missing.

---

## 3. Product decision

Build **one Astro application** with two surfaces:

### Public surface

`/`

A static-first public landing page containing the digital service-selection form.

### Protected staff surface

`/control/orders`

A private dashboard shell that is protected by Cloudflare Access. Staff should not need a custom application account system for the teaser.

### API surface

Use a small number of dynamic Astro server endpoints:

- `POST /api/orders`
- `GET /api/control/orders`
- `PATCH /api/control/orders/[id]`

Protect the control API routes with Cloudflare Access as well:

- `/api/control/*`

---

## 4. Why Astro + Cloudflare Workers

Astro remains static-first.

Normal `.astro` pages are rendered into HTML during the build and can be delivered as static assets. React islands or small browser scripts hydrate only the interactive parts. The public landing page does not need server-side rendering.

For this project, Astro also needs a few trusted API endpoints. Add the official Cloudflare adapter and deploy the project to **Cloudflare Workers**, not Pages, because the current Astro Cloudflare adapter uses Workers for on-demand routes and full-stack features.

The deployment still preserves static-site economics:

- Static HTML, CSS, JavaScript bundles, images, and icons are served as static assets.
- Static files should be served before Worker code by default.
- The Worker runs only for dynamic API calls or any route explicitly configured for on-demand rendering.
- Do not globally configure `assets.run_worker_first: true`.
- Do not set the entire project to `output: "server"` unless a real need appears.
- Keep public pages prerendered.
- Add `export const prerender = false` only to runtime API endpoints.

### Mental model

```text
Astro build
  -> prerendered HTML, CSS, JS, and images
  -> uploaded as static assets with the Worker deployment
  -> delivered directly for normal website visits

Interactive React island in the browser
  -> opens modal
  -> validates selection UX
  -> submits JSON to POST /api/orders

Astro API endpoint running on Cloudflare Worker
  -> validates trusted business rules
  -> writes order to D1
  -> starts Telegram notification
  -> returns order number
```

This is not a heavy server-rendered application. It is a static Astro site with a small trusted backend beside it.

---

## 5. Recommended UI implementation

Use Astro for the page shell and React islands only where interactivity is useful.

Suggested components:

```text
src/
  components/
    public/
      ServiceOrderForm.tsx
      PackageCard.tsx
      ServiceSelectionSheet.tsx
      SubmissionSuccess.tsx
    control/
      OrdersDashboard.tsx
      OrderCard.tsx
      OrdersTable.tsx
      OrderDetailsModal.tsx
      StatusBadge.tsx
  pages/
    index.astro
    control/
      orders.astro
    api/
      orders.ts
      control/
        orders.ts
        orders/
          [id].ts
  config/
    salon.ts
    packages.ts
    services.ts
  lib/
    validation.ts
    telegram.ts
    db.ts
  styles/
    global.css
```

The exact structure may change slightly if the repository already has conventions, but keep the separation between:

- static configuration
- browser UI
- server-side validation
- D1 persistence
- Telegram notification

Do not introduce a separate Hono backend unless the implementation genuinely needs it. Astro endpoints are sufficient for V1.

---

## 6. Public page UX

### 6.1 Welcome area

The page should feel like a small salon app, not a generic form.

Include:

- cleaned logo extracted from the PDF as a temporary teaser asset
- salon name in English and Arabic
- short bilingual instruction
- three visually prominent package cards
- a small `Concept Preview` label in the footer until the salon approves the product

### 6.2 Package cards

Use the existing package hierarchy from the paper form.

#### Package A — AED 95

```text
AED 95 OFFER
5 SERVICES INCLUDED
```

This package appears to include these five fixed services:

1. Haircut / حلاقة شعر
2. Beard Shave / حلاقة لحية
3. Hand Pedicure / بديكير يدين
4. Foot Pedicure / بديكير قدمين
5. Hair Wash / غسيل شعر

For this package, show the included services clearly. The customer does not need to choose them unless the owner later confirms that substitutions are allowed.

#### Package B — AED 150

```text
AED 150 OFFER
CHOOSE ANY 7 SERVICES
```

The customer chooses up to seven services from the expanded list.

#### Package C — Royal VIP AED 300

```text
ROYAL VIP AED 300
CHOOSE ANY 10 SERVICES
```

The customer chooses up to ten services from the expanded list.

### 6.3 Selection UI

When a package card is clicked:

- desktop: open a centered modal
- mobile: open a full-screen sheet or drawer rather than a cramped small modal

Always display a visible counter:

```text
4 of 7 services selected
```

When the maximum is reached:

- disable unchecked options
- allow the user to remove selected options
- explain why remaining options are disabled

### 6.4 Customer fields

After service selection, collect:

- customer name
- phone number
- optional staff preference
- optional notes

Generate the submission timestamp on the server. Do not trust a date sent from the browser.

Because the staff list is currently unknown, use either:

- `Any available staff`
- optional free-text staff preference

Replace this with a real staff dropdown only after the owner provides names.

### 6.5 Confirmation

Before submission, show a concise confirmation summary.

After submission, show:

```text
Request #104 received.
Please speak with reception.
```

Do not create customer accounts. This is a digital reception form, not a consumer account system.

---

## 7. Service catalogue from the PDF

Use static configuration files for V1. Do not build a content-management screen before the salon hires us.

The expanded offer list visible in the paper form is:

| ID | English | Arabic |
|---|---|---|
| `moroccan_bath_or_facial` | Moroccan Bath OR Facial Session | حمام مغربي أو جلسة فيشل |
| `body_scrub` | Body Scrub | تقشير الجسم |
| `haircut` | Haircut | حلاقة شعر |
| `beard_shave` | Beard Shave | حلاقة لحية |
| `hair_blow_dry` | Hair Blow Dry | تنشيف شعر |
| `collagen_face_mask` | Collagen Face Mask | ماسك كولاجين للوجه |
| `face_scrub` | Face Scrub | مقشر للوجه |
| `nose_wax` | Nose Wax | واكس أنف |
| `ear_wax` | Ear Wax | واكس أذن |
| `face_wax` | Face Wax | واكس وجه |
| `face_threading` | Face Threading | خيط وجه |
| `hot_towel` | Hot Towel | فوطة حارة |
| `cold_towel` | Cold Towel | فوطة باردة |
| `hair_oil_bath` | Hair Oil Bath | حمام زيت للشعر |
| `shoulder_massage` | Shoulder Massage | مساج للكتف |
| `head_massage` | Head Massage | مساج للرأس |
| `hand_pedicure` | Hand Pedicure | بديكير يدين |
| `foot_pedicure` | Foot Pedicure | بديكير قدمين |
| `foot_scrub` | Foot Scrub | سكراب قدمين |
| `foot_massage` | Foot Massage | مساج قدمين |
| `hair_mask` | Hair Mask | ماسك للشعر |
| `facial_steam` | Facial Steam | بخار للوجه |

### Important open question

The printed line `Moroccan Bath OR Facial Session` may represent a mutually exclusive choice between two services. The teaser may display it as one combined option temporarily, but confirm the intended rule with the owner before calling the workflow final.

---

## 8. Protected dashboard UX

Route:

`/control/orders`

This is a static Astro dashboard shell with a React island that requests order data from the protected API.

### Desktop layout

Show a compact table with:

- order number
- submission time
- customer name
- phone number
- package
- selected service count
- status
- action button

### Mobile layout

Show stacked cards with:

- request number
- customer name
- phone
- package
- time
- status badge

Clicking a row or card opens a details modal with:

- customer details
- selected package
- full selected-service list
- staff preference
- notes
- created timestamp
- current status
- buttons to change status

### Statuses

Keep V1 narrow:

```text
new
acknowledged
completed
cancelled
```

Use human-readable labels in the UI:

```text
New
Acknowledged
Completed
Cancelled
```

Add:

- filter for new orders
- filter for today's orders
- manual refresh button
- automatic refresh every 10–15 seconds

Do not add real-time sockets in V1.

---

## 9. Cloudflare Access instead of custom authentication

Do not build a password database, login page, password reset flow, roles system, or customer authentication.

Use Cloudflare Access in front of:

```text
/control/*
/api/control/*
```

Cloudflare Access can protect specific URL paths before the request reaches the application.

For the teaser, allow only approved email addresses. The owner can authenticate through Cloudflare Access email one-time PIN login. A PIN is sent to an approved email address and the authenticated session can remain active according to the Access policy.

A fixed shared PIN is not provided automatically by Cloudflare Access. Building a shared salon PIN inside the app is possible later, but do not do it in V1 unless the owner genuinely cannot use email OTP.

### Access setup checklist

1. Create or enable Cloudflare Zero Trust organization.
2. Add a self-hosted Access application for `/control/*`.
3. Add a second Access application for `/api/control/*` if needed.
4. Configure an Allow policy for approved email addresses.
5. Enable email OTP login for the owner if they do not have a Cloudflare account.
6. Verify that unauthenticated visitors cannot:
   - open `/control/orders`
   - call `GET /api/control/orders`
   - call `PATCH /api/control/orders/[id]`

---

## 10. D1 database

Use one Cloudflare D1 database for the teaser.

### Minimal schema

Create a migration such as:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  package_code TEXT NOT NULL,
  selected_services_json TEXT NOT NULL,
  staff_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  telegram_notified_at TEXT,
  telegram_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);
```

Use static TypeScript configuration for packages and services rather than database tables in V1.

### Why JSON is acceptable here

The dashboard only needs to show the selected service IDs for one order. Storing the selected service IDs as JSON keeps the teaser small and fast to implement.

Normalize into `order_items` later only if reporting, analytics, or catalogue editing becomes a real requirement.

---

## 11. API contract

### 11.1 Submit an order

`POST /api/orders`

Example request:

```json
{
  "customerName": "Ahmed",
  "phone": "0500000000",
  "packageCode": "offer_150",
  "selectedServiceIds": [
    "haircut",
    "beard_shave",
    "face_scrub",
    "hair_wash",
    "head_massage",
    "hand_pedicure",
    "nose_wax"
  ],
  "staffPreference": "Any available staff",
  "notes": ""
}
```

Example success response:

```json
{
  "ok": true,
  "orderId": 104
}
```

### 11.2 Load orders

`GET /api/control/orders?status=new&date=today`

Return only the fields needed by the dashboard.

### 11.3 Update status

`PATCH /api/control/orders/[id]`

Example request:

```json
{
  "status": "acknowledged"
}
```

Validate that the submitted status belongs to the allowed set.

---

## 12. Server-side validation

The browser experience is not a security boundary. Revalidate all business rules on the Worker.

For `POST /api/orders`:

- trim strings
- reject missing customer name
- validate phone length and allowed characters
- reject unknown package codes
- reject unknown service IDs
- reject duplicate service IDs
- enforce package limits
- for AED 95, use or verify the fixed included-service list
- for AED 150, allow no more than seven services
- for Royal VIP AED 300, allow no more than ten services
- limit note length
- never accept status from the public submission body
- generate timestamps on the server

Add rate limiting or basic abuse protection if exposed publicly.

Before placing the QR code in the salon, add Cloudflare Turnstile to the public submission form and validate the Turnstile token on the server through Siteverify. Client-side Turnstile alone is not sufficient.

---

## 13. Telegram notification

Telegram is the reception bell, not the order database.

The source of truth is D1. Save the order first. Then notify Telegram. A Telegram failure must never erase or reject a valid saved order.

### Secrets

Store secrets through Wrangler, never in browser code or committed files:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TURNSTILE_SECRET_KEY
```

Public configuration may include:

```text
TURNSTILE_SITE_KEY
CONTROL_DASHBOARD_URL
```

### Suggested notification

```text
New Ghaly request #104

Package: AED 150 Offer
Customer: Ahmed
Phone: 0500000000
Services selected: 7
Staff preference: Any available staff

Open dashboard:
https://example.com/control/orders
```

When using Astro 6 with the Cloudflare adapter, bindings can be imported from:

```ts
import { env } from "cloudflare:workers";
```

The Cloudflare execution context is available through:

```ts
Astro.locals.cfContext
```

Use:

```ts
Astro.locals.cfContext.waitUntil(...)
```

for Telegram notification work after the order has been persisted, so the customer does not wait for Telegram. Log notification failure into `telegram_error`.

---

## 14. Visual direction

### Temporary palette extracted from the paper form

Use this as an approximate teaser palette and refine it later if the owner supplies brand files:

```css
:root {
  --brand-black: #070707;
  --brand-gold: #D49A22;
  --brand-gold-light: #F0D07A;
  --brand-ivory: #FFF9EA;
  --brand-text: #16120A;
}
```

### Visual rules

- black top section or hero
- gold borders and package accents
- warm ivory page background
- readable bilingual labels
- restrained ornamentation
- clean modern spacing
- large tap targets
- no excessive animations
- no generic luxury stock-photo overload

The operational workflow is the hero. Do not bury it under a full marketing site.

### Logo

For the teaser, extract and clean the shield logo from the supplied PDF.

For production, ask the owner for:

- original SVG, PDF, AI, or high-resolution PNG logo
- approved brand colors
- permission to reuse social media content
- four to six approved interior/exterior photographs

---

## 15. Public asset reconnaissance

The following online pages were found and may help with visual research. Treat third-party directory content as reference material, not authoritative production data.

### Official-looking Instagram profile

`https://www.instagram.com/ghalysalon/`

The profile identifies the salon as a men's salon and Moroccan bath business and lists public booking phone numbers. Review posts manually for current offers, interior images, storefront photos, and branding. Do not republish images in a live production site without owner approval.

### 2GIS listing

`https://2gis.ae/dubai/firm/70000001091206015`

The listing places the salon at Al Mamzar Centre in Hor Al Anz East, Deira, Dubai and shows that at least one photo is available. Directory hours and phone numbers must be confirmed with the owner before production.

### HiDubai listing

`https://www.hidubai.com/businesses/ghaly-gents-salon-beauty-wellness-health-beauty-salons-hor-al-anz-east-dubai`

This listing may expose a storefront image and basic location information. Use images only as temporary concept references until permission is obtained.

### Additional third-party directory

`https://salonsindubai.ae/ghaly-gents-salon-deira`

This directory includes a salon image, services, location, phone, WhatsApp, hours, and reviews. It is useful for reconnaissance but should not override owner-confirmed information.

### Google Maps

Manually inspect Google Maps in a normal browser before final visual work. Confirm:

- exact listing
- current opening hours
- address
- storefront photos
- interior photos
- logo variants
- recent customer-uploaded images
- current phone number
- owner permission for production reuse

Do not automatically scrape or publish customer-uploaded Google Maps photos.

---

## 16. Explicit non-goals for V1

Do not build:

- customer accounts
- staff accounts inside the application
- password reset flows
- complex role permissions
- appointment calendars
- loyalty points
- payments
- invoices
- editable catalogue screens
- analytics dashboards
- audit logs
- WebSockets
- full CRM
- a general-purpose salon ERP
- a full marketing website with many pages

The teaser should be operational, polished, and small.

---

## 17. Implementation order

### Phase 0 — inspect and plan

Before writing code:

1. Inspect the repository if one already exists.
2. Confirm Astro version and package manager.
3. Identify existing styling conventions.
4. Confirm whether a Cloudflare account, domain, and D1 database are already available.
5. Summarize the implementation plan before making major architectural changes.

### Phase 1 — static UX prototype

1. Create Astro project if absent.
2. Add React integration only if needed.
3. Add global CSS tokens.
4. Build public landing page.
5. Build package cards.
6. Build mobile full-screen service sheet and desktop modal.
7. Add browser-side validation and confirmation screen.
8. Use mock submission temporarily.

### Phase 2 — Cloudflare Worker and D1

1. Add `@astrojs/cloudflare`.
2. Keep normal pages prerendered.
3. Create D1 database and migration.
4. Bind D1 as `DB`.
5. Implement `POST /api/orders`.
6. Validate all public input server-side.
7. Persist and return order number.

### Phase 3 — protected dashboard

1. Build `/control/orders` static shell.
2. Build dashboard React island.
3. Implement `GET /api/control/orders`.
4. Implement `PATCH /api/control/orders/[id]`.
5. Add desktop table and mobile cards.
6. Add status updates and filters.
7. Configure Cloudflare Access for `/control/*` and `/api/control/*`.

### Phase 4 — Telegram

1. Create Telegram bot with BotFather.
2. Store token and chat ID as secrets.
3. Save order first.
4. Trigger notification with `waitUntil`.
5. Store notification error if Telegram fails.

### Phase 5 — public hardening

1. Add Cloudflare Turnstile.
2. Validate Siteverify token server-side.
3. Add reasonable input size limits.
4. Add basic anti-spam/rate-limiting strategy.
5. Test Access bypass attempts.
6. Test mobile UX.

---

## 18. Acceptance checklist

### Public page

- [ ] Works well on a narrow mobile screen.
- [ ] Displays the three packages from the paper form.
- [ ] AED 95 clearly shows its five fixed included services.
- [ ] AED 150 enforces a seven-service maximum.
- [ ] Royal VIP AED 300 enforces a ten-service maximum.
- [ ] Customer can enter name, phone, optional staff preference, and notes.
- [ ] Submission returns an order number.
- [ ] Customer never sees dashboard data.

### Database and API

- [ ] Public API rejects unknown packages.
- [ ] Public API rejects unknown services.
- [ ] Public API rejects duplicates.
- [ ] Public API enforces package limits.
- [ ] Timestamps are generated on the server.
- [ ] A Telegram failure does not lose the order.

### Dashboard

- [ ] `/control/orders` is inaccessible without Cloudflare Access authentication.
- [ ] `/api/control/orders` is inaccessible without Cloudflare Access authentication.
- [ ] Desktop table works.
- [ ] Mobile cards work.
- [ ] Order details modal shows services and notes.
- [ ] Staff can move an order through statuses.
- [ ] Filters work.
- [ ] Automatic refresh works without WebSockets.

### Security

- [ ] No Telegram secret appears in client JavaScript.
- [ ] No D1 binding is exposed to browser code.
- [ ] Turnstile is verified server-side before production QR deployment.
- [ ] Notes and text values are escaped safely when rendered.
- [ ] Protected API routes cannot be bypassed by directly calling them.

---

## 19. Owner questions to ask after the teaser gets attention

Do not block the initial teaser on these questions, but collect them before production:

1. Is the AED 95 package fixed, or may customers substitute services?
2. For the AED 150 and AED 300 packages, is `Moroccan Bath OR Facial Session` a single combined option or two mutually exclusive services?
3. What are the current opening hours?
4. What is the correct primary phone and WhatsApp number?
5. Which Telegram chat should receive notifications?
6. Should customers choose a named staff member or simply request any available staff?
7. Can the owner provide the original logo?
8. Can the owner provide approved interior and exterior photos?
9. May we reuse selected Instagram images?
10. Should orders remain stored permanently or be cleaned after a defined retention period?

---

## 20. Later expansion path, only after payment

The narrow teaser can grow into:

- editable services and packages
- staff list management
- availability toggles
- appointment booking
- opening-hours editor
- richer Telegram notifications
- WhatsApp integration
- QR codes at reception
- basic customer history
- a real bilingual marketing website
- proper app-level authentication and staff roles if the salon grows beyond Access OTP

Do not build these in V1.

---

## 21. Verified technical references

Astro and Cloudflare:

- Astro Cloudflare adapter:  
  `https://docs.astro.build/en/guides/integrations-guide/cloudflare/`
- Astro endpoints:  
  `https://docs.astro.build/en/guides/endpoints/`
- Astro Cloudflare deployment:  
  `https://docs.astro.build/en/guides/deploy/cloudflare/`
- Cloudflare Workers static assets:  
  `https://developers.cloudflare.com/workers/static-assets/`
- Static asset routing and Worker-script-first behavior:  
  `https://developers.cloudflare.com/workers/static-assets/routing/worker-script/`

Cloudflare Access:

- Access application paths:  
  `https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/`
- Access HTTP applications:  
  `https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/`
- Access one-time PIN login:  
  `https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/`

Cloudflare D1 and Turnstile:

- D1 overview:  
  `https://developers.cloudflare.com/d1/`
- D1 limits:  
  `https://developers.cloudflare.com/d1/platform/limits/`
- Turnstile server-side validation:  
  `https://developers.cloudflare.com/turnstile/get-started/server-side-validation/`

Telegram:

- Telegram Bot API:  
  `https://core.telegram.org/bots/api`
- Telegram bot tutorial:  
  `https://core.telegram.org/bots/tutorial`

---

## 22. Core principle

Build one reusable operational shell:

```text
Static Astro public page
+ React island for customer interaction
+ Astro API endpoints on Cloudflare Worker
+ D1 as the source of truth
+ Telegram as a notification bell
+ Cloudflare Access around private routes
```

The sales demonstration is simple:

1. Scan the QR code.
2. Choose a package.
3. Submit a service request.
4. Open the protected dashboard.
5. Watch the request appear.

That is enough to show the owners what hiring us changes.
