You are a senior full-stack SaaS engineer, SvelteKit expert, Supabase security expert, Vercel deployment expert, and UI/UX designer.

Think deeply before coding. Double-check every security rule, database relationship, route protection, RLS policy, and edge case.

Build a COMPLETE production-ready MVP SaaS web app.

==================================================
APP INFO
==================================================

App Name: Vazix
Domain: vazix.app
Tagline EN: Create your shop. Get orders on WhatsApp.
Tagline AR: أنشئ متجرك واستقبل الطلبات عبر واتساب

Vazix is a SaaS platform for small shops.

Shop owners create a public ordering page.
Customers browse products, add to cart, choose pickup or delivery, and send the order to the shop via WhatsApp.

No WhatsApp API is used.
No payment gateway in V1.
Customer accounts are NOT used.

==================================================
TECH STACK
==================================================

Use:

- SvelteKit latest
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vercel deployment
- Mobile-first responsive UI

==================================================
CORE RULES
==================================================

1. Customers do NOT create accounts.
2. Shop owners DO create accounts.
3. Super admin uses the same auth system but role = super_admin.
4. Use Supabase email magic link login.
5. No passwords in V1.
6. No WhatsApp Business API.
7. No Meta API.
8. No payment gateway in V1.
9. Subscriptions are manual.
10. Every new shop gets automatic 30-day free trial.
11. Orders must be saved before WhatsApp opens.
12. Service role key must never be exposed to the browser.
13. All sensitive checks must be server-side.
14. App must fully support English and Arabic.

==================================================
ROLES
==================================================

Roles:

1. super_admin
- Platform owner
- Can access /admin
- Can manage all shops, subscriptions, users, orders

2. shop_owner
- Can access /dashboard
- Can manage only own shops/products/orders

3. public_customer
- No login
- Can view active public shop pages
- Can create orders only for active shops

==================================================
AUTH SYSTEM
==================================================

Use Supabase email magic link.

Auth flow:

1. User opens /login
2. User enters email
3. Supabase sends magic link
4. User clicks link
5. User is logged in
6. If profile incomplete, redirect to /onboarding
7. User completes:
   - full_name
   - WhatsApp number
   - city

No passwords.
No password reset.
No customer login.

Admin login:
- Admin logs in using same magic link flow.
- Admin access is based on profiles.role = 'super_admin'.

Important:
- Admin routes must be protected server-side.
- Dashboard routes must be protected server-side.
- Never rely only on client-side role checks.

==================================================
INTERNATIONALIZATION / BILINGUAL SYSTEM
==================================================

The app MUST fully support:

- English
- Arabic

Default:
- Detect browser language.
- If Arabic browser, use Arabic.
- Otherwise use English.
- Allow manual language switch.

Language switch:
- Add EN / عربي toggle in navbar/dashboard.
- Store selected language in localStorage.
- Apply immediately if possible.

RTL:
When Arabic is selected:
- Set html dir="rtl"
- Text alignment right
- Dashboard sidebar direction adjusted
- Buttons, icons, margins, grids adjusted for RTL
- Forms must look natural in Arabic

LTR:
When English is selected:
- Set html dir="ltr"

Translations:
- No hardcoded UI text.
- All labels/buttons/errors/messages must come from translation files.
- Use JSON translation files.

Example files:
src/lib/i18n/en.json
src/lib/i18n/ar.json

Must translate:
- Landing page
- Login
- Onboarding
- Dashboard
- Shop settings
- Product management
- Subscription pages
- Admin panel
- Public shop page
- Cart/checkout
- Error states
- Toast messages
- Empty states

Fonts:
- English: Inter
- Arabic: Tajawal or Cairo

Price format:
- SAR currency
- Consistent in English and Arabic

Date/time:
- Locale-aware formatting
- Arabic-friendly date display

Goal:
The app must feel native in both English and Arabic.

==================================================
ROUTES
==================================================

Public routes:
- /
- /login
- /auth/callback
- /shop/[slug]
- /shop/[slug]/cart

Protected shop owner routes:
- /onboarding
- /dashboard
- /dashboard/shops
- /dashboard/shops/new
- /dashboard/shops/[id]
- /dashboard/shops/[id]/edit
- /dashboard/shops/[id]/products
- /dashboard/shops/[id]/products/new
- /dashboard/shops/[id]/products/[productId]/edit
- /dashboard/shops/[id]/orders
- /dashboard/shops/[id]/subscription

Protected admin routes:
- /admin
- /admin/shops
- /admin/users
- /admin/orders
- /admin/subscriptions
- /admin/subscription-logs

==================================================
PUBLIC LANDING PAGE
==================================================

Route: /

Modern SaaS landing page.

Sections:
1. Navbar
   - Vazix logo/name
   - Language toggle
   - Login button

