# Trace System

A 30-day self-awareness journaling platform. Users complete daily entries across four dimensions -- awareness, alignment, integrity, and reflection -- with structured checkpoints at days 7, 14, 21, and 30.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Routing:** React Router DOM
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone the repository
git clone https://github.com/erdemkemalbulut-creator/tracesystem.io.git
cd tracesystem.io

# Install dependencies
npm install

# Copy environment variables and fill in your Supabase credentials
cp .env.example .env.local

# Run database migrations via Supabase CLI (if using local Supabase)
# npx supabase db push

# Start the development server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  pages/              # Page components (26 pages)
    onboarding/       # 7-step onboarding flow
    articles/         # Educational content
  components/         # Shared components (Header, Footer, ProtectedRoute)
  contexts/           # AuthContext (user + profile state)
  lib/                # Supabase client and TypeScript interfaces
  utils/              # Helpers (localStorage, day calculation, questions)
  ui/                 # Custom icon components
  index.css           # Global styles
  App.tsx             # Router and provider setup
supabase/
  migrations/         # 12 SQL migration files
```

## User Flow

1. **Home** -- Marketing/landing page
2. **Auth** -- Login or sign up
3. **Onboarding** -- 7-step guided setup, initializes first season
4. **Daily Entry** -- Log awareness, alignment, integrity, and reflection (days 1-30)
5. **Checkpoints** -- Structured reflections at days 7, 14, 21, and 30
6. **Season Closure** -- End-of-season review, option to start a new season
7. **Settings** -- View past seasons and archived entries

## Deployment

This is a static SPA. Deploy to any static hosting provider:

- **Vercel:** `vercel --prod` (see `vercel.json` for SPA routing config)
- **Netlify:** Connect repo and set build command to `npm run build`, publish directory to `dist`

Make sure to set the environment variables in your hosting provider's dashboard.

## Database

The Supabase schema includes:

- **profiles** -- User profile with onboarding and checkpoint state
- **onboarding_data** -- Answers from the onboarding flow
- **seasons** -- 30-day season tracking per user
- **daily_entries** -- Daily journal entries (unique per user/season/day)
- **weekly_reflections** -- Weekly reflection entries

All tables use Row Level Security (RLS) to isolate user data.

## License

Private
