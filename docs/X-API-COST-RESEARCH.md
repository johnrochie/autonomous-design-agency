# X (Twitter) API Costings Research

**Status:** Pricing requires developer console access to view details

---

## Summary from X Documentation

From `https://docs.x.com/overview`:

> **Pricing**
> The X API uses pay-per-usage pricing. No monthly subscriptions — pay only for what you use.

---

## Known Cost Structure

Based on X's current documentation and common API knowledge:

### Basic / Free Tier
- **Limited access** (if available)
- Small number of API calls per month
- May have rate limits
- Not for production autonomous posting

### Pay-Per-Usage (Likely what you need)
- **Purchased credits system**
- 1 credit = 1 API call (or similar)
- Credits purchased in packages
- Auto-renewal options
- Different API endpoints cost different credits

---

## Pricing Categories (Typical)

X API usually charges per operation:
- **Posting a tweet:** ~XXX credits/call
- **Reading tweets:** ~XXX credits/call
- **Searching:** ~XXX credits/call
- **User lookup:** ~XXX credits/call

*Note: Exact amounts require logging into your Developer Console to view.*

---

## What You Should Do

Since you're already logged into the Developer Console:

### Step 1: View Pricing in Console
Go to the section where you saw:
- Apps
- Usage
- Webhooks
- Connections

You should see:
- **"Usage"** - Shows current usage and remaining
- **"Purchase Credits"** - Shows pricing tiers/packages

### Step 2: Check "Usage" Tab
Click the **"Usage"** tab/link. This should show:
- Your current API usage
- Rate limits
- Tier information

### Step 3: Look for "Purchase Credits" or "Pricing"
There should be a section showing:
- Credit packages (e.g., $X for Y credits)
- Current balance
- Auto-renewal options

---

## Estimated Costs for Autonomous Agent

**Assuming typical X API pricing:**

**Daily posting (1 tweet):**
- 1 tweet per day × 30 days = 30 tweets
- At ~0.1-0.5 credits per tweet (estimate)
- Estimated: $5-15/month

**Heavier usage (5 tweets/day):**
- 5 tweets per day × 30 days = 150 tweets
- Estimated: $20-50/month

**Note:** Exact pricing requires checking your Developer Console as X's pricing is custom to each developer.

---

## Recommendation

1. **Check Your Console:**
   - Click **"Usage"** → See current tier and limits
   - Look for **"Pricing"** or **"Purchase Credits"**

2. **Start Small:**
   - The free/basic tier (if available) might cover light posting
   - Monitor usage for the first week
   - Upgrade only if needed

3. **Alternative: Skip Twitter for Now**
   - Start with SendGrid (emails)
   - Implement Facebook (may have free tier)
   - Come back to X if/when costs make sense

---

**Next Step:** Check your "Usage" or "Purchase Credits" section in the Developer Console and tell me what pricing you see!

---

*Updated: 2026-02-13*
