-- ============================================================
-- VAZIX DATABASE SCHEMA
-- Run this in Supabase SQL editor
-- ============================================================

-- Enable pgcrypto if needed
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  whatsapp_number text,
  city         text,
  role         text not null default 'shop_owner'
                 check (role in ('super_admin', 'shop_owner')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TABLE: shops
-- ============================================================
create table if not exists public.shops (
  id                       uuid primary key default gen_random_uuid(),
  owner_id                 uuid not null references public.profiles(id) on delete cascade,
  name                     text not null,
  slug                     text unique not null,
  city                     text,
  description              text,
  whatsapp_number          text not null,
  logo_url                 text,
  is_active                boolean default true,
  pickup_enabled           boolean default true,
  delivery_enabled         boolean default false,
  pickup_time_slots        jsonb default '[]'::jsonb,
  delivery_time_slots      jsonb default '[]'::jsonb,
  delivery_fee             numeric(10,2) default 0,
  minimum_delivery_order   numeric(10,2) default 0,
  subscription_status      text not null default 'trial'
                             check (subscription_status in ('trial','active','expired','paused')),
  subscription_started_at  timestamptz default now(),
  subscription_expires_at  timestamptz default (now() + interval '30 days'),
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create trigger shops_updated_at
  before update on public.shops
  for each row execute function public.handle_updated_at();

create index if not exists idx_shops_slug       on public.shops(slug);
create index if not exists idx_shops_owner_id   on public.shops(owner_id);
create index if not exists idx_shops_sub_status on public.shops(subscription_status);

-- ============================================================
-- TABLE: products
-- ============================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  image_url   text,
  category    text,
  is_active   boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create index if not exists idx_products_shop_id on public.products(shop_id);

-- ============================================================
-- TABLE: orders
-- ============================================================
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid not null references public.shops(id) on delete cascade,
  customer_name       text not null,
  customer_phone      text not null,
  fulfillment_type    text not null check (fulfillment_type in ('pickup','delivery')),
  preferred_time      text,
  delivery_area       text,
  delivery_landmark   text,
  delivery_map_link   text,
  items               jsonb not null,
  subtotal            numeric(10,2) not null default 0,
  delivery_fee        numeric(10,2) default 0,
  total               numeric(10,2) not null default 0,
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists idx_orders_shop_id on public.orders(shop_id);

-- ============================================================
-- TABLE: subscription_logs
-- ============================================================
create table if not exists public.subscription_logs (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  action      text not null,
  old_status  text,
  new_status  text,
  old_expiry  timestamptz,
  new_expiry  timestamptz,
  admin_id    uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- ============================================================
-- HELPER FUNCTION: is_super_admin
-- ============================================================
create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ============================================================
-- HELPER FUNCTION: is_shop_available
-- ============================================================
create or replace function public.is_shop_available(shop_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.shops
    where id = shop_id
      and is_active = true
      and subscription_status in ('trial', 'active')
      and subscription_expires_at > now()
  );
$$;

-- ============================================================
-- RLS: Enable Row Level Security
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.shops            enable row level security;
alter table public.products         enable row level security;
alter table public.orders           enable row level security;
alter table public.subscription_logs enable row level security;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================
drop policy if exists "profiles: own read"         on public.profiles;
drop policy if exists "profiles: own update"       on public.profiles;
drop policy if exists "profiles: admin read all"   on public.profiles;
drop policy if exists "profiles: admin update all" on public.profiles;

create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- prevent role escalation
    and (role = (select role from public.profiles where id = auth.uid()))
  );

create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_super_admin());

create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_super_admin());

-- ============================================================
-- RLS POLICIES: shops
-- ============================================================
drop policy if exists "shops: public select available"  on public.shops;
drop policy if exists "shops: owner select own"         on public.shops;
drop policy if exists "shops: owner insert"             on public.shops;
drop policy if exists "shops: owner update own"         on public.shops;
drop policy if exists "shops: owner delete own"         on public.shops;
drop policy if exists "shops: admin all"                on public.shops;

create policy "shops: public select available"
  on public.shops for select
  using (
    is_active = true
    and subscription_status in ('trial', 'active')
    and subscription_expires_at > now()
  );

create policy "shops: owner select own"
  on public.shops for select
  using (owner_id = auth.uid());

create policy "shops: owner insert"
  on public.shops for insert
  with check (owner_id = auth.uid());

create policy "shops: owner update own"
  on public.shops for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "shops: owner delete own"
  on public.shops for delete
  using (owner_id = auth.uid());

create policy "shops: admin all"
  on public.shops for all
  using (public.is_super_admin());

-- ============================================================
-- RLS POLICIES: products
-- ============================================================
drop policy if exists "products: public select active"   on public.products;
drop policy if exists "products: owner select own shop"  on public.products;
drop policy if exists "products: owner insert"           on public.products;
drop policy if exists "products: owner update"           on public.products;
drop policy if exists "products: owner delete"           on public.products;
drop policy if exists "products: admin all"              on public.products;

create policy "products: public select active"
  on public.products for select
  using (
    is_active = true
    and public.is_shop_available(shop_id)
  );

create policy "products: owner select own shop"
  on public.products for select
  using (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  );

create policy "products: owner insert"
  on public.products for insert
  with check (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  );

create policy "products: owner update"
  on public.products for update
  using (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  );

create policy "products: owner delete"
  on public.products for delete
  using (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  );

create policy "products: admin all"
  on public.products for all
  using (public.is_super_admin());

-- ============================================================
-- RLS POLICIES: orders
-- ============================================================
drop policy if exists "orders: public insert available shop"  on public.orders;
drop policy if exists "orders: owner select own shop"         on public.orders;
drop policy if exists "orders: admin all"                     on public.orders;

create policy "orders: public insert available shop"
  on public.orders for insert
  with check (public.is_shop_available(shop_id));

create policy "orders: owner select own shop"
  on public.orders for select
  using (
    exists (
      select 1 from public.shops
      where shops.id = orders.shop_id and shops.owner_id = auth.uid()
    )
  );

create policy "orders: admin all"
  on public.orders for all
  using (public.is_super_admin());

-- ============================================================
-- RLS POLICIES: subscription_logs
-- ============================================================
drop policy if exists "sublogs: admin all"            on public.subscription_logs;
drop policy if exists "sublogs: owner read own shop"  on public.subscription_logs;

create policy "sublogs: admin all"
  on public.subscription_logs for all
  using (public.is_super_admin());

create policy "sublogs: owner read own shop"
  on public.subscription_logs for select
  using (
    exists (
      select 1 from public.shops
      where shops.id = subscription_logs.shop_id and shops.owner_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE POLICIES
-- Run these after creating the 'shop-assets' bucket in Supabase Storage
-- Set bucket to PUBLIC
-- ============================================================

-- Allow public read (bucket is public)
-- Allow authenticated users to upload to their own shop folders
-- Policy names are created in Supabase dashboard or via:

/*
insert into storage.policies (bucket_id, name, definition, operation)
values
  ('shop-assets', 'public read', 'true', 'SELECT'),
  ('shop-assets', 'owner upload logos',
   '(auth.uid()::text = (storage.foldername(name))[2])', 'INSERT'),
  ('shop-assets', 'owner update logos',
   '(auth.uid()::text = (storage.foldername(name))[2])', 'UPDATE'),
  ('shop-assets', 'owner delete logos',
   '(auth.uid()::text = (storage.foldername(name))[2])', 'DELETE');
*/
