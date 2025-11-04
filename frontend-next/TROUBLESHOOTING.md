# Troubleshooting Guide

## Fixed Issues

### ✅ Tailwind CSS PostCSS Plugin Error
**Error:** `Error: It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin`

**Solution:** Tailwind CSS v4 moved the PostCSS plugin to a separate package.

1. Installed the new package:
   ```bash
   npm install -D @tailwindcss/postcss
   ```

2. Updated `postcss.config.mjs`:
   ```js
   const config = {
     plugins: {
       '@tailwindcss/postcss': {},  // Changed from 'tailwindcss'
       autoprefixer: {},
     },
   };
   ```

**Status:** ✅ Resolved

---

## Common Issues & Solutions

### Environment Variables Not Loading

**Problem:** Authentication doesn't work or shows errors about missing Supabase config

**Solution:**
1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

---

### Port Already in Use

**Problem:** `Error: Port 3000 is already in use`

**Solutions:**
1. Kill the process using the port:
   ```bash
   lsof -ti:3000 | xargs kill
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

---

### Module Not Found Errors

**Problem:** `Module not found: Can't resolve '@/components/...'`

**Solution:**
1. Check that `tsconfig.json` has the path alias configured:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. Restart the dev server

---

### Build Errors After Pulling Changes

**Problem:** Various build or type errors after git pull

**Solution:**
1. Clean install dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clean Next.js cache:
   ```bash
   rm -rf .next
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

---

### Images Not Loading

**Problem:** Logo or images don't appear

**Solutions:**
1. Check that the image exists in `public/` folder
2. Verify the path in the Image component starts with `/`:
   ```tsx
   <Image src="/greenbuffalo_logo.png" ... />
   ```
3. Clear browser cache and refresh

---

### Authentication Redirects Not Working

**Problem:** OAuth redirects fail or loop

**Solution:**
1. Check Supabase dashboard > Authentication > URL Configuration
2. Add your development URL: `http://localhost:5001`
3. Add redirect URLs for each OAuth provider
4. Ensure `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`

---

### Styles Not Applying

**Problem:** Tailwind classes don't work or styles are missing

**Solutions:**
1. Verify `globals.css` is imported in `app/layout.tsx`:
   ```tsx
   import "./globals.css";
   ```

2. Check that `globals.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Verify `tailwind.config.ts` includes all content paths:
   ```ts
   content: [
     "./app/**/*.{js,ts,jsx,tsx,mdx}",
     "./components/**/*.{js,ts,jsx,tsx,mdx}",
   ]
   ```

4. Restart the dev server

---

### TypeScript Errors

**Problem:** Type errors in components

**Solutions:**
1. Install missing type definitions:
   ```bash
   npm install -D @types/react @types/node
   ```

2. Regenerate Next.js types:
   ```bash
   npm run dev
   ```
   (This creates `next-env.d.ts`)

---

## Getting Help

If you encounter an issue not listed here:

1. Check the Next.js documentation: https://nextjs.org/docs
2. Check the Tailwind CSS documentation: https://tailwindcss.com/docs
3. Check Supabase documentation: https://supabase.com/docs

## Current Status

✅ **Server Running:** http://localhost:5001
✅ **Tailwind CSS:** Working
✅ **TypeScript:** Compiling
⚠️ **Authentication:** Requires Supabase credentials in `.env.local`
