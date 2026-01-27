# SMTP Email Setup Guide for Edge Functions

## ⚠️ Important Limitation

**Deno Edge Functions (Supabase) do NOT support direct SMTP connections** because:
- No TCP socket access in serverless environments
- No access to `net` or `smtp` libraries
- Security restrictions prevent direct SMTP protocol

## ✅ Recommended Solutions

You have **3 options** to send emails with your `support@fourwinds.ca` address:

---

## Option 1: SMTP2GO (Easiest) ⭐ RECOMMENDED

SMTP2GO provides an HTTP API that works with your existing SMTP credentials.

### Setup Steps

1. **Sign up at SMTP2GO**
   - Go to https://www.smtp2go.com/
   - Create free account (1,000 emails/month free)

2. **Add Your Email Address**
   - Settings → Sender Addresses
   - Add `support@fourwinds.ca`
   - Verify via email confirmation

3. **Get API Key**
   - Settings → API Keys
   - Create new API key
   - Copy the key

4. **Configure Supabase**
   Add these environment variables in Supabase:

   | Variable | Value |
   |----------|-------|
   | `SMTP_USERNAME` | `support@fourwinds.ca` |
   | `SMTP_PASSWORD` | Your SMTP2GO API key |
   | `SMTP_HOST` | `smtp2go` (identifier) |
   | `SMTP_PORT` | `587` |
   | `APP_BASE_URL` | Your website URL |

5. **Deploy Function**
   ```bash
   npx supabase functions deploy send-reminders
   ```

### Pros
- ✅ Works with Edge Functions
- ✅ Simple HTTP API
- ✅ Better deliverability
- ✅ Email analytics included
- ✅ Free tier: 1,000 emails/month

### Cons
- Requires third-party service

---

## Option 2: SendGrid with Your Domain ⭐ ALTERNATIVE

Use SendGrid's API but send from `support@fourwinds.ca`.

### Setup Steps

1. **Sign up at SendGrid**
   - Go to https://sendgrid.com/
   - Create account (100 emails/day free)

2. **Verify Domain**
   - Settings → Sender Authentication
   - Verify `fourwinds.ca` domain
   - Add DNS records (SPF, DKIM, DMARC)

3. **Create Sender**
   - Settings → Sender Authentication → Single Sender Verification
   - Add `support@fourwinds.ca`
   - Verify via email

4. **Get API Key**
   - Settings → API Keys
   - Create API key with "Mail Send" permission
   - Copy the key (starts with `SG.`)

