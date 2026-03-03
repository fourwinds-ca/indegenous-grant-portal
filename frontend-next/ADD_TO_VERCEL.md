# Add Environment Variables to Vercel

## Your Supabase Credentials

Copy and paste these into Vercel:

### NEXT_PUBLIC_SUPABASE_URL
```
https://bjjoiwnhqtizqryragco.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
<your-supabase-anon-key>
```

---

## Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: **frontend-next**
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add both variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://bjjoiwnhqtizqryragco.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `<your-supabase-anon-key>`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

6. Click **Redeploy** button at the top

---

## Method 2: Vercel CLI (Command Line)

Run these commands:

```bash
cd frontend-next

# Add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# When prompted:
# - What's the value?: https://bjjoiwnhqtizqryragco.supabase.co
# - Environments: Select all (Production, Preview, Development)

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# When prompted:
# - What's the value?: <your-supabase-anon-key>
# - Environments: Select all (Production, Preview, Development)

# Redeploy
vercel --prod
```

---

## After Adding Variables

1. **Wait for deployment** to complete (~2-3 minutes)
2. **Visit your Vercel URL**
3. **The blank page error should be gone**
4. **You should see the landing page with grants**
5. **Authentication should work**

---

## Troubleshooting

If you still see the error after adding variables:

1. **Check the variables are set:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify both variables are listed

2. **Check for typos:**
   - Variable names must be EXACT: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - They are case-sensitive!

3. **Make sure you redeployed:**
   - Environment variables only apply to NEW deployments
   - You must redeploy after adding variables

4. **Check all environments:**
   - Make sure both Production, Preview, and Development are checked

5. **Clear browser cache:**
   - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - Or open in incognito/private window

---

## Quick Test

After deployment completes, test by:
1. Opening your Vercel URL
2. Opening browser console (F12)
3. If no Supabase errors → Success! ✅
4. Try signing up with a test email

---

Done! Your app should work perfectly after adding these environment variables. 🎉
