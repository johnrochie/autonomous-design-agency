-- Check current project status and quote status
-- Run this in Supabase SQL Editor

SELECT
  id,
  name,
  status,
  quote_status,
  quote_amount_cents,
  created_at,
  updated_at
FROM public.projects
WHERE status IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
