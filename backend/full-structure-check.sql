-- Show the ACTUAL full database structure
-- Run this in Supabase SQL Editor

SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  (
    SELECT COUNT(1) FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
  ) as is_foreign_key
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('clients', 'profiles', 'projects', 'milestones')
ORDER BY t.table_name, c.ordinal_position;
