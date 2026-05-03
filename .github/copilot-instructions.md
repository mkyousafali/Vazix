# Vazix — AI Agent Instructions

## What Is This Project?

**Vazix** is a SaaS platform for small shops to create public ordering pages and receive orders via WhatsApp. It is a full-stack web app built with SvelteKit, Supabase, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit (latest, Svelte 5 runes) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| Storage | Supabase Storage (`shop-assets` bucket) |
| i18n | Custom store — English + Arabic (RTL) |
| Deployment | Vercel (`@sveltejs/adapter-vercel`) |
| PWA | SvelteKit built-in service worker (`src/service-worker.ts`) |

---

## Project Structure

```
src/
├── app.html                  # HTML shell — favicon, fonts, manifest link, theme-color
├── app.css                   # Global styles — @import tailwindcss, font rules
├── app.d.ts                  # TypeScript types for locals (supabase, session, profile)
├── service-worker.ts         # PWA service worker — cache-first for assets, network-first for pages
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts         # Server clients: createServerSupabaseClient (anon/RLS) + createAdminSupabaseClient (service role)
│   │   └── database.types.ts # Full TypeScript types for all DB tables
│   │
│   ├── i18n/
│   │   ├── index.ts          # Svelte stores: lang, t(), isRTL, setLang(), initLang()
│   │   ├── en.json           # English translations
│   │   └── ar.json           # Arabic translations
│   │
│   └── components/
│       └── QRCodeCard.svelte # QR code display + copy link + download button
│
└── routes/
    ├── +layout.server.ts     # Root layout — returns session + profile from locals
    ├── +layout.svelte        # Root layout — imports app.css, calls initLang()
    ├── +page.svelte          # Landing page — hero, features, pricing, FAQ, footer
    │
    ├── login/
    │   ├── +page.server.ts   # Redirect to /dashboard if already logged in
    │   └── +page.svelte      # Magic link form — signInWithOtp
    │
    ├── auth/
    │   ├── callback/+server.ts  # Exchange code → session, redirect to /onboarding or /dashboard
    │   └── logout/+server.ts   # POST → signOut → redirect to /login
    │
    ├── onboarding/
    │   ├── +page.server.ts   # Load profile; action: save full_name, whatsapp_number, city
    │   └── +page.svelte      # 3-field form with enhance
    │
    ├── dashboard/
    │   ├── +layout.server.ts # Auth guard — requires session + complete profile
    │   ├── +layout.svelte    # Sidebar (desktop) + drawer (mobile) + lang toggle + logout
    │   ├── +page.server.ts   # Load stats: shops, products count, recent orders
    │   ├── +page.svelte      # Overview stats grid + shop list + recent orders
    │   │
    │   └── shops/
    │       ├── +page.server.ts        # Load all shops for current user
    │       ├── +page.svelte           # Shop cards with status badge + manage links
    │       ├── new/
    │       │   ├── +page.server.ts    # Action: validate + insert shop + upload logo → redirect
    │       │   └── +page.svelte       # Create shop form + logo upload + slug auto-gen
    │       └── [id]/
    │           ├── +layout.server.ts  # Ownership check — 404 if not owner
    │           ├── +layout.svelte     # Passthrough layout
    │           ├── +page.server.ts    # Redirect /dashboard/shops/[id] → /edit
    │           ├── edit/
    │           │   ├── +page.server.ts  # Load shop; action: update all fields + logo
    │           │   └── +page.svelte     # Pre-filled edit form + quick nav links + QR code
    │           ├── products/
    │           │   ├── +page.server.ts  # Actions: create, update, delete (with image upload)
    │           │   └── +page.svelte     # Inline create/edit forms + product cards
    │           ├── orders/
    │           │   ├── +page.server.ts  # Load all orders for shop
    │           │   └── +page.svelte     # Expandable order cards
    │           └── subscription/
    │               ├── +page.server.ts  # Load subscription fields + logs
    │               └── +page.svelte     # Status badge, expiry, renewal info, log table
    │
    ├── shop/[slug]/
    │   ├── +page.server.ts   # Load shop (RLS filters inactive) + active products
    │   ├── +page.svelte      # Public shop page — category filter, product grid, sticky cart bar
    │   └── cart/
    │       ├── +page.server.ts  # Load shop for cart page
    │       ├── +page.svelte     # Cart items, customer form, fulfillment, totals, WhatsApp submit
    │       └── +server.ts       # POST — validate order server-side, insert to DB, return wa.me URL
    │
    └── admin/                # Protected: profile.role === 'super_admin'
        ├── +layout.server.ts # Auth guard + stats loader
        ├── +layout.svelte    # Admin sidebar
        ├── +page.server.ts   # Stats data
        ├── +page.svelte      # Stats dashboard
        ├── shops/
        │   ├── +page.server.ts  # All shops + updateSubscription action (activate/extend/pause/expire)
        │   └── +page.svelte     # Shop table + subscription action buttons
        ├── users/
        │   ├── +page.server.ts  # All profiles
        │   └── +page.svelte     # Users table
        ├── orders/
        │   ├── +page.server.ts  # All orders
        │   └── +page.svelte     # Orders table
        └── subscription-logs/
            ├── +page.server.ts  # All subscription_logs
            └── +page.svelte     # Logs table with status change display
```