2. Hero
   - Headline EN/AR
   - Tagline
   - CTA: Start free trial
   - CTA: View demo shop

3. Features
   - Online shop page
   - WhatsApp ordering
   - Pickup/delivery
   - Product management
   - QR code sharing
   - Arabic/English support

4. How it works
   - Create shop
   - Add products
   - Share link/QR
   - Receive orders on WhatsApp

5. Pricing
   - 30-day free trial
   - 99 SAR/month
   - 999 SAR/year
   - Manual payment for V1

6. FAQ
7. Footer

UI style:
- Premium startup look
- Attractive modern design
- Soft gradients
- Rounded cards
- Mobile-first

==================================================
SHOP OWNER DASHBOARD
==================================================

Dashboard layout:
- Sidebar
- Topbar
- Language toggle
- Logout
- Mobile responsive drawer

Sections:

1. Overview
- total shops
- active shops
- total products
- recent orders
- subscription status summary

2. My Shops
- list shops
- shop status badge
- copy shop link
- show/download QR code
- edit button
- manage products button

3. Create Shop
Fields:
- shop name
- slug
- city
- description
- WhatsApp number
- logo upload

When shop is created:
- subscription_status = trial
- subscription_started_at = now()
- subscription_expires_at = now() + 30 days
- is_active = true

4. Edit Shop
Fields:
- name
- slug
- city
- description
- WhatsApp number
- logo
- pickup_enabled
- delivery_enabled
- pickup_time_slots
- delivery_time_slots
- delivery_fee
- minimum_delivery_order

5. Products
Shop owner can:
- create product
- edit product
- delete product
- activate/deactivate product
- upload product image
- set category
- set sort order

6. Orders
Shop owner can view own shop orders:
- customer name
- customer phone
- fulfillment type
- total
- order items
- created time

7. Subscription
Display:
- status
- expiry date
- days remaining
- renewal instructions
- your WhatsApp support contact placeholder

==================================================
PUBLIC SHOP PAGE
==================================================

Route: /shop/[slug]

Display:
- Shop logo
- Shop name
- City
- Description
- Pickup/delivery availability
- Product category filters
- Product grid
- Sticky cart bar on mobile

Product card:
- image
- name
- description
- price
- add to cart button

If shop inactive/expired/paused:
Show localized message:
EN: This shop is temporarily inactive.
AR: هذا المتجر غير متاح مؤقتاً.

Do not show checkout button for inactive shops.

==================================================
CART AND CHECKOUT
==================================================

Route: /shop/[slug]/cart

Cart:
- Stored in localStorage per shop slug
- Cart from one shop must not mix with another shop
- Quantity controls
- Remove item
- Subtotal

Checkout customer fields:
- customer_name
- customer_phone
- notes

Fulfillment options:
- Pickup
- Delivery

Rules:
- Show Pickup only if pickup_enabled = true
- Show Delivery only if delivery_enabled = true
- If both false, disable checkout

Pickup fields:
- preferred pickup time

Delivery fields:
- delivery area/neighborhood
- landmark
- optional Google Maps link
- preferred delivery time

Delivery logic:
- Add delivery fee only for delivery
- If subtotal < minimum_delivery_order, block delivery and show message

Location logic:
Use simple V1 location:
- Area/neighborhood
- Landmark
- Optional Google Maps link
- Notes
- Add message asking customer to share live location in WhatsApp if needed

Do NOT use GPS/live tracking in V1.

Phone validation:
- Accept Saudi format
- Normalize where possible
- Show user-friendly errors

Order flow:
1. Validate cart and customer data
2. Validate shop is active and not expired
3. Save order to database
4. Generate WhatsApp link
5. Open WhatsApp
6. Show success message
7. Clear cart after successful order save/open

If database save fails:
- Do not open WhatsApp
- Show error

==================================================
WHATSAPP LOGIC
==================================================

Use wa.me link only.

Format:
https://wa.me/{shop_whatsapp_number}?text={encoded_message}

Normalize WhatsApp number:
- Remove spaces
- Remove +
- Ensure country code format
- Example Saudi: 9665XXXXXXXX

Message format EN:

New Order from Vazix

Shop: {shop_name}

Order Type: {Pickup/Delivery}

Customer:
Name: {customer_name}
Phone: {customer_phone}

If delivery:
Location:
Area: {delivery_area}
Landmark: {delivery_landmark}
Map Link: {delivery_map_link}
Delivery Time: {preferred_time}

If pickup:
Pickup Time: {preferred_time}

Items:
{quantity}x {product_name} - {line_total} SAR

Subtotal: {subtotal} SAR
Delivery Fee: {delivery_fee} SAR
Total: {total} SAR

Notes:
{notes}

Please share live location in WhatsApp if needed.

Arabic message format must also be supported when user language is Arabic.

==================================================
SUPER ADMIN PANEL
==================================================

