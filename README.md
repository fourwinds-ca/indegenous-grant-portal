# Indigenous Grant Tracker

A comprehensive web application to help Indigenous communities discover, track, and manage government grant applications across Canada. Powered by AI-driven research that automatically finds new grants from official government sources.

---

## Technical Architecture

### Architecture Diagram

Open the diagram below in [draw.io](https://app.diagrams.net/) by importing the XML file at [`docs/architecture.drawio`](docs/architecture.drawio).

![Architecture Overview](docs/architecture-overview.png)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS                                          │
│                  Public Visitors  ·  Admin (doug@fourwinds.ca)              │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Hosting)                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 16 Frontend                                │  │
│  │                                                                       │  │
│  │  Pages:  /  (Landing)   /admin  (Dashboard)   /about   /reset-pwd    │  │
│  │                                                                       │  │
│  │  Components:                                                          │  │
│  │   Landing.tsx ─── GrantsList.tsx ─── ContactForm.tsx ─── Metrics.tsx  │  │
│  │   AdminDashboard.tsx ─── AIResearchPanel.tsx ─── GrantCard.tsx        │  │
│  │   Applications.tsx ─── TrackedGrants.tsx                              │  │
│  │                                                                       │  │
│  │  Lib:                                                                 │  │
│  │   supabase.ts ─── grantsService.ts ─── contactService.ts             │  │
│  │   adminAuth.ts ─── pendingChangesService.ts ─── subscriptionService  │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │ Supabase JS Client (REST + Auth)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (Backend)                                   │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────┐    │
│  │   Supabase Auth   │  │          Edge Functions (Deno)               │    │
│  │                    │  │                                              │    │
│  │  Email/Password    │  │  research-grants/     send-reminders/       │    │
│  │  Session Mgmt      │  │   │                    │                    │    │
│  │  JWT Tokens        │  │   ├─ Perplexity API    └─ SMTP Email        │    │
│  │  Admin RLS Check   │  │   │  (via OpenRouter)                       │    │
│  └──────────────────┘  │   ├─ Claude API                              │    │
│                          │   │  (via OpenRouter)                       │    │
│  ┌──────────────────┐  │   └─ Multi-step Gov                          │    │
│  │  PostgreSQL DB    │  │      Source Search                           │    │
│  │                    │  └──────────────────────────────────────────────┘    │
│  │  grants            │                                                     │
│  │  pending_changes   │  ┌──────────────────────────────────────────────┐    │
│  │  research_runs     │  │     Row Level Security (RLS)                 │    │
│  │  admin_users       │  │                                              │    │
│  │  contact_submissions│ │  Public: Read grants, Submit contacts/subs  │    │
│  │  email_subscriptions│ │  Admin:  Full CRUD on all tables            │    │
│  │  users              │ │  Users:  Own profile + applications only    │    │
│  │  applications      │  └──────────────────────────────────────────────┘    │
│  │  metrics            │                                                     │
│  └──────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   OpenRouter      │  │  Government       │  │  Vercel              │
│                    │  │  Websites         │  │  Environment Vars    │
│  Perplexity       │  │                    │  │                      │
│  sonar-deep-      │  │  *.gc.ca           │  │  SUPABASE_URL        │
│  research         │  │  *.gov.bc.ca       │  │  SUPABASE_ANON_KEY   │
│                    │  │  *.ontario.ca      │  └──────────────────────┘
│  Claude Sonnet    │  │  *.alberta.ca      │
│  4.5              │  │  (+ all provinces) │
└──────────────────┘  └──────────────────┘
```

### Data Flow: AI Grant Research Pipeline

```
Admin clicks "Run Research Now"
            │
            ▼
┌───────────────────────────┐
│  1. Supabase Edge Function │
│     research-grants        │
│     Creates research_run   │
│     Responds immediately   │
└─────────┬─────────────────┘
          │ (runs in background)
          ▼
┌───────────────────────────┐     ┌──────────────────────────┐
│  2. Multi-Step Perplexity  │────▶│  OpenRouter API           │
│     Deep Research          │◀────│  perplexity/sonar-deep-   │
│                            │     │  research                 │
│  5 category searches:      │     └──────────────────────────┘
│  ├─ Federal Indigenous     │
│  ├─ Energy & Environment   │
│  ├─ Housing & Infrastructure│
│  ├─ Economic Development   │
│  └─ Provincial Programs    │
└─────────┬─────────────────┘
          │ Combined results
          ▼
┌───────────────────────────┐     ┌──────────────────────────┐
│  3. Claude Sonnet 4.5      │────▶│  OpenRouter API           │
│     Comparison Engine      │◀────│  anthropic/claude-sonnet- │
│                            │     │  4-5-20250514             │
│  Compares Perplexity       │     └──────────────────────────┘
│  findings vs. existing DB  │
│  Outputs structured JSON:  │
│  ├─ New grants             │
│  ├─ Updated grants         │
│  └─ Deactivated grants     │
└─────────┬─────────────────┘
          │ Validated results (gov URLs only)
          ▼
