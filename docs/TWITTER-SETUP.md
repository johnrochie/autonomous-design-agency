# X (Twitter) Developer Setup Guide

**Status:** In Developer Console ✅
**Next Step:** Create an App

---

## What You're Seeing

Developer Console side menu:
- ✅ Apps
- ✅ Usage
- ✅ Webhooks
- ✅ Connections

---

## Step 1: Click "Apps"

In the left sidebar, click **"Apps"** or **"Projects & Apps"**

You should see:
- A list of your existing apps (probably empty)
- A button like **"Create App"** or **"+ Create App"** or **"Add App"**

---

## Step 2: Create Your App

Click the **"Create App"** button.

**Fill in the form:**

**Basic Information:**
- **App Name:** `autonomous-design-agency`
- **Description:** `AI-powered autonomous design agency that posts industry trends and showcases client projects`
- **Website:** `https://autonomous-design-agency.vercel.app`
- **Callback URL:** `https://autonomous-design-agency.vercel.app/api/auth/callback`
- **Website URL:** `https://autonomous-design-agency.vercel.app`

**Permissions/Scopes:**
- Make sure you have **Write permissions** (to post tweets)
- Look for: "Tweet", "Post", or "Write" permissions

**Click:** Create or Save

---

## Step 3: Get Your API Keys

After creating the app, you'll be taken to a page with your credentials.

**Look for these 4 keys:**

1. **API Key** (might be called "Consumer Key" or "API Key ID")
2. **API Secret** (might be called "Consumer Secret" or "API Key Secret")
3. **Access Token** (for posting from your account)
4. **Access Token Secret** (for posting from your account)

**Note:** You might need to click "Generate Access Token" if it doesn't exist yet.

---

## Step 4: Paste Keys Back

Once you have all 4 keys, paste them back to me like this:

```
API Key: xxxx
API Secret: xxxx
Access Token: xxxx
Access Token Secret: xxxx
```

**I'll help you add them to Vercel.**

---

## What If You Get Stuck

**If you don't see:**
- ✅ Click **"Create App"**
- ✅ Fill in the form
- ✅ Look for "Keys & Tokens" or "Credentials" tab

**If access tokens aren't there:**
- Look for **"Generate Access Token"** button
- This creates tokens for YOUR account to post tweets

---

**Go ahead and click "Apps" → "Create App" now!**
