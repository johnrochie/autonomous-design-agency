-- Check how profiles and clients relate
-- Run this in Supabase SQL Editor

-- Sample profiles data
SELECT id, email, role FROM public.profiles LIMIT 3;

-- Sample clients data  
SELECT id, email, company_name FROM public.clients LIMIT 3;

-- Check if profiles.email = clients.email
SELECT 
  COUNT(*) as total_clients,
  COUNT(DISTINCT c.email) as unique_client_emails,
  COUNT(DISTINCT p.email) as unique_profile_emails
FROM public.clients c
LEFT JOIN public.profiles p ON c.email = p.email;