┌───────────────────────────┐
│  4. Pending Changes Table  │
│     Stored for admin review│
│                            │
│  Admin approves/rejects    │
│  each change via dashboard │
│  ├─ Approve → applies to   │
│  │   grants table          │
│  └─ Reject → archived      │
└───────────────────────────┘
```

---

## Services & Infrastructure

| Service | Purpose | Details |
|---------|---------|---------|
| **Vercel** | Frontend hosting & CDN | Hosts the Next.js 16 app. Automatic deployments from GitHub. Handles SSL, edge caching, and serverless rendering. Project: `doug-yearwoods-projects/grant-portal` |
| **Supabase** | Backend-as-a-Service | PostgreSQL database, authentication, Row Level Security, Edge Functions, and REST API. Project ref: `bjjoiwnhqtizqryragco` (ca-central-1) |
| **Supabase Auth** | Authentication | Email/password sign-in with JWT tokens. Admin role determined by `admin_users` table lookup. Session persistence with auto-refresh. |
| **Supabase Edge Functions** | Serverless compute (Deno) | Two functions: `research-grants` (AI pipeline) and `send-reminders` (email notifications). Deployed to Supabase's Deno runtime. |
| **OpenRouter** | AI model gateway | Single API endpoint to access multiple AI models. Routes requests to Perplexity and Claude without needing separate API keys per provider. |
| **Perplexity Deep Research** | AI-powered web research | Model: `perplexity/sonar-deep-research` via OpenRouter. Searches live government websites to discover Indigenous grant programs. Runs as 5 category-specific searches for thoroughness. |
| **Claude Sonnet 4.5** | AI comparison & structuring | Model: `anthropic/claude-sonnet-4-5-20250514` via OpenRouter. Compares Perplexity's research against the existing grants database. Outputs structured JSON with new, updated, and deactivated grants. Validates all sources are government URLs. |
| **GitHub** | Source control | Repository: `BuildingAssetsAI/indegenous-grant-portal`. Branches: `main` (production), `dev` (staging). |
| **PostgreSQL** | Relational database | Hosted by Supabase. 10+ tables with RLS policies. Stores grants, applications, pending AI changes, contact submissions, email subscriptions, and admin users. |

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase project URL (public, used in browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Supabase anonymous key (public, used in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Functions | Service role key for bypassing RLS (server-side only) |
| `OPENROUTER_API_KEY` | Supabase Edge Function secrets | API key for OpenRouter (Perplexity + Claude access) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 3 |
| **State Management** | TanStack Query (React Query) v5 |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **AI Research** | Perplexity Deep Research + Claude Sonnet 4.5 via OpenRouter |
| **Hosting** | Vercel (frontend), Supabase (backend) |
| **Icons** | React Icons |

---

## Database Schema

```
┌──────────────────────┐     ┌──────────────────────────┐
│       grants          │     │   pending_grant_changes    │
├──────────────────────┤     ├──────────────────────────┤
│ id (UUID, PK)         │◀────│ existing_grant_id (FK)    │
│ title                 │     │ change_type (new/update/  │
│ description           │     │   deactivate)             │
│ agency                │     │ proposed_data (JSONB)     │
│ program               │     │ ai_confidence_score       │
│ category              │     │ ai_reasoning              │
│ eligibility           │     │ status (pending/approved/ │
│ application_link      │     │   rejected)               │
│ deadline              │     │ research_run_id (FK)      │
│ amount                │     └──────────────────────────┘
│ province              │
│ status                │     ┌──────────────────────────┐
│ source_url            │     │   grant_research_runs     │
└──────────┬───────────┘     ├──────────────────────────┤
           │                  │ id (UUID, PK)             │
           │                  │ status (running/completed/│
           │                  │   failed)                 │
┌──────────▼───────────┐     │ new_grants_found          │
│ user_grant_applications│     │ updates_found             │
├──────────────────────┤     │ raw_response (JSONB)      │
│ id (UUID, PK)         │     └──────────────────────────┘
│ user_id (FK → users)  │
│ grant_id (FK → grants)│     ┌──────────────────────────┐
│ application_status    │     │   contact_submissions     │
│ amount_requested      │     ├──────────────────────────┤
│ amount_approved       │     │ id, name, email, subject  │
│ notes                 │     │ message, status, admin_   │
└──────────┬───────────┘     │ notes                     │
           │                  └──────────────────────────┘
┌──────────▼───────────┐
│ reporting_requirements│     ┌──────────────────────────┐
├──────────────────────┤     │   email_subscriptions     │
│ id (UUID, PK)         │     ├──────────────────────────┤
│ application_id (FK)   │     │ id, email, name           │
│ requirement_type      │     │ subscription_type         │
│ due_date              │     │ categories[], provinces[] │
│ completed             │     │ unsubscribe_token         │
└──────────────────────┘     └──────────────────────────┘

