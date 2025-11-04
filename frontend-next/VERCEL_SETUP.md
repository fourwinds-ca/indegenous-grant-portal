# Vercel Deployment Setup - Environment Variables

## Required Environment Variables

You need to add **2 environment variables** to your Vercel project to fix the Supabase error:

### 1. NEXT_PUBLIC_SUPABASE_URL
**Value:** Your Supabase project URL
**Format:** `https://[your-project-ref].supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Value:** Your Supabase anonymous/public key
**Format:** Long string starting with `eyJ...`

---

## How to Get These Values from Supabase

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Sign in to your account
3. Select your project (or create a new one)

### Step 2: Get Your Project URL
1. In the left sidebar, click **"Project Settings"** (gear icon)
2. Click **"API"** tab
3. Find **"Project URL"** section
4. Copy the URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

### Step 3: Get Your Anon Key
1. Still in the **"API"** tab
2. Find **"Project API keys"** section
3. Copy the **"anon public"** key
   - This is a long JWT token
   - Starts with `eyJ`
   - It's safe to use in client-side code

---

## How to Add Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your Vercel project:**
   - Visit https://vercel.com/dashboard
   - Select your project: `frontend-next`

2. **Navigate to Settings:**
   - Click **"Settings"** tab at the top
   - Click **"Environment Variables"** in the left sidebar

3. **Add each variable:**

   **For NEXT_PUBLIC_SUPABASE_URL:**
   - Click **"Add New"** button
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Your Supabase URL (e.g., `https://xxxxx.supabase.co`)
   - **Environments:** Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

   **For NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Click **"Add New"** button again
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon key (long string starting with `eyJ`)
   - **Environments:** Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

4. **Redeploy:**
   - After adding the variables, Vercel will ask if you want to redeploy
   - Click **"Redeploy"** or trigger a new deployment by pushing to Git

---

### Method 2: Vercel CLI

If you prefer using the command line:

```bash
cd frontend-next

# Add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_URL development
# Paste your Supabase URL when prompted

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
# Paste your Supabase anon key when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
# Paste your Supabase anon key when prompted

# Redeploy
vercel --prod
```

---

## Quick Reference Card

**Copy and paste this template with your actual values:**

```
Environment Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://[YOUR-PROJECT-REF].supabase.co
Environments: Production, Preview, Development

Environment Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJ[YOUR-ANON-KEY-HERE]
Environments: Production, Preview, Development
```

---

## Creating a Supabase Project (If You Don't Have One)

If you haven't created a Supabase project yet:

1. **Sign up/Login:**
   - Go to https://app.supabase.com
   - Sign up or log in

2. **Create New Project:**
   - Click **"New Project"**
   - Choose your organization
   - Enter project details:
     - **Name:** Indigenous Grant Portal (or your choice)
     - **Database Password:** Choose a strong password (save it!)
     - **Region:** Choose closest to your users (e.g., US East, Canada)
   - Click **"Create new project"**

3. **Wait for Setup:**
   - Supabase will provision your database (takes ~2 minutes)
   - Once ready, you'll see the project dashboard

4. **Get Your Credentials:**
   - Follow steps above to get URL and anon key

---

## After Adding Environment Variables

### Expected Result:
✅ The error "Missing Supabase environment variables" should disappear
✅ Your app will connect to Supabase
✅ Authentication will work
✅ Users can sign in/up and track grants

### To Verify It's Working:

1. **Wait for deployment to complete** (~2-3 minutes)
2. **Visit your Vercel URL**
3. **Open browser console** (F12)
4. **Check for errors:**
   - ❌ If you still see Supabase errors: Double-check the env vars are correct
   - ✅ If no errors: Environment variables are set correctly!

5. **Test authentication:**
   - Click "Get Started" or "Sign In"
   - Try to create an account
   - Should work without errors

---

## Common Issues & Solutions

### Issue 1: Still Getting Error After Adding Env Vars
**Solution:**
- Make sure you clicked "Redeploy" after adding the variables
- Check that both variables are set for Production environment
- Verify there are no typos in the variable names (they're case-sensitive!)

### Issue 2: Can't Find Supabase URL/Key
**Solution:**
- Make sure you're logged into the correct Supabase account
- Ensure your project has finished provisioning
- Try refreshing the Supabase dashboard

### Issue 3: Authentication Not Working
**Solution:**
- In Supabase dashboard, go to Authentication → URL Configuration
- Add your Vercel deployment URL to allowed redirect URLs
- Example: `https://your-app.vercel.app`

---

## Security Notes

✅ **Safe to expose:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (designed for client-side use)

❌ **NEVER expose:**
- `SUPABASE_SERVICE_ROLE_KEY` - Keep this secret on server-side only
- Database password

The `NEXT_PUBLIC_` prefix means these variables are bundled into your client-side JavaScript. That's intentional and safe for these specific Supabase credentials.

---

## Next Steps After Setup

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy your application
3. ✅ Test authentication flow
4. Configure OAuth providers (optional):
   - Go to Supabase → Authentication → Providers
   - Enable Google, GitHub, Azure as needed
   - Add OAuth credentials
5. Set up email templates (optional):
   - Go to Supabase → Authentication → Email Templates
   - Customize welcome emails, password reset emails, etc.

---

## Summary

**What you need to do RIGHT NOW:**

1. Go to https://app.supabase.com
2. Get your Project URL and Anon Key
3. Go to https://vercel.com/dashboard
4. Add both environment variables to your project
5. Redeploy
6. Test the app

That's it! Your Green Buffalo Indigenous Grant Portal will be fully functional! 🎉