---

## Database Schema

Tables (all in `public` schema):

| Table | Key Columns |
|---|---|
| `profiles` | `id` (FK auth.users), `full_name`, `whatsapp_number`, `city`, `role`, `is_complete` |
| `shops` | `id`, `owner_id` (FK profiles), `name`, `slug` (unique), `whatsapp_number`, `subscription_status`, `subscription_expires_at`, `is_active`, `pickup_enabled`, `delivery_enabled`, `delivery_fee`, `minimum_delivery_order`, `logo_url` |
| `products` | `id`, `shop_id`, `name`, `description`, `price`, `image_url`, `category`, `sort_order`, `is_active` |
| `orders` | `id`, `shop_id`, `customer_name`, `customer_phone`, `fulfillment_type`, `items` (jsonb), `subtotal`, `delivery_fee`, `total`, `delivery_area`, `delivery_landmark`, `delivery_map_link`, `preferred_time`, `notes` |
| `subscription_logs` | `id`, `shop_id`, `changed_by`, `action`, `old_status`, `new_status`, `old_expires_at`, `new_expires_at`, `notes` |

RLS is enabled on all tables. Public can read active shops/products. Only owners can manage their own shops/products/orders. Admins use the service role client to bypass RLS.

---

## How to Create a Database Migration

When the schema needs to change:

1. **Create a new SQL file** in `supabase/migrations/` named with a timestamp:
   ```
   supabase/migrations/20260503_add_column_example.sql
   ```

2. **Write additive SQL** — never drop or rename existing columns in migrations without a plan:
   ```sql
   alter table public.shops add column if not exists instagram_handle text;
   ```

3. **Run it against Supabase** using the one-time script pattern:
   ```js
   // scripts/migrate-YYYYMMDD.mjs
   import pg from 'pg';
   import { readFileSync } from 'fs';
   const client = new pg.Client({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   await client.connect();
   await client.query(readFileSync('supabase/migrations/your-file.sql', 'utf-8'));
   await client.end();
   console.log('Done');
   ```
   Run with: `DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" node scripts/migrate-YYYYMMDD.mjs`

4. **Update `src/lib/supabase/database.types.ts`** to reflect the new columns.

5. **Add the migration script to `.gitignore`** if it contains credentials.

---

## Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Browser + Server | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Secret service role key — bypasses RLS. NEVER expose to browser. |

All three must be set in `.env` locally and in Vercel environment variables for production.

---

## Key Patterns

### Svelte 5 Runes
Always use runes syntax — never Svelte 4 syntax:
```svelte
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => { console.log(count); });
let { data } = $props();
```

### Server-side Auth
```ts
// In any +page.server.ts or +server.ts:
const userId = locals.session!.user.id;
const { data } = await locals.supabase.from('shops').select('*').eq('owner_id', userId);
```

### Admin Operations (bypass RLS)
```ts
import { createAdminSupabaseClient } from '$lib/supabase/server';
const admin = createAdminSupabaseClient();
await admin.from('shops').update({ subscription_status: 'active' }).eq('id', shopId);
```

### i18n
```svelte
<script>
  import { t, lang, setLang, isRTL } from '$lib/i18n';
</script>
<p>{$t('common.save')}</p>
<button onclick={() => setLang($lang === 'ar' ? 'en' : 'ar')}>Toggle</button>
```

### File Upload to Supabase Storage
```ts
const file = formData.get('logo') as File;
const ext = file.name.split('.').pop();
const path = `logos/${shopId}/${Date.now()}.${ext}`;
await locals.supabase.storage.from('shop-assets').upload(path, file);
const { data: { publicUrl } } = locals.supabase.storage.from('shop-assets').getPublicUrl(path);
```

---

## Security Rules

- Service role key is **server-only** — never import from `$env/static/public`
- All ownership checks are done via SQL (`.eq('owner_id', userId)`) — never trust client-submitted owner_id
- Admin panel checks `profile.role === 'super_admin'` server-side in layout
- Cart order totals are **recalculated server-side** from DB prices, never trusted from client
- `.env` and setup scripts are in `.gitignore` — never commit secrets

---

## Storage

Bucket: `shop-assets` (public read)
- Shop logos: `logos/{shop_id}/{timestamp}.{ext}`
- Product images: `products/{shop_id}/{product_id}.{ext}`

---

## Deployment (Vercel)

1. Push code to GitHub (secrets are gitignored)
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — adapter-vercel handles everything automatically
