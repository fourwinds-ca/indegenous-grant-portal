# Supabase Migration Guide

This guide explains how to complete the migration from Neon Database + Replit Auth to Supabase.

## What Changed

### 1. Database: Neon → Supabase PostgreSQL
- Removed `@neondatabase/serverless` package
- Added `postgres` package for standard PostgreSQL connections
- Updated [server/db.ts](server/db.ts) to use `postgres-js` driver

### 2. Authentication: Replit Auth → Supabase Auth
- Removed `openid-client`, `passport`, and `memoizee` packages
- Added `@supabase/supabase-js` package
- Created new [server/supabaseAuth.ts](server/supabaseAuth.ts)
- Updated [src/hooks/useAuth.ts](src/hooks/useAuth.ts) with Supabase auth methods
- Created [src/lib/supabase.ts](src/lib/supabase.ts) for frontend Supabase client

### 3. New Features
- Row Level Security (RLS) policies for data protection
- OAuth support (Google, GitHub, Azure)
- Email/password authentication
- Automatic session management
- Supabase CLI integration for migrations

## Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com/project/qouymvuwrdndmxsbghav

2. Get your **Database URL**:
   - Go to: Project Settings → Database → Connection string
   - Select "URI" tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password

3. Get your **Service Role Key**:
   - Go to: Project Settings → API → Project API keys
   - Copy the `service_role` key (keep this secret!)

4. Generate a **Session Secret**:
   ```bash
   openssl rand -base64 32
   ```

### Step 2: Update Your .env File

Edit your `.env` file and fill in the missing values:

```bash
# Update this with your actual database password
DATABASE_URL=postgresql://postgres.[your-password]@db.qouymvuwrdndmxsbghav.supabase.co:5432/postgres

# Add your service role key (from Step 1.3)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Add your session secret (from Step 1.4)
SESSION_SECRET=your-generated-session-secret
```

### Step 3: Link to Your Supabase Project

```bash
npx supabase link --project-ref qouymvuwrdndmxsbghav
```

When prompted, enter your database password.

### Step 4: Run Database Migrations

Push the schema to your Supabase database:

```bash
npx supabase db push
```

This will:
- Create all tables (users, grants, user_grant_applications, etc.)
- Set up Row Level Security policies
- Create necessary indexes
- Add triggers for automatic timestamp updates

### Step 5: Enable Authentication Providers (Optional)

If you want to use OAuth (Google, GitHub, etc.):

1. Go to: Authentication → Providers
2. Enable the providers you want (Google, GitHub, Azure, etc.)
3. Add your OAuth credentials for each provider

For local development, email/password auth is already configured.

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Start the Application

In separate terminals:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## New NPM Scripts

### Supabase CLI Commands
```bash
npm run supabase:start      # Start local Supabase (Docker required)
npm run supabase:stop       # Stop local Supabase
npm run supabase:status     # Check Supabase status
npm run supabase:migrate    # Push migrations to remote
npm run supabase:diff       # Generate migration from schema changes
npm run supabase:reset      # Reset local database
```

### Drizzle Commands (Still available)
```bash
npm run db:push             # Push schema changes
npm run db:generate         # Generate migrations
npm run db:migrate          # Run migrations
```

## Authentication Flow

### Frontend (React)

The [useAuth](src/hooks/useAuth.ts) hook now provides:

```javascript
const {
  user,              // Current user object
  session,           // Supabase session
  isLoading,         // Loading state
  isAuthenticated,   // Boolean auth status
  signInWithEmail,   // Email/password sign in
  signUpWithEmail,   // Email/password sign up
  signOut,           // Sign out
  signInWithOAuth,   // OAuth sign in (Google, GitHub, etc.)
} = useAuth();
```

### Backend (Express)

The [supabaseAuth](server/supabaseAuth.ts) module provides:

- `setupAuth(app)` - Sets up all auth routes
- `isAuthenticated` - Middleware to protect routes
- `supabaseAdmin` - Admin client for server operations

### Protected Routes

Routes using `isAuthenticated` middleware will:
1. Check for valid session
2. Verify token with Supabase
3. Attach user to `req.user`

Example:
```javascript
app.get('/api/user/applications', isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // ... handle request
});
```

## Row Level Security (RLS)

Your database now has RLS policies that automatically:

- Users can only see/edit their own profile
- Users can only see/manage their own applications
- Grants are publicly readable
- Reporting requirements are tied to user applications
- Metrics are user-specific

This means you can use Supabase client-side without worrying about data leaks!

## Testing the Migration

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-21T...",
  "server": "Indigenous Grants Tracker"
}
```

### 2. Test Sign Up

From the frontend, try creating a new account with email/password.

### 3. Test Data Access

Once logged in, try:
- Viewing grants (should work)
- Creating an application
- Viewing your applications

## Troubleshooting

### "Missing Supabase environment variables"
- Check your `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env`

### "DATABASE_URL must be set"
- Verify your `.env` file has the correct `DATABASE_URL`
- Make sure you replaced `[your-password]` with actual password

### "Unauthorized" errors
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- Verify the key is correct in Supabase dashboard

### RLS errors
- If you can't access data you should be able to, check RLS policies
- You can disable RLS temporarily for debugging (not recommended in production)

## Migration Checklist

- [ ] Get database URL with password
- [ ] Get service role key
- [ ] Generate session secret
- [ ] Update `.env` file
- [ ] Link Supabase project: `npx supabase link`
- [ ] Push migrations: `npx supabase db push`
- [ ] Install dependencies: `npm install`
- [ ] Start backend: `npm run server`
- [ ] Start frontend: `npm run dev`
- [ ] Test authentication (sign up/sign in)
- [ ] Test data access (grants, applications)
- [ ] (Optional) Enable OAuth providers

## Next Steps

1. **Enable OAuth Providers**: Set up Google/GitHub sign-in
2. **Deploy**: Deploy to Vercel/Netlify with Supabase
3. **Storage**: Use Supabase Storage for document uploads
4. **Real-time**: Add real-time subscriptions for live updates
5. **Edge Functions**: Move Python scripts to Supabase Edge Functions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
