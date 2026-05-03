-- Add is_complete column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false;

-- Mark profiles with all required fields as complete
UPDATE public.profiles
SET is_complete = true
WHERE full_name IS NOT NULL
  AND whatsapp_number IS NOT NULL
  AND city IS NOT NULL;