Route: /admin

Admin can:
- View all users
- View all shops
- View all orders
- View subscription logs
- Search shops
- Filter by status
- Activate 30 days
- Activate 1 year
- Extend 7 days
- Pause shop
- Reactivate shop
- Mark expired

Every subscription action must:
- update shops table
- insert subscription_logs row
- record admin_id
- record old status/new status
- record old expiry/new expiry

Admin dashboard stats:
- total shops
- trial shops
- active shops
- expired shops
- paused shops
- orders count

==================================================
SUBSCRIPTION SYSTEM
==================================================

Shop statuses:
- trial
- active
- expired
- paused

New shop:
- status = trial
- expiry = now() + 30 days

Active shop:
- can receive orders if expiry > now()

Expired shop:
- cannot receive orders
- public page shows inactive
- dashboard shows renewal notice

Paused shop:
- cannot receive orders
- public page shows inactive

Important:
Use database checks and app checks.

Recommended:
Create helper function:
is_shop_available(shop):
- is_active = true
- subscription_status in ('trial', 'active')
- subscription_expires_at > now()

Optional:
Create scheduled/manual function later to mark expired shops.
For V1, queries must treat expired dates as inactive even if status field is not updated.

==================================================
DATABASE SCHEMA
==================================================

Create SQL migration.

Use extensions:
- pgcrypto if needed for gen_random_uuid()

Tables:

profiles:
- id uuid primary key references auth.users(id) on delete cascade
- full_name text
- whatsapp_number text
- city text
- role text not null default 'shop_owner' check role in ('super_admin','shop_owner')
- created_at timestamptz default now()
- updated_at timestamptz default now()

shops:
- id uuid primary key default gen_random_uuid()
- owner_id uuid not null references profiles(id) on delete cascade
- name text not null
- slug text unique not null
- city text
- description text
- whatsapp_number text not null
- logo_url text
- is_active boolean default true
- pickup_enabled boolean default true
- delivery_enabled boolean default false
- pickup_time_slots jsonb default '[]'::jsonb
- delivery_time_slots jsonb default '[]'::jsonb
- delivery_fee numeric(10,2) default 0
- minimum_delivery_order numeric(10,2) default 0
- subscription_status text not null default 'trial' check subscription_status in ('trial','active','expired','paused')
- subscription_started_at timestamptz default now()
- subscription_expires_at timestamptz default now() + interval '30 days'
- created_at timestamptz default now()
- updated_at timestamptz default now()

products:
- id uuid primary key default gen_random_uuid()
- shop_id uuid not null references shops(id) on delete cascade
- name text not null
- description text
- price numeric(10,2) not null check (price >= 0)
- image_url text
- category text
- is_active boolean default true
- sort_order int default 0
- created_at timestamptz default now()
- updated_at timestamptz default now()

orders:
- id uuid primary key default gen_random_uuid()
- shop_id uuid not null references shops(id) on delete cascade
- customer_name text not null
- customer_phone text not null
- fulfillment_type text not null check fulfillment_type in ('pickup','delivery')
- preferred_time text
- delivery_area text
- delivery_landmark text
- delivery_map_link text
- items jsonb not null
- subtotal numeric(10,2) not null default 0
- delivery_fee numeric(10,2) default 0
- total numeric(10,2) not null default 0
- notes text
- created_at timestamptz default now()

subscription_logs:
- id uuid primary key default gen_random_uuid()
- shop_id uuid not null references shops(id) on delete cascade
- action text not null
- old_status text
- new_status text
- old_expiry timestamptz
- new_expiry timestamptz
- admin_id uuid references profiles(id)
- created_at timestamptz default now()

Indexes:
- shops.slug
- shops.owner_id
- products.shop_id
- orders.shop_id
- profiles.role
- shops.subscription_status

Add updated_at trigger function for profiles, shops, products.

==================================================
RLS POLICIES
==================================================

Enable RLS on:
- profiles
- shops
- products
- orders
- subscription_logs

Create helper function:
public.is_super_admin()
returns boolean
checks profiles.role = 'super_admin' for auth.uid()

Important:
Avoid recursion problems in RLS.

Profiles policies:
- authenticated user can read own profile
- authenticated user can update own profile except role
- super_admin can read all profiles
- super_admin can update profiles if needed

Shops policies:
- public can select only available shops:
  is_active = true
  subscription_status in ('trial','active')
  subscription_expires_at > now()
- owner can select own shops
- owner can insert shops with owner_id = auth.uid()
- owner can update/delete own shops
- super_admin can manage all shops

Products policies:
- public can select active products only if parent shop is available
- owner can select/manage products for own shops
- super_admin can manage all products

Orders policies:
- public can insert orders only if parent shop is available
- owner can select orders for own shops
- super_admin can select all orders
- public cannot select orders
- customers cannot update/delete orders
- owner should not delete orders in V1 unless explicitly allowed

