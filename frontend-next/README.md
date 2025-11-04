# Green Buffalo Indigenous Grant Portal

A Next.js application for discovering, tracking, and managing Indigenous grant opportunities across Canada.

## Features

- **Public Grant Discovery**: Browse and search grant opportunities without logging in
- **User Authentication**: Secure authentication with Supabase (email/password and OAuth)
- **Application Tracking**: Track your grant applications and their status
- **Analytics Dashboard**: View metrics and insights about your grant applications
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository
2. Navigate to the frontend-next directory:
   ```bash
   cd frontend-next
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend-next/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (routing between Landing/Dashboard)
│   └── globals.css         # Global styles
├── components/
│   ├── Applications.tsx    # User's grant applications list
│   ├── Dashboard.tsx       # Authenticated user dashboard
│   ├── GrantCard.tsx       # Individual grant card component
│   ├── GrantsList.tsx      # Searchable/filterable grants list
│   ├── Landing.tsx         # Public landing page
│   ├── Metrics.tsx         # Analytics dashboard
│   └── Providers.tsx       # React Query provider
├── hooks/
│   └── useAuth.ts          # Authentication hook
├── lib/
│   ├── mockData.ts         # Mock data for development
│   └── supabase.ts         # Supabase client configuration
└── public/
    └── greenbuffalo_logo.png  # Green Buffalo logo
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Features in Detail

### Landing Page
- Browse all available grants without authentication
- Search and filter grants by category
- Sort grants by various criteria
- View detailed grant information
- Sign up or sign in to track applications

### Dashboard (Authenticated)
- **My Applications**: Track all your grant applications with status updates
- **Metrics**: View analytics about your applications including success rates and funding amounts

## Brand

**Green Buffalo Indigenous Grant Portal** is dedicated to empowering Indigenous communities across Canada by simplifying access to funding opportunities.

## License

ISC
