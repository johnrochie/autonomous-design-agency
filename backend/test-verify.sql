-- Final verification - Check what succeeded
\dt
SELECT '=== Tables Created ===' as section;
SELECT '*' as separator;

SELECT '=== Seed Data ===' as section;
SELECT 'Agents:', COUNT(*)::text FROM public.agents;
SELECT 'Cron Jobs:', COUNT(*)::text FROM public.cron_jobs;
SELECT 'Brand Guidelines:', COUNT(*)::text FROM public.brand_guidelines;
SELECT 'Content Topics:', COUNT(*)::text FROM public.content_topics;
SELECT 'Trending Topics:', COUNT(*)::text FROM public.trending_topics;

SELECT '=== RLS Policies ===' as section;
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '=== Triggers ===' as section;
SELECT trigger_schema, event_object_table, trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
