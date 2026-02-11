# Admin Promotion for John

Run this in Supabase SQL Editor to promote your account to admin:

```sql
-- Promote John Roche to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'johnrochie86@gmail.com';

-- Verify it worked
SELECT id, email, full_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
```

After running this:
- Log out of your current session
- Log back in
- You'll have admin access to `/admin/dashboard` and `/admin/projects`

---

Important: You must run this in Supabase SQL Editor to get admin privileges.
