# Four Winds Grant Portal — Onboarding Guide

Welcome to the Four Winds Indigenous Grant Portal! This guide will walk you through everything you need to know to use the platform.

---

## What Is This?

The Four Winds Grant Portal helps Indigenous communities across Canada discover and track government grants and funding programs. The portal uses AI to automatically find new grants from official government and trusted Indigenous organization websites, so you always have the most up-to-date information.

---

## For Public Visitors

### Browsing Grants

When you visit the portal, you'll see a list of all active grants available to Indigenous communities. Each grant card shows:

- **Grant name** and administering agency
- **Funding amount** (or range)
- **Deadline** — when applications are due
- **Province** — whether it's federal or province-specific
- **Category** — what the funding is for (housing, energy, education, etc.)
- **Apply link** — takes you directly to the official government application page

You can scroll through all available grants on the main page. Grants are sorted by upcoming deadlines so the most urgent ones appear first.

### Requesting Support

If you need help applying for a grant or have questions about the portal, click the **"Request Support"** button to send us a message. Fill in your name, email, and message — our team will get back to you.

### Subscribing to Updates

Want to be notified when new grants are added? You can subscribe to email updates. You'll receive notifications when:

- New grants are discovered
- Existing grant deadlines change
- New funding programs are announced

---

## For Admin Users

### Logging In

Admin access is available at **/admin** on the portal. Sign in with your admin email and password. Only approved admin emails can access the dashboard.

If you need admin access, contact the system administrator to have your email added.

### Admin Dashboard Overview

Once logged in, you'll see four tabs:

#### 1. Grants Database

This is your full list of grants in the system. From here you can:

- View all active, inactive, and expired grants
- Edit grant details (title, description, deadline, amount, etc.)
- Manually add new grants
- Remove grants that are no longer relevant

#### 2. AI Research

This is the AI-powered grant discovery tool. Here's how it works:

**Running a Research Scan:**

1. Click **"Run Research Now"**
2. The system uses AI to search official government websites for all Indigenous grants currently available
3. This takes about 3-5 minutes to complete
4. When done, you'll see **Pending Changes for Review**

**Reviewing Pending Changes:**

Each pending change shows:

- **Change type** — New grant, Update to existing grant, or Deactivation
- **Confidence score** — How confident the AI is about this finding
- **Details** — What the AI found and why it's recommending the change
- **Source URL** — The official government page where the information was found

For each pending change, you can:

- Click the **eye icon** to preview the full grant details
- Click the **green checkmark** to approve (adds/updates the grant in the database)
- Click the **red X** to reject (discards the change)

**What the AI Searches:**

The AI searches only trusted sources:

- Federal government websites (canada.ca, isc-sac.gc.ca, nrcan-rncan.gc.ca, cmhc-schl.gc.ca, etc.)
- All 13 provincial and territorial government websites
- Trusted Indigenous organizations (NACCA, Indspire, First Nations Health Authority, etc.)
- Crown corporations (BDC, Canada Council for the Arts, etc.)
- Federal research councils and regional development agencies

See [Trusted-Grant-Providers.md](Trusted-Grant-Providers.md) for the complete list of approved sources.

#### 3. Contact Messages

View messages submitted through the "Request Support" form on the public site. You can:

- Read incoming messages
- Mark messages as read or responded
- Add internal notes for your team

#### 4. Subscriptions

Manage email subscribers who signed up for grant notifications. View subscriber emails, subscription preferences, and manage the subscriber list.

---

## Common Tasks

### "I want to find grants for my community"

1. Visit the portal homepage
2. Browse the grants list — they're sorted by nearest deadline
3. Click the **Apply** link on any grant to go directly to the government application page
4. If you need help, use the **Request Support** form

### "I want to check if there are any new grants"

1. Log in to the Admin Dashboard
2. Go to the **AI Research** tab
3. Click **Run Research Now**
4. Wait 3-5 minutes for the scan to complete
5. Review the Pending Changes — approve the ones that look correct

### "I want to add a grant manually"

1. Log in to the Admin Dashboard
2. Go to the **Grants Database** tab
3. Click **Add Grant**
4. Fill in the grant details (title, agency, amount, deadline, etc.)
5. Save

### "I want to update a grant's deadline"

1. Log in to the Admin Dashboard
2. Go to the **Grants Database** tab
3. Find the grant and click **Edit**
4. Update the deadline field
5. Save

### "I want to respond to a support request"

1. Log in to the Admin Dashboard
2. Go to the **Contact Messages** tab
3. Read the message
4. Respond to the person via their email address
5. Mark the message as "Responded"

---

## How the AI Grant Research Works (Non-Technical)

Think of the AI research as a very thorough research assistant. When you click "Run Research Now," here's what happens behind the scenes:

1. **Search Phase** — An AI called Perplexity does a deep search across all Canadian government websites and trusted Indigenous organizations. It reads through hundreds of pages looking for every grant program available to Indigenous communities.

2. **Analysis Phase** — A second AI called Claude takes the search results and compares them against what's already in your database. It figures out:
   - Which grants are brand new (not in your system yet)
   - Which grants have changed (new deadline, different amount, etc.)
   - Which grants may have expired or been discontinued

3. **Review Phase** — All findings are presented to you as "Pending Changes." Nothing gets added or changed automatically — you always have the final say. Review each suggestion, and approve or reject it.

This process ensures the portal stays current while keeping a human in the loop for quality control.

---

## Frequently Asked Questions

**Q: How often should I run the AI research?**
A: Once a week is a good cadence. Government grant programs don't change daily, but weekly checks ensure you catch new announcements and deadline changes promptly.

**Q: Can the AI make mistakes?**
A: Yes, occasionally. That's why every change goes through admin review. The AI provides a confidence score and reasoning for each suggestion — use your judgment to approve or reject.

**Q: What if I accidentally approve a wrong change?**
A: You can always edit or remove grants from the Grants Database tab. No change is permanent.

**Q: Who can access the admin dashboard?**
A: Only users whose email is in the admin list. Contact the system administrator to add new admins.

**Q: Is the data only from government sources?**
A: Yes. The AI is restricted to searching only official Canadian government websites and a curated list of trusted Indigenous organizations. It will not pull data from news articles, blogs, or third-party websites.

**Q: How much does the AI research cost to run?**
A: Each research run costs approximately $0.10-0.30 in AI usage fees through OpenRouter. Running weekly costs roughly $2-5 per month.

---

## Getting Help

- **Portal issues**: Use the Request Support form on the website
- **Admin access**: Contact the system administrator
- **Technical issues**: Open an issue at the project's GitHub repository
