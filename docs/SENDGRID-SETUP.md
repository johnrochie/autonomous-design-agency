# SendGrid Email Setup Guide

## Overview

This guide shows how to set up SendGrid for sending transactional emails for the Autonomous Design Agency.

## Prerequisites

- Sign up for a SendGrid account: https://sendgrid.com/
- Verify your email address

## Setup Steps

### 1. Get Your SendGrid API Key

1. Log in to SendGrid Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: "Autonomous Design Agency Production"
5. **Permissions:** Select these options:
   - **Mail Send** - ✅ Full Access
   - **Templates** - ✅ Read Access
6. Click **Create & View**
7. **Copy the API Key** - you'll only see it once!
8. Save it securely (password manager, environment variable)

![API Key Location](https://i.imgur.com/example.png)

### 2. Set Up Sender Authentication (Domain Verification)

**Option A: Single Sender (Quick Start) - Recommended for MVP**

1. Go to **Settings** → **Sender Authentication**
2. Click **Create Sender Identity**
3. Fill in:
   - **From Email:** Use your actual email (e.g., john@yourdomain.com or @gmail.com)
   - **From Name:** Autonomous Design Agency
   - **Reply To:** Same as from email
   - **Address:** Your company address
4. Click **Create**
5. **Check your inbox** - Verify the email link from SendGrid

**Option B: Domain Authentication (Professional)** - Recommended for Production

1. Go to **Start the Domain Authentication Wizard**
2. Enter domain: `autonomousdesignagency.ie` (or your domain)
3. Select **Dedicated IP** (recommended for production) or **Shared IP** (free)
4. Follow the DNS setup wizard (5 DNS records to add)
5. Wait 24-48 hours for DNS propagation
6. Verify all 3 steps are ✓ (authenticated, DKIM verified, SPF verified)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xx
FROM_EMAIL=info@autonomousdesignagency.ie
FROM_NAME=Autonomous Design Agency
```

For production, add these to Vercel Environment Variables:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add the same 3 variables
3. **Select all environments:** Production, Preview, Development
4. Save and redeploy

### 4. Test Email Sending

Create a simple test script:

```typescript
// test-email.ts
import { sendEmail } from '@/lib/email';

async function testEmail() {
  const success = await sendEmail({
    to: 'your-email@example.com',
    subject: 'Test Email',
    html: '<h1>It works!</h1>',
    text: 'It works!',
  });

  console.log('Email sent:', success);
}

testEmail();
```

### 5. Add Email Notifications to Client Flows

Emails are automatically sent on these events:

#### When Client Signs Up
```typescript
await sendWelcomeEmail(fullName, email);
```

#### When Quote is Generated/Approved
```typescript
await sendQuoteNotificationEmail(
  clientName,
  clientEmail,
  projectName,
  quoteAmountCents
);
```

#### When Project Status Changes
```typescript
await sendProjectUpdateEmail(
  clientName,
  clientEmail,
  projectName,
  newStatus
);
```

#### When Milestone is Completed
```typescript
await sendMilestoneCompletedEmail(
  clientName,
  clientEmail,
  projectName,
  milestoneName,
  progressPercentage
);
```

## Email Templates

All email templates are in `lib/email.ts`:

- **Welcome Email** - Sent when new user signs up
- **Quote Notification** - Quote ready for client review
- **Project Update** - Status change (confirmed, design, development, etc.)
- **Milestone Completed** - Milestone finished with progress %

Customize templates by modifying the HTML in `lib/email.ts`.

## SendGrid Dashboard Monitoring

Monitor your email activity:

1. Go to **Activity** → **Email Activity**
2. Filter by:
   - Time range (today, last 7 days, etc.)
   - Status (delivered, opened, clicked, etc.)
   - Subject line

3. **Key metrics to track:**
   - Delivery rate (target: >98%)
   - Open rate (target: >40%)
   - Click rate (target: >5%)
   - Spam complaints (target: <0.1%)

### Email Activity Feed

Shows:
- Sent emails with timestamps
- Delivery status (delivered, bounced, deferred)
- Client engagement (opened, clicked)
- Error messages (if delivery failed)

### Troubleshooting

**Email not delivered?**
- Check recipient email is valid
- Verify sender authentication
- Check if email bounced in SendGrid Activity

**Email goes to spam?**
- Verify SPF/DKIM records for domain
- Check email content (avoid spammy keywords)
- Add sender to client contacts list first

**Rate limits exceeded?**
- SendGrid Free tier: 100 emails/day
- Upgrade plan if needed

## Pricing (SendGrid)

- **Free Plan:** 100 emails/day, 2,000/month
  - Good for: MVP testing, 10-20 clients
- **Basic Plan:** $15/month - 50,000 emails/month
  - Good for: 50-100 clients
- **Pro Plan:** $89/month - 100,000 emails/month + dedicated IP
  - Good for: 200+ clients, professional use

## Production Checklist

Before sending to production:

- [ ] Sender authentication configured (domain preferred)
- [ ] API key stored in Vercel environment variables
- [ ] Test all 4 email templates with real data
- [ ] Verify delivery status in SendGrid Dashboard
- [ ] Set up email monitoring (daily/weekly reports)
- [ ] Add email bounce/complaint handling (optional, advanced)
- [ ] Consider SPF/DKIM verification for custom domain

## Next Steps

1. Create SendGrid account and get API key
2. Set up sender authentication (single sender or domain)
3. Add environment variables to Vercel
4. Test email sending
5. Monitor email activity in SendGrid Dashboard

## Support

- SendGrid Documentation: https://docs.sendgrid.com/
- API Documentation: https://docs.sendgrid.com/api-reference/
- Support: https://support.sendgrid.com/

---

*Last updated: 2026-02-12*
