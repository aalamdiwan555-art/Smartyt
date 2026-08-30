# Smartyt - AI YouTube Creator Platform

Create smarter. Optimize better. Grow faster.

## Overview

Smartyt is a comprehensive AI-powered platform for YouTube creators. It helps you:
- Generate content ideas with AI
- Research keywords and SEO
- Create optimized titles and descriptions
- Design thumbnails
- Upload directly to YouTube
- Schedule content
- Track analytics
- Manage your entire creator workflow

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Route Handlers (API Routes)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Supabase Auth (Email + Google OAuth)
- **AI**: Anthropic Claude API
- **YouTube**: Official YouTube Data API v3
- **Storage**: Supabase Storage
- **Payments**: Stripe

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account
- Google Cloud Console project (for YouTube OAuth)
- Anthropic API key
- Stripe account (for billing)

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in all required values
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret |
| `YOUTUBE_API_KEY` | YouTube Data API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `TOKEN_ENCRYPTION_KEY` | Encryption key for tokens |
| `APP_BASE_URL` | Your app URL |

## Features

### Core Workflow
1. **IDEA** → AI-powered idea generation
2. **RESEARCH** → Keyword research and trend discovery
3. **SCRIPT** → AI script writing
4. **TITLE** → Title generation and analysis
5. **SEO** → SEO scoring and optimization
6. **THUMBNAIL** → Thumbnail studio with AI concepts
7. **UPLOAD** → Direct YouTube upload
8. **SCHEDULE** → Content calendar
9. **ANALYTICS** → Performance tracking
10. **IMPROVE** → AI-powered recommendations

### AI Tools
- Video idea generator
- Title generator and analyzer
- Description generator
- Script writer
- Hook generator
- Thumbnail concept generator
- SEO analyzer
- Keyword researcher

### Creator Features
- Multi-channel support
- Content calendar
- Video drafts and manager
- Publishing checklist
- Content DNA (personalization)
- Team collaboration (Pro/Team plans)

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/generate` | POST | Generate content with AI |
| `/api/seo/analyze` | POST | Analyze SEO score |
| `/api/keywords/research` | POST | Research keywords |
| `/api/youtube/connect` | GET | Initiate YouTube OAuth |
| `/api/youtube/oauth/callback` | GET | YouTube OAuth callback |
| `/api/youtube/upload` | POST | Upload video to YouTube |
| `/api/youtube/analytics` | GET | Fetch analytics |
| `/api/dashboard` | GET | Dashboard data |
| `/api/ideas` | GET/POST | Manage ideas |
| `/api/drafts` | GET/POST | Manage video drafts |
| `/api/calendar` | GET/POST | Content calendar |
| `/api/projects` | GET/POST | Projects |
| `/api/notifications` | GET/PATCH | Notifications |

## Database Schema

See `prisma/schema.prisma` for the complete database schema including:
- Users & Profiles
- YouTube Channels & OAuth Connections
- Content DNA
- Video Drafts & Uploads
- Ideas & Scripts
- Analytics Cache
- Subscriptions & Usage
- Teams & Members
- Notifications & Audit Logs

## Security

- Row Level Security (RLS) on all tables
- Server-side authentication
- Encrypted OAuth tokens
- Environment variables for secrets
- Input validation
- Rate limiting
- CSRF protection

## License

MIT License