5. **Update Edge Function**
   Modify the `sendEmail` function to use SendGrid API:

   ```typescript
   const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${smtpConfig.password}`, // SendGrid API key
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       personalizations: [{
         to: [{ email: payload.to }],
       }],
       from: { email: smtpConfig.username }, // support@fourwinds.ca
       subject: payload.subject,
       content: [{
         type: 'text/html',
         value: payload.html,
       }],
     }),
   });
   ```

6. **Configure Supabase**
   | Variable | Value |
   |----------|-------|
   | `SMTP_USERNAME` | `support@fourwinds.ca` |
   | `SMTP_PASSWORD` | Your SendGrid API key |
   | `SMTP_HOST` | `sendgrid` |

### Pros
- ✅ Industry standard
- ✅ Better deliverability
- ✅ Advanced analytics
- ✅ Free tier: 100 emails/day

---

## Option 3: Mailgun ⭐ ALTERNATIVE

Similar to SendGrid but with different pricing.

### Setup Steps

1. **Sign up at Mailgun**
   - Go to https://www.mailgun.com/
   - Create account (5,000 emails/month free for 3 months)

2. **Add Domain**
   - Sending → Domains → Add New Domain
   - Add `fourwinds.ca`
   - Add DNS records provided

3. **Get API Key**
   - Settings → API Keys
   - Copy your Private API key

4. **Update Edge Function**
   ```typescript
   const response = await fetch(`https://api.mailgun.net/v3/${smtpConfig.host}/messages`, {
     method: 'POST',
     headers: {
       'Authorization': `Basic ${btoa(`api:${smtpConfig.password}`)}`,
       'Content-Type': 'application/x-www-form-urlencoded',
     },
     body: new URLSearchParams({
       from: smtpConfig.username,
       to: payload.to,
       subject: payload.subject,
       html: payload.html,
     }),
   });
   ```

5. **Configure Supabase**
   | Variable | Value |
   |----------|-------|
   | `SMTP_USERNAME` | `support@fourwinds.ca` |
   | `SMTP_PASSWORD` | Your Mailgun API key |
   | `SMTP_HOST` | `fourwinds.ca` |

### Pros
- ✅ Generous free tier
- ✅ Good for developers
- ✅ Detailed logs

---

## Option 4: Resend (Original Implementation)

Already implemented in the code. Just add your domain.

### Setup Steps

See [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) for complete instructions.

**TL;DR:**
1. Sign up at https://resend.com
2. Verify `fourwinds.ca` domain
3. Get API key
4. Add to Supabase: `RESEND_API_KEY`

### Pros
- ✅ Already coded
- ✅ Modern developer experience
- ✅ Great documentation
- ✅ Free tier: 100 emails/day

---

## Quick Comparison

| Service | Free Tier | Best For | Setup Complexity |
|---------|-----------|----------|------------------|
| **SMTP2GO** | 1,000/month | Your SMTP credentials | ⭐ Easy |
| **SendGrid** | 100/day | Established service | ⭐⭐ Medium |
| **Mailgun** | 5,000/mo (3mo) | Developers | ⭐⭐ Medium |
| **Resend** | 100/day | Modern apps | ⭐ Easy |

---

## Current Edge Function Status

The Edge Function is **configured for SMTP2GO by default**, but you can modify it to use any HTTP-based email service.

### Environment Variables Needed

Add these to **Supabase Project Settings → Edge Functions → Environment Variables**:

```bash
# SMTP Configuration
SMTP_HOST=smtp2go          # or your email service
SMTP_PORT=587              # Standard submission port
SMTP_USERNAME=support@fourwinds.ca
SMTP_PASSWORD=your-api-key-here
SMTP_SECURE=false          # Use TLS/STARTTLS

# Application URL
APP_BASE_URL=https://yourdomain.com
```

---

## Why Direct SMTP Doesn't Work

```
❌ Edge Functions Cannot:
- Open TCP sockets (no net library)
- Use SMTP protocol directly
- Install Node.js SMTP libraries
- Access system-level networking

✅ Edge Functions CAN:
- Make HTTP/HTTPS requests
- Use fetch() API
- Call REST APIs
- Use email service HTTP APIs
```

---

## Testing Your Setup

After deployment, test with:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "deadline_reminders",
    "daysAhead": 7,
    "testEmail": "your-test-email@example.com"
  }'
```

---

## Recommendation for Four Winds

**Use SMTP2GO** because:
1. ✅ Works with your existing `support@fourwinds.ca` email
2. ✅ Simple HTTP API (no code changes needed)
3. ✅ 1,000 free emails/month (plenty for beta)
4. ✅ Easiest setup (5 minutes)
5. ✅ Reliable delivery

**Cost:** Free for up to 1,000 emails/month, then $10/month for 10,000 emails.

---

## Next Steps

1. Choose your email service (recommend SMTP2GO)
2. Sign up and get API key
3. Add environment variables to Supabase
4. Deploy the Edge Function
5. Test with your email address
6. Set up cron jobs for automation

---

## Support

- **SMTP2GO Docs**: https://apidocs.smtp2go.com/
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Mailgun Docs**: https://documentation.mailgun.com/
- **Resend Docs**: https://resend.com/docs

For implementation questions, see the Edge Function code at:
`supabase/functions/send-reminders/index.ts`
