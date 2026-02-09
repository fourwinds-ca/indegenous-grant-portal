# Indigenous Grant Tracker  

A comprehensive web application to help Indigenous communities discover, track, and manage grant applications.

## 🚀 Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query

## 📋 Features

- 🔍 **Grant Discovery**: Web scraping to find Indigenous grant opportunities
- 📝 **Application Tracking**: Track applications through all stages (planning, submitted, approved, etc.)
- 📊 **Analytics**: View metrics on applications, approvals, and funding
- 📅 **Reporting Management**: Track reporting requirements and deadlines
- 🔐 **Secure Authentication**: Email/password and OAuth (Google, GitHub, Azure)
- 🛡️ **Row Level Security**: Automatic data protection at database level

## 🚧 Recent Migration

This project was recently migrated from **Neon Database + Replit Auth** to **Supabase**.

**See [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for quick start guide**
**See [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) for detailed setup instructions**

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))
- Your Supabase project credentials

### 2. Clone and Install

```bash
git clone <your-repo>
cd Indigenous-Grant-Tracker
npm install
```

### 3. Set Up Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL` - Your Supabase database connection string
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key
- `SESSION_SECRET` - Generate with `openssl rand -base64 32`

### 4. Link Supabase Project

```bash
npx supabase link --project-ref qouymvuwrdndmxsbghav
```

### 5. Push Database Schema

```bash
npx supabase db push
```

### 6. Run the Application

**Backend (Terminal 1):**
```bash
npm run server
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

Visit: http://localhost:5173

## 📚 Available Scripts

### Development
- `npm run dev` - Start Vite dev server (frontend)
- `npm run server` - Start Express server (backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database (Drizzle)
- `npm run db:push` - Push schema changes
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations

### Database (Supabase CLI)
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:migrate` - Push migrations to remote
- `npm run supabase:diff` - Generate migration from changes
- `npm run supabase:reset` - Reset local database

## 🗄️ Database Schema

- **users** - User profiles
- **grants** - Available grant programs
- **user_grant_applications** - Track user applications
- **reporting_requirements** - Compliance tracking
- **metrics** - Analytics data
- **scraped_sources** - Web scraping cache
- **sessions** - Authentication sessions

All tables include Row Level Security (RLS) policies.

## 🔐 Authentication

### Frontend Usage

```javascript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const {
    user,
    session,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInWithOAuth,
  } = useAuth();

  // Sign up
  await signUpWithEmail({ email, password });

  // Sign in
  await signInWithEmail({ email, password });

  // OAuth
  await signInWithOAuth('google');

  // Sign out
  await signOut();
}
```

### Backend Usage

Protected routes automatically verify authentication:

```javascript
app.get('/api/user/data', isAuthenticated, (req, res) => {
  const userId = req.user.claims.sub;
  // ... handle request
});
```

## 🛡️ Security Features

- Row Level Security (RLS) on all user data
- Automatic token refresh
- Secure session storage in PostgreSQL
- Service role separation (client vs server)
- Environment variable protection

## 📖 API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/grants` - List grants
- `GET /api/grants/search?q=query` - Search grants
- `GET /api/grants/:id` - Get grant details

### Protected (requires authentication)
- `GET /api/auth/user` - Get current user
- `GET /api/user/applications` - List user applications
- `POST /api/user/applications` - Create application
- `PUT /api/user/applications/:id` - Update application
- `GET /api/user/reporting` - Get reporting requirements
- `GET /api/user/metrics` - Get user metrics

### Admin (requires authentication)
- `POST /api/admin/discover-grants` - Run grant discovery
- `POST /api/admin/generate-test-grants` - Generate test data

## 🐛 Troubleshooting

See [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md#troubleshooting) for common issues and solutions.

## 📝 Documentation

- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Quick migration overview
- [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) - Detailed setup guide
- [.env.example](.env.example) - Environment variables reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) troubleshooting
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Open an issue in this repository
