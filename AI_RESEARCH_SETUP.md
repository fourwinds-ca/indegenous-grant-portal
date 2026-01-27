# AI Grant Research Setup Guide

## Overview

The enhanced AI research system uses a **two-step workflow**:

1. **Perplexity Deep Research** → Comprehensive grant discovery (finds all grants)
2. **Claude Sonnet 4.5** → Intelligent comparison (identifies new/updated/deactivated grants)

## Why Two Steps?

- **Perplexity** excels at deep web research with citations
- **Claude** excels at reasoning, comparison, and detailed analysis
- Better accuracy in detecting changes
- More detailed explanations for admin review

## Setup Steps

### 1. Configure Supabase Environment Variables

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/bjjoiwnhqtizqryragco/settings/functions

Add this environment variable (only one API key needed!):

```bash
# OpenRouter API Key (routes to both Perplexity and Claude)
OPENROUTER_API_KEY=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
```

**That's it!** OpenRouter handles routing to both AI models.

### 2. Deploy the Enhanced Edge Function

```bash
cd grantportal
npx supabase functions deploy research-grants
```

### 3. Test the AI Research

From the Admin Dashboard:
1. Go to **AI Research** tab
2. Click **Run Research Now**
3. Wait for Perplexity + Claude to complete (may take 30-60 seconds)
4. Review pending changes

## How It Works

### Step 1: Perplexity Discovery (via OpenRouter)

Perplexity Sonar Pro searches for:
- Federal Indigenous programs (ISC, CIRNAC, NRCan, ECCC)
- Provincial funding (all provinces)
- Indigenous business development
- Clean energy and environmental programs
- Infrastructure funding
- Recent announcements (2024-2026)

**Output**: Raw list of all grants found with source URLs

### Step 2: Claude Comparison (via OpenRouter)

Claude Sonnet 4.5 receives:
- Perplexity results (fresh web data)
- Current database grants (existing data)

Claude identifies:
- **New Grants**: Not in database
- **Updated Grants**: Changed deadline, amount, or status
- **Deactivated Grants**: No longer available

**Output**: Categorized changes with detailed reasoning

### Step 3: Admin Review

All changes appear as **"Pending Changes"** in the dashboard:
- View detailed information
- See AI reasoning and confidence score
- Approve to add/update grant
- Reject with notes

## Expected Results

**New Grants**: 5-15 per run (depends on recent announcements)
**Updates**: 2-8 per run (deadline changes, amount updates)
**Deactivations**: 1-5 per run (expired deadlines)
**Execution Time**: 30-90 seconds (Perplexity is slow but thorough)

## Automation (Optional)

### Set Up Weekly Automated Research

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly research (every Monday at 9 AM EST)
SELECT cron.schedule(
  'weekly-grant-research',
  '0 9 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://bjjoiwnhqtizqryragco.supabase.co/functions/v1/research-grants',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'triggered_by', 'cron'
      )
    );
  $$
);
```

## Troubleshooting

### Error: "Missing OPENROUTER_API_KEY"
- Add the API key to Supabase environment variables
- Redeploy the function

### No results found
- Check if OpenRouter API key is valid
- Verify you have credits on OpenRouter
- Check function logs for detailed errors
- Try manual research trigger

### Claude comparison fails
- Check OpenRouter API key is valid
- Verify Claude Sonnet 4.5 is available on OpenRouter
- Check function logs for detailed error

## Cost Estimates

All costs through **OpenRouter** (single billing, pay-as-you-go):

### Perplexity Sonar Pro
- Model: `perplexity/sonar-pro`
- Cost: ~$0.05-0.15 per research run

### Claude Sonnet 4.5
- Model: `anthropic/claude-sonnet-4.5`
- Cost: ~$0.05-0.15 per comparison

**Total Cost per Research Run**: ~$0.10-0.30

**Monthly Cost** (weekly automated runs): ~$1.60-4.80/month

## Next Steps

1. ✅ Add environment variables to Supabase
2. ✅ Deploy the enhanced Edge Function
3. ✅ Test the AI research manually
4. ✅ Review and approve pending changes
5. ⭐ (Optional) Set up weekly automation
6. ⭐ (Optional) Monitor costs and adjust frequency

## Support

For issues with:
- **OpenRouter**: https://openrouter.ai/docs (handles both Perplexity and Claude)
- **Supabase Functions**: https://supabase.com/docs/guides/functions

Questions? Check the function logs at:
https://supabase.com/dashboard/project/bjjoiwnhqtizqryragco/functions/research-grants/logs
