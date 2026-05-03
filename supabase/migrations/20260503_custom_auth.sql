-- Custom auth system migration
-- Add status to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended'));

-- Add role 'admin' (sub-admin) alongside existing 'super_admin' and 'shop_owner'
-- Update the role column to allow 'admin' value
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin', 'admin', 'shop_owner'));

-- Add password reset request flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_reset_requested boolean NOT NULL DEFAULT false;

-- Activate existing users who have complete profiles
UPDATE public.profiles
SET status = 'active'
WHERE full_name IS NOT NULL
  AND whatsapp_number IS NOT NULL
  AND city IS NOT NULL;

-- Always keep super_admin active
UPDATE public.profiles
SET status = 'active'
WHERE role IN ('super_admin', 'admin');

-- Auto-start trial when shop is created (update default subscription_expires_at)
-- New shops will get 30-day trial set by the app insert logic
