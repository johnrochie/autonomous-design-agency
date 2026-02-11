# Vercel Deployment Guide

## Option 1: Connect GitHub Repository (Recommended)

This is the easiest method - Vercel will auto-deploy when you push changes.

### Steps:

1. **Visit Vercel Dashboard**
   - Go to: https://vercel.com/new
   - Log in with your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select: `johnrochie/autonomous-design-agency`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for development)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Tip:** You'll get Supabase credentials after creating a Supabase project (see SUPABASE-SETUP.md).

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build
   - Visit the generated URL (e.g., https://autonomous-design-agency.vercel.app)

6. **Set Custom Domain (Optional)**
   - In Vercel project settings → Domains
   - Add: `autonomousdesignagency.com` (or your preferred domain)
   - Follow DNS configuration instructions

---

## Option 2: Deploy via Vercel CLI

If you prefer command-line deployment:

### Login to Vercel:
```bash
vercel login
```
Follow the prompts (GitHub login, 2FA if enabled).

### Deploy:
```bash
cd /home/jr/.openclaw/workspace/autonomous-design-agency
vercel
```

Follow the interactive prompts:
- Link to existing project? `y`
- Which scope? Select your account
- Link to `autonomous-design-agency`
- Enter environment variables when prompted
- Deploy to production: `vercel --prod`

### Set Environment Variables (CLI):
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add STRIPE_SECRET_KEY production
# ... etc for all variables
```

---

## Troubleshooting

**Build Fails:**
- Check environment variables are set correctly
- Ensure `package-lock.json` is committed to Git
- Run `npm install && npm run build` locally first

**Stripe API Error:**
- Verify API keys are correct
- Ensure `STRIPE_SECRET_KEY` matches `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` mode (both live or both test)

**Supabase Connection Error:**
- Check `NEXT_PUBLIC_SUPABASE_URL` format (should be `https://...`, not `postgresql://...`)
- Verify anon key is valid from Supabase dashboard

---

## Production Checklist

Before going live:

- [ ] All environment variables set (use live keys, not test)
- [ ] Custom domain configured (if desired)
- [ ] SSL certificate active (automatic on Vercel)
- [ ] Supabase project created and configured
- [ ] Stripe account connected for payments
- [ ] Test full client flow (signup → intake → quote)
- [ ] Set up error monitoring (Vercel Analytics, Sentry)
- [ ] Configured GitHub branch protections for production

---

*Last Updated: 2026-02-11*
