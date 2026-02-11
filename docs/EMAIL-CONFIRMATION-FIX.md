# Development Setup - Disable Email Confirmation

## For Testing Without Email Verification:

In Supabase Dashboard, go to:

1. **Authentication** → **Providers** → **Email**
2. Toggle **OFF** "Confirm email"
3. Click **Save**

This will allow users to sign up and log in immediately without email verification.

## For Production:

When you go to production, you should either:
- Re-enable email confirmation and configure SMTP settings
- Use Supabase's email service (it's free for dev, paid for production)
- Or use a third-party email service like SendGrid, Mailgun, etc.

## Quick Test:

After disabling email confirmation:
1. Sign up a new account
2. Log in immediately
3. Should see dashboard

## To Manually Confirm an Existing Account:

If you already created an account:

In Supabase SQL Editor, run:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

Then try logging in again.
