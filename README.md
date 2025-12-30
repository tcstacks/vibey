# Vibey - Personal Validation Stack

A comprehensive platform for indie hackers and solopreneurs to rapidly validate startup ideas using a data-driven approach. Built with Next.js 16, TypeScript, and SQLite.

## Overview

Vibey provides a structured workflow for idea validation through four integrated modules:

1. **Research Engine** - Discover and quantify customer pain points
2. **Testing Engine** - Build landing pages and capture demand signals
3. **Traction Engine** - Create content and nurture your waitlist
4. **Twitter/X Growth Engine** - Build audience and accelerate validation

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Core Concepts

### Ideas
Ideas are the top-level container for all validation activities. Each idea progresses through statuses:
- `researching` - Gathering pain points and competitor intel
- `testing` - Running landing page experiments
- `validating` - Conducting interviews and analyzing signals
- `validated` - Strong demand signals confirmed
- `killed` - Insufficient evidence of demand

### Validation Score
Each idea receives a recommendation based on collected data:
- **Kill** - No evidence of demand, move on
- **Pivot** - Some signal but needs repositioning
- **Continue** - Promising signals, keep testing
- **Accelerate** - Strong validation, start building

## Module 1: Research Engine

Discover and quantify customer pain points before building.

### Features
- **Pain Point Tracker** - Collect and categorize customer problems
- **Competitor Analysis** - Track competitors, pricing, and gaps
- **Demand Signals** - Monitor search trends and market size

### Usage
1. Create a new idea from the dashboard
2. Add pain points discovered from customer research
3. Add competitors to understand the landscape
4. Track demand signals (search volume, trends)

### API Endpoints
```
GET/POST   /api/ideas                    - List/create ideas
GET/PATCH  /api/ideas/[id]               - Get/update idea
GET/POST   /api/ideas/[id]/pain-points   - Pain points for idea
GET/POST   /api/ideas/[id]/competitors   - Competitors for idea
```

## Module 2: Testing Engine

Convert research into testable experiments.

### Features
- **Landing Page Builder** - Create validation pages with templates
- **Waitlist Management** - Capture and segment signups
- **Interview Tracking** - Schedule and log customer interviews
- **Analytics** - Track views, conversions, and engagement

### Templates
- `minimal` - Simple headline + email capture
- `feature-list` - Problem + feature bullets + CTA
- `problem-agitate-solve` - Story-driven conversion page

### Usage
1. Create a landing page for your idea
2. Choose a template and customize content
3. Publish and share to collect waitlist signups
4. Track conversion rates in the dashboard
5. Schedule interviews with engaged signups

### API Endpoints
```
GET/POST   /api/ideas/[id]/landing-pages - Landing pages for idea
GET/PATCH  /api/landing-pages/[id]       - Manage landing page
GET/POST   /api/ideas/[id]/waitlist      - Waitlist entries
GET/POST   /api/ideas/[id]/interviews    - Interview sessions
POST       /api/track                    - Track page events
```

### Public Pages
```
GET        /v/[slug]                     - Public landing page
```

## Module 3: Traction Engine

Build momentum with content and nurturing.

### Features
- **Content Studio** - Create platform-specific content
- **Performance Tracking** - Monitor reach and engagement
- **Email Sequences** - Nurture waitlist subscribers

### Content Types
- Twitter threads
- LinkedIn posts
- Blog posts
- Newsletter issues

### Usage
1. Create content derived from your research
2. Schedule or publish immediately
3. Track performance metrics
4. Attribute signups to content pieces

### API Endpoints
```
GET/POST   /api/ideas/[id]/content       - Content for idea
GET/PATCH  /api/content/[id]             - Manage content
```

## Module 4: Twitter/X Growth Engine

Build your audience and accelerate validation through Twitter.

### Features
- **Account Health Monitor** - Track limits, restrictions, and growth
- **Relationship CRM** - Manage connections with tiers (whale/peer/fan)
- **Content Studio** - Compose tweets and threads
- **Engagement Queue** - Systematic reply workflow
- **Build-in-Public Automation** - Auto-generate milestone tweets
- **Analytics** - Track growth, content performance, and conversions

### Relationship Tiers
- **Whale** - High-follower accounts in your niche (10k+)
- **Peer** - Similar stage creators to collaborate with
- **Fan** - Engaged followers to nurture

### Engagement Workflow
1. Add relationships to track
2. System queues engagement opportunities
3. Work through queue with suggested replies
4. Track reciprocity and relationship health

### Tweet Types
- `single` - Standalone tweet
- `thread` - Multi-tweet narrative
- `reply` - Response to another tweet

### Usage
1. Set up your Twitter account in settings
2. Add relationships to your CRM
3. Use the composer to draft and schedule content
4. Work through engagement queue daily
5. Track growth and optimize posting times

### API Endpoints
```
GET/PUT    /api/twitter/account           - Account settings
GET/POST   /api/twitter/relationships     - Relationship CRM
GET/PATCH  /api/twitter/relationships/[id] - Manage relationship
GET/POST   /api/twitter/tweets            - Tweet management
GET/PATCH  /api/twitter/tweets/[id]       - Manage tweet
GET/POST   /api/twitter/tweets/[id]/metrics - Tweet metrics
GET/POST   /api/twitter/engagement        - Engagement queue
PATCH      /api/twitter/engagement/[id]   - Complete/skip engagement
POST       /api/twitter/interactions      - Log interactions
GET        /api/twitter/metrics           - Analytics data
GET/POST   /api/twitter/milestones        - BIP milestones
PATCH      /api/twitter/milestones/[id]   - Manage milestone
```

## Dashboard

The main dashboard provides:
- Overview of all active ideas
- Aggregate metrics (total waitlist, conversion rates)
- Quick actions to create new ideas
- Status-based filtering and recommendations

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: SQLite via better-sqlite3
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom shadcn-style components
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Main app pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── ideas/            # Idea management
│   │   └── twitter/          # Twitter module
│   ├── api/                  # API routes
│   │   ├── ideas/            # Idea endpoints
│   │   └── twitter/          # Twitter endpoints
│   └── v/[slug]/             # Public landing pages
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── db.ts                 # Database operations
│   └── utils.ts              # Utility functions
└── types/
    └── index.ts              # TypeScript definitions
```

## Database Schema

The application uses SQLite with tables for:
- `ideas` - Core idea data
- `pain_points` - Research findings
- `competitors` - Competitive analysis
- `landing_pages` - Validation pages
- `page_events` - Analytics tracking
- `waitlist_entries` - Email signups
- `interviews` - Customer interviews
- `content` - Published content
- `twitter_account` - Twitter settings
- `twitter_relationships` - CRM contacts
- `twitter_interactions` - Interaction log
- `tweets` - Tweet content
- `tweet_metrics` - Performance data
- `engagement_queue` - Reply queue
- `bip_milestones` - Build-in-public posts

## Environment Variables

No environment variables are required for basic operation. The SQLite database is created automatically.

For production deployments:
```env
NODE_ENV=production
```

## Development

```bash
# Run with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build
npm run build
```

## License

MIT

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.
