-- Check clients table columns directly
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clients' 
ORDER BY ordinal_position;

-- Check what we're actually looking for
SELECT 'Does clients.user_id exist?',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = 'user_id'
  )
UNION ALL
SELECT 'Does clients.email exist?',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = 'email'
  );

-- Show sample data to understand the relationship
SELECT * FROM public.clients LIMIT 1;