Subscription logs:
- super_admin can select/insert
- shop owner can read logs for own shop
- shop owner cannot insert/update/delete logs

==================================================
STORAGE
==================================================

Supabase Storage bucket:
shop-assets

Paths:
- logos/{shop_id}/{filename}
- products/{shop_id}/{filename}

Rules:
- public can read files
- authenticated shop owner can upload only to own shop folder
- authenticated shop owner can update/delete only own shop files
- super_admin can manage all

Important:
- Validate file type: images only
- Validate file size limit
- Use unique filenames
- Never store images locally because Vercel filesystem is not persistent

==================================================
SECURITY REQUIREMENTS
==================================================

Critical:
- Never expose SUPABASE_SERVICE_ROLE_KEY to client.
- Service role key only used in server-side files.
- Use PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY on client.
- Protect /dashboard server-side.
- Protect /admin server-side.
- Admin role must be verified server-side from profiles table.
- Never trust client-submitted owner_id.
- Always use auth.uid() for ownership.
- Validate all form inputs server-side.
- Sanitize slug.
- Prevent duplicate slugs.
- Prevent invalid WhatsApp numbers.
- Prevent negative prices.
- Prevent unauthorized product/shop edits.
- Prevent ordering from inactive/expired shops.
- Do not expose other shops’ orders to shop owners.
- Do not expose customer order data publicly.
- Do not store passwords.
- Do not implement customer accounts.
- Do not implement WhatsApp API.
- Do not implement payment gateway.

Add secure headers if appropriate.
Use safe redirects after auth.

==================================================
VERCEL DEPLOYMENT REQUIREMENTS
==================================================

The app will be deployed on Vercel.

Requirements:
- Use SvelteKit adapter-auto or adapter-vercel if needed.
- Must work in serverless environment.
- No long-running background processes.
- No local filesystem storage.
- Use Supabase Storage for uploads.
- Dynamic routes must work in production.
- No hardcoded localhost URLs.
- Use environment variables.

Environment variables:
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Build commands:
- npm install
- npm run build
- npm run preview

==================================================
UI / UX REQUIREMENTS
==================================================

Must look attractive and professional.

Style:
- Modern SaaS design
- Clean layout
- Premium feel
- Rounded-2xl cards
- Soft shadows
- Smooth transitions
- Beautiful landing page
- Simple dashboard
- Mobile-first
- Excellent Arabic RTL layout

Components:
- Button
- Input
- Textarea
- Select
- Card
- Badge
- Modal
- Toast
- Navbar
- Sidebar
- ProductCard
- CartBar
- EmptyState
- LoadingSkeleton
- QRCode component
- LanguageSwitcher

States:
- loading
- error
- empty
- success
- disabled
- inactive shop

==================================================
QR CODE FEATURE
==================================================

Each shop should have:
- public shop link
- QR code generated from shop link

Shop owner dashboard:
- show QR code
- copy link button
- download QR code if possible

==================================================
CART LOGIC
==================================================

localStorage key:
vazix_cart_{shop_slug}

Rules:
- Cart unique per shop.
- Do not mix carts between shops.
- Quantity cannot be below 1.
- Remove item if quantity = 0.
- Recalculate totals on quantity change.
- Clear cart after successful order.

==================================================
ORDER SAVING LOGIC
==================================================

When customer clicks Order on WhatsApp:

1. Validate shop availability server-side
2. Validate products still active
3. Recalculate subtotal server-side if possible
4. Apply delivery fee if delivery
5. Validate minimum delivery order
6. Insert order
7. Return WhatsApp URL
8. Client opens WhatsApp

Do not rely only on client-calculated total.

==================================================
OUTPUT REQUIREMENTS
==================================================

Generate the project step-by-step with real code.

Start with:

1. Full folder structure
2. Supabase SQL schema
3. RLS policies
4. Storage policies
5. Environment setup
6. Supabase client setup
7. i18n setup English/Arabic
8. Auth magic link flow
9. Protected route logic
10. Landing page
11. Onboarding page
12. Dashboard layout
13. Shop CRUD
14. Product CRUD
15. Public shop page
16. Cart and checkout
17. WhatsApp order generator
18. Order saving server logic
19. Admin panel
20. Subscription action logic
21. QR code logic
22. Vercel deployment instructions
23. Final testing checklist

Code quality:
- clean
- modular
- typed
- commented where needed
- production-ready
- no placeholder-only logic
- no skipped security logic

Before finalizing, double-check:
- RLS policies
- role access
- subscription expiry
- inactive shop blocking
- bilingual translation coverage
- Vercel compatibility
- service role key safety
- customer no-account flow
- WhatsApp link encoding
- pickup/delivery logic

Build the MVP fully.