┌──────────────────────┐     ┌──────────────────────────┐
│       users           │     │     admin_users            │
├──────────────────────┤     ├──────────────────────────┤
│ id (PK)               │     │ id (UUID, PK)             │
│ email                 │     │ email (unique)            │
│ first_name, last_name │     │ added_by                  │
└──────────────────────┘     └──────────────────────────┘
```

All tables use Row Level Security (RLS):
- **Public access**: Read grants, submit contact forms (via RPC), subscribe to emails (via RPC)
- **Authenticated users**: CRUD on own applications, profile, and reporting requirements
- **Admins**: Full access to grants, pending changes, contact messages, subscriptions

---

## Features

- **AI Grant Discovery**: Automated research using Perplexity Deep Research across 5 government source categories, validated by Claude Sonnet 4.5
- **Admin Approval Workflow**: AI-discovered grants go through admin review before publishing
- **Grant Database**: Browse active Indigenous grants with filtering by category, province, and deadline
- **Application Tracking**: Track applications through planning, submitted, approved stages
- **Contact Form**: Public "Request Support" form with RPC-based submission (bypasses RLS)
- **Email Subscriptions**: Subscribe to grant updates by category and province
- **Email Reminders**: Edge function for sending deadline reminders via SMTP
- **Analytics Dashboard**: Metrics on applications, approvals, and funding
- **Admin Dashboard**: Manage grants, review AI changes, view contact messages and subscriptions

---

## Project Structure

```
Indigenous-Grant-Tracker/
├── frontend-next/                # Next.js 16 application
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Landing page (public)
│   │   ├── admin/page.tsx        # Admin dashboard
│   │   ├── about/page.tsx        # About page
│   │   └── reset-password/       # Password reset
│   ├── components/               # React components
│   │   ├── Landing.tsx           # Main landing page layout
│   │   ├── AdminDashboard.tsx    # Admin panel with tabs
│   │   ├── AIResearchPanel.tsx   # AI research trigger & review
│   │   ├── GrantsList.tsx        # Public grants listing
│   │   ├── GrantCard.tsx         # Individual grant card
│   │   ├── ContactForm.tsx       # Contact/support form
│   │   ├── Dashboard.tsx         # User dashboard
│   │   ├── Metrics.tsx           # Analytics display
│   │   ├── Applications.tsx      # Application tracking
│   │   └── TrackedGrants.tsx     # User's tracked grants
│   ├── lib/                      # Service layer
│   │   ├── supabase.ts           # Supabase client init
│   │   ├── grantsService.ts      # Grant CRUD operations
│   │   ├── contactService.ts     # Contact form via RPC
│   │   ├── adminAuth.ts          # Admin role checking
│   │   ├── pendingChangesService.ts  # AI change review
│   │   ├── subscriptionService.ts    # Email subscriptions
│   │   ├── trackedGrants.ts      # User grant tracking
│   │   └── types.ts              # TypeScript interfaces
│   └── public/                   # Static assets
│       ├── greenbuffalo_logo.png
│       └── nrc_logo.png
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── research-grants/      # AI grant research pipeline
│   │   └── send-reminders/       # Email reminder sender
│   ├── migrations/               # Database migrations
│   │   ├── 20241021_initial_schema.sql
│   │   ├── 20241121_admin_role.sql
│   │   ├── 20241202_update_grants_schema.sql
│   │   ├── 20241209_grant_research_workflow.sql
│   │   ├── 20241210_contact_submissions.sql
│   │   ├── 20241210_email_subscriptions.sql
│   │   └── ...
│   └── *.sql                     # Standalone fix scripts
└── docs/
    └── architecture.drawio       # Editable architecture diagram
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))
- A Vercel account ([vercel.com](https://vercel.com))

### Local Development

```bash
# Clone
git clone git@github.com:BuildingAssetsAI/indegenous-grant-portal.git
cd Indigenous-Grant-Tracker/frontend-next

# Install
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Run
npm run dev
```

Visit: http://localhost:3000

### Deploy Edge Functions

```bash
# Login to Supabase CLI
npx supabase login

# Deploy research function
npx supabase functions deploy research-grants --project-ref bjjoiwnhqtizqryragco

# Set secrets
npx supabase secrets set OPENROUTER_API_KEY=your_key --project-ref bjjoiwnhqtizqryragco
```

### Database Migrations

```bash
# Link project
npx supabase link --project-ref bjjoiwnhqtizqryragco

# Push migrations
npx supabase db push
```

---

## Contributing

1. Fork the repository
2. Create a feature branch from `dev`
3. Commit your changes
4. Push to the branch
5. Open a Pull Request to `dev`

## License

ISC

## Support

For issues and questions:
1. Review [Supabase Documentation](https://supabase.com/docs)
2. Open an issue in this repository
