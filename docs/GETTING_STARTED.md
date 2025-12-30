# Getting Started with Vibey

This guide walks you through validating your first startup idea using Vibey.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

```bash
git clone <repository-url>
cd vibey
npm install
npm run dev
```

## Your First Idea Validation

### Step 1: Create an Idea

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"New Idea"** on the dashboard
3. Fill in the details:
   - **Name**: A short, memorable name
   - **Description**: What problem does this solve?
   - **Hypothesis**: Your testable assumption (e.g., "Developers will pay $19/mo for automated code reviews")

### Step 2: Research Phase

Before building anything, gather evidence of demand.

#### Collect Pain Points
1. Go to your idea's detail page
2. Navigate to the **Research** tab
3. Add pain points from:
   - Reddit discussions
   - Twitter complaints
   - Product Hunt comments
   - Customer interviews

For each pain point, record:
- The verbatim quote or observation
- Source URL
- Frequency (how often you see this)
- Intensity (low/medium/high/critical)

#### Analyze Competitors
1. Add competitors in the **Competitors** tab
2. Document:
   - Pricing model and tiers
   - Strengths and weaknesses
   - Gaps in their offering

**Tip**: Focus on gaps - these are your opportunities.

### Step 3: Testing Phase

Create a landing page to capture demand signals.

#### Create a Landing Page
1. Go to the **Landing Pages** tab
2. Click **"Create Landing Page"**
3. Choose a template:
   - **Minimal**: Quick test with headline + email capture
   - **Feature List**: Show what you'll build
   - **Problem-Agitate-Solve**: Story-driven conversion

#### Customize Content
Fill in:
- **Headline**: Your main value proposition
- **Subheadline**: Supporting detail
- **Pain Points**: 3-5 problems you solve
- **Solution**: How you solve them
- **CTA**: Call to action text

#### Publish and Share
1. Set status to "Live"
2. Share the `/v/[slug]` URL
3. Track views and signups in the dashboard

### Step 4: Interview Signups

The most valuable validation comes from conversations.

1. Go to the **Interviews** tab
2. Schedule calls with engaged signups
3. During interviews, capture:
   - Pain points they mention
   - Objections to your solution
   - Feature requests
   - Willingness to pay

### Step 5: Analyze Results

Your idea's dashboard shows:
- **Demand Score**: Calculated from pain point frequency and intensity
- **Conversion Rate**: Signup rate from landing page views
- **Recommendation**: Kill, Pivot, Continue, or Accelerate

#### Interpretation Guide

| Signal | Meaning |
|--------|---------|
| High pain intensity + High frequency | Strong demand |
| Low conversion + High traffic | Messaging problem |
| High interviews completed | Engaged audience |
| Multiple competitor gaps | Differentiation opportunity |

### Step 6: Decide Next Steps

Based on your validation score:

- **Kill**: < 2% conversion, no pain point resonance
- **Pivot**: Some signals but wrong positioning
- **Continue**: 2-5% conversion, positive interview feedback
- **Accelerate**: > 5% conversion, willingness to pay confirmed

## Tips for Success

### Pain Points
- Collect at least 20 pain points before testing
- Focus on frequency and intensity, not just count
- Look for patterns across sources

### Landing Pages
- Test multiple headlines (A/B variants)
- Keep forms short (email only initially)
- Include social proof if you have it

### Interviews
- Ask "why" 5 times to get to root causes
- Never pitch - just listen
- Ask about current solutions and spending

### Metrics
- 100+ landing page views for statistical significance
- 5+ interviews for qualitative validation
- 50+ waitlist signups before building

## Next Steps

Once you've validated demand:
1. Use the **Traction Engine** to build audience
2. Use the **Twitter Growth Engine** to accelerate
3. Start building your MVP

See the module-specific guides for detailed workflows:
- [Research Engine Guide](./RESEARCH_ENGINE.md)
- [Testing Engine Guide](./TESTING_ENGINE.md)
- [Traction Engine Guide](./TRACTION_ENGINE.md)
- [Twitter Growth Guide](./TWITTER_ENGINE.md)
