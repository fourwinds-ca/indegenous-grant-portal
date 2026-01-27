# Send Emails Using Gmail (Simplest Method)

## ✅ The Easiest Way

Use your Gmail account to send emails from `support@fourwinds.ca`. Takes **5 minutes** to set up.

---

## Method 1: Gmail "Send As" + App Password ⭐ RECOMMENDED

### What You'll Do
1. Add `support@fourwinds.ca` as a "Send As" address in Gmail
2. Create a Gmail App Password
3. Use SMTP2GO to relay through Gmail
4. Done!

### Step-by-Step

#### 1. Set Up Gmail "Send As"

1. Go to Gmail → Settings (⚙️) → See all settings
2. Click **Accounts and Import** tab
3. In "Send mail as" section, click **Add another email address**
4. Enter:
   - Name: `Four Winds`
   - Email: `support@fourwinds.ca`
   - ✅ Check "Treat as an alias"
5. Click **Next Step**
6. Choose "Send through Gmail" (easier)
7. Click **Add Account**
8. Gmail will send a verification email to `support@fourwinds.ca`
9. Check that inbox and click the verification link

#### 2. Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Scroll down → App passwords
4. Select:
   - App: Mail
   - Device: Other (custom name) → "Grant Portal"
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

#### 3. Sign Up for SMTP2GO (Free Relay)

1. Go to https://www.smtp2go.com/
2. Sign up (free tier: 1,000 emails/month)
3. Go to **Settings** → **Sender Addresses**
4. Add `support@fourwinds.ca`
5. Verify the email address
6. Go to **Settings** → **API Keys**
7. Create new API key
8. **Copy the API key**

#### 4. Configure Supabase

Add these to **Supabase Project Settings → Edge Functions → Environment Variables**:

```
SMTP_USERNAME=your-gmail-address@gmail.com
SMTP_PASSWORD=<your-smtp2go-api-key>
SMTP_HOST=gmail-smtp
SMTP_PORT=587
APP_BASE_URL=https://yourdomain.com
```

#### 5. Deploy

```bash
npx supabase functions deploy send-reminders
```

#### 6. Test

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/send-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "deadline_reminders",
    "daysAhead": 7,
    "testEmail": "your-test-email@example.com"
  }'
```

---

## Method 2: Just Use Gmail Directly (Even Simpler)

Don't bother with `support@fourwinds.ca` - just send from your Gmail:

### Setup

1. Create Gmail App Password (step 2 above)
2. Sign up for SMTP2GO
3. Add your Gmail address as sender
4. Configure Supabase:

```
SMTP_USERNAME=youremail@gmail.com
SMTP_PASSWORD=<smtp2go-api-key>
SMTP_HOST=gmail
SMTP_PORT=587
```

5. Deploy and done!

**Emails will come from:** `youremail@gmail.com` or `Four Winds <youremail@gmail.com>`

---

## Why This Works

1. **Gmail**: Your email account (free, reliable)
2. **SMTP2GO**: HTTP gateway (works with Edge Functions)
3. **Edge Function**: Sends emails via HTTP (not direct SMTP)

```
Edge Function → HTTP → SMTP2GO → Gmail → Recipient
```

---

## Cost

- **Gmail**: FREE
- **SMTP2GO**: FREE (up to 1,000 emails/month)
- **Total**: $0/month

When you exceed 1,000 emails/month: $10/month

---

## What About support@fourwinds.ca?

### You Can Still:
- ✅ **Receive** emails at support@fourwinds.ca (via IMAP)
- ✅ **Send** emails that appear to be from support@fourwinds.ca (via "Send As")
- ✅ Recipients see: `Four Winds <support@fourwinds.ca>`
- ✅ Replies go to: `support@fourwinds.ca`

### Behind the Scenes:
- Gmail handles the actual sending
- SMTP2GO provides the HTTP gateway
- Edge Function makes the HTTP request

---

## Alternative: Skip support@fourwinds.ca Entirely

**Just use your Gmail directly:**

1. Sign up for SMTP2GO
2. Get API key
3. Add to Supabase:
   ```
   SMTP_USERNAME=yourname@gmail.com
   SMTP_PASSWORD=<smtp2go-api-key>
   ```
4. Done!

**Emails show as:** `yourname@gmail.com`

---

## Quick Comparison

| Method | Sender Address | Complexity | Best For |
|--------|----------------|------------|----------|
| **Gmail "Send As"** | support@fourwinds.ca | Medium | Professional look |
| **Gmail Direct** | yourname@gmail.com | Easy | Quick setup |
| **SMTP2GO Only** | support@fourwinds.ca | Easy | No Gmail needed |

---

## My Recommendation

**Use Gmail Direct (Method 2)** because:

1. ✅ Setup in 5 minutes
2. ✅ No domain verification needed
3. ✅ Free forever (1,000 emails/month)
4. ✅ Gmail's excellent deliverability
5. ✅ No confusion with multiple email addresses

**Later**, if you want professional branding:
- Switch to "Send As" method
- Or use Resend with domain verification

---

## Next Steps

1. Create Gmail App Password
2. Sign up for SMTP2GO (1 minute)
3. Get SMTP2GO API key
4. Add to Supabase environment variables
5. Deploy: `npx supabase functions deploy send-reminders`
6. Test with your email

Total time: **5 minutes**
Total cost: **$0**

---

## Need Help?

- **Gmail App Passwords**: https://support.google.com/mail/answer/185833
- **SMTP2GO**: https://www.smtp2go.com/docs
- **Send As**: https://support.google.com/mail/answer/22370

Questions? The Edge Function is ready to go - just add your credentials!
