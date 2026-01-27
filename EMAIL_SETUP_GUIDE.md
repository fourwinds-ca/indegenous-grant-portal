# Email Edge Function Setup Guide

## Overview

The `send-reminders` Edge Function sends automated email notifications to subscribers about:
1. **Upcoming deadlines** - Grants expiring in the next 7 days
2. **New grant opportunities** - Grants added in the last week

## Prerequisites

1. **Resend Account** - https://resend.com
2. **Verified domain** - support@fourwinds.ca (or your chosen email)
3. **Supabase project** - Already set up

---

## Step 1: Set Up Resend

### Create Resend Account
1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### Add & Verify Domain
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter `fourwinds.ca`
4. Add the DNS records to your domain provider:
   - **TXT record** for SPF
   - **CNAME records** for DKIM
   - **MX record** (if using Resend for receiving)
5. Wait for verification (usually 15-30 minutes)

### Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name: `Grant Portal Production`
4. Copy the key (starts with `re_...`)

---

## Step 2: Configure Supabase Environment Variables

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_xxxxx...` | Your Resend API key |
| `APP_BASE_URL` | `https://yourdomain.com` | Your app's public URL |

### Option B: Via Supabase CLI (Local Development)

Create `supabase/.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_BASE_URL=http://localhost:3000
```

---

## Step 3: Deploy the Edge Function

### Deploy to Supabase

```bash
# From project root
npx supabase functions deploy send-reminders
```

### Verify Deployment

```bash
npx supabase functions list
```

You should see `send-reminders` in the list.

---

## Step 4: Test the Function

### Test Deadline Reminders

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "deadline_reminders",
    "daysAhead": 7,
    "testEmail": "your-email@example.com"
  }'
```

### Test New Grant Alerts

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "new_grants",
    "testEmail": "your-email@example.com"
  }'
```

---

## Step 5: Set Up Automated Cron Jobs

### Using Supabase pg_cron Extension

1. Go to **Database** → **Extensions**
2. Enable `pg_cron`
3. Run this SQL to schedule emails:

```sql
-- Send deadline reminders every Monday at 9 AM
SELECT cron.schedule(
  'weekly-deadline-reminders',
  '0 9 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'deadline_reminders',
        'daysAhead', 7
      )
    );
  $$
);

-- Send new grant alerts every Wednesday at 10 AM
SELECT cron.schedule(
  'weekly-new-grants',
  '0 10 * * 3',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'new_grants'
      )
    );
  $$
);
```

---

## How It Works

### Email Flow

1. **Edge Function triggered** (manually or via cron)
2. **Queries database** for relevant grants
3. **Gets active subscribers** from `email_subscriptions` table
4. **Filters grants** based on subscriber preferences:
   - Categories (Environment, Economic Development, etc.)
   - Provinces (Federal, Ontario, Alberta, etc.)
5. **Generates HTML email** with beautiful template
6. **Sends via Resend API**
7. **Logs email** in `email_send_log` table
8. **Updates subscriber** `last_email_sent` timestamp

### Database Tables Used

- `grants` - Grant data
- `email_subscriptions` - Subscriber list
- `email_send_log` - Email tracking history

---

## Email Templates

### Deadline Reminder Email
- Subject: `🔔 [X] Grant(s) with Upcoming Deadlines`
- Shows grants expiring soon with deadlines highlighted
- Includes "View All Grants" button
- Unsubscribe link in footer

### New Grants Email
- Subject: `✨ [X] New Grant(s) Available!`
- Shows recently added grants with "NEW" badge
- Includes "Explore All Grants" button
- Unsubscribe link in footer

---

## Admin Dashboard Integration

The admin dashboard should have buttons to:

1. **Send Test Email** - Test with your own email
2. **Send to All Subscribers** - Manually trigger emails
3. **View Email History** - See sent emails log
4. **Manage Cron Jobs** - Enable/disable automated emails

---

## Troubleshooting

### "RESEND_API_KEY not configured"
- Make sure you added the environment variable in Supabase
- Redeploy the function after adding variables

### "Missing Supabase environment variables"
- These are automatically provided by Supabase
- Make sure you're calling the function via the Supabase URL

### Emails not being received
1. Check Resend dashboard for delivery status
2. Check spam folder
3. Verify domain is fully verified in Resend
4. Check `email_send_log` table for errors

### No subscribers found
- Add subscribers via the frontend subscription form
- Check `email_subscriptions` table has active records

---

## Cost Estimates

### Resend Pricing
- **Free tier**: 100 emails/day, 3,000/month
- **Pro tier**: $20/month for 50,000 emails/month

### Supabase Edge Functions
- **Free tier**: 500K invocations/month
- **Pro tier**: 2M invocations/month included

For most use cases, the free tiers will be sufficient initially.

---

## Next Steps

1. ✅ Set up Resend account and verify domain
2. ✅ Add environment variables to Supabase
3. ✅ Deploy the Edge Function
4. ✅ Test with your email address
5. ✅ Set up cron jobs for automation
6. ✅ Add subscription form to frontend
7. ✅ Add admin controls to dashboard

---

## Support

For issues with:
- **Resend**: Check https://resend.com/docs
- **Supabase Edge Functions**: Check https://supabase.com/docs/guides/functions
- **This implementation**: Review the function code at `supabase/functions/send-reminders/index.ts`
