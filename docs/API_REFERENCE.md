# API Reference

Complete API documentation for Vibey.

## Base URL

All endpoints are relative to your deployment URL.

Development: `http://localhost:3000/api`

## Authentication

Currently, the API does not require authentication. All endpoints are open.

## Response Format

All responses are JSON. Successful responses return the requested data directly. Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Ideas

### List All Ideas
```
GET /api/ideas
```

Returns array of ideas with calculated metrics and recommendations.

**Response**:
```json
[
  {
    "id": "abc123",
    "name": "My Startup Idea",
    "description": "Description here",
    "status": "testing",
    "hypothesis": "Users will pay for X",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "metrics": {
      "painPointsCollected": 15,
      "competitorsTracked": 3,
      "waitlistSize": 47,
      "interviewsCompleted": 5,
      "contentPublished": 8,
      "landingPageViews": 234,
      "conversionRate": 20.1,
      "demandScore": 75
    },
    "recommendation": "continue"
  }
]
```

### Create Idea
```
POST /api/ideas
Content-Type: application/json

{
  "name": "My Startup Idea",
  "description": "Description here",
  "hypothesis": "Users will pay for X"
}
```

### Get Idea
```
GET /api/ideas/[id]
```

### Update Idea
```
PATCH /api/ideas/[id]
Content-Type: application/json

{
  "status": "validated",
  "description": "Updated description"
}
```

## Pain Points

### List Pain Points for Idea
```
GET /api/ideas/[id]/pain-points
```

### Create Pain Point
```
POST /api/ideas/[id]/pain-points
Content-Type: application/json

{
  "description": "Users complain about slow loading times",
  "sourceUrl": "https://reddit.com/r/...",
  "sourceType": "reddit",
  "frequency": 5,
  "intensity": "high"
}
```

### Update Pain Point
```
PATCH /api/pain-points/[id]
```

### Delete Pain Point
```
DELETE /api/pain-points/[id]
```

## Competitors

### List Competitors for Idea
```
GET /api/ideas/[id]/competitors
```

### Create Competitor
```
POST /api/ideas/[id]/competitors
Content-Type: application/json

{
  "name": "Competitor Co",
  "url": "https://competitor.com",
  "pricing": {
    "model": "subscription",
    "lowestTier": 9,
    "highestTier": 99
  },
  "strengths": ["Good UI", "Fast"],
  "weaknesses": ["Expensive", "No API"],
  "gaps": []
}
```

### Update Competitor
```
PATCH /api/competitors/[id]
```

### Delete Competitor
```
DELETE /api/competitors/[id]
```

## Landing Pages

### List Landing Pages for Idea
```
GET /api/ideas/[id]/landing-pages
```

### Create Landing Page
```
POST /api/ideas/[id]/landing-pages
Content-Type: application/json

{
  "slug": "my-product",
  "variant": "A",
  "content": {
    "headline": "Solve Your Problem Today",
    "subheadline": "The fastest way to X",
    "painPoints": ["Problem 1", "Problem 2"],
    "solution": "Our solution does Y",
    "cta": "Join Waitlist"
  },
  "design": {
    "template": "minimal",
    "primaryColor": "#3B82F6"
  }
}
```

### Update Landing Page
```
PATCH /api/landing-pages/[id]
Content-Type: application/json

{
  "status": "live"
}
```

### Delete Landing Page
```
DELETE /api/landing-pages/[id]
```

## Waitlist

### List Waitlist Entries for Idea
```
GET /api/ideas/[id]/waitlist
```

### Create Waitlist Entry
```
POST /api/ideas/[id]/waitlist
Content-Type: application/json

{
  "email": "user@example.com",
  "landingPageId": "lp123",
  "source": {
    "utmSource": "twitter",
    "utmMedium": "social"
  }
}
```

### Update Waitlist Entry
```
PATCH /api/waitlist/[id]
Content-Type: application/json

{
  "status": "converted"
}
```

## Interviews

### List Interviews for Idea
```
GET /api/ideas/[id]/interviews
```

### Create Interview
```
POST /api/ideas/[id]/interviews
Content-Type: application/json

{
  "contactEmail": "user@example.com",
  "contactName": "John Doe",
  "scheduledAt": "2024-01-20T14:00:00Z"
}
```

### Update Interview
```
PATCH /api/interviews/[id]
Content-Type: application/json

{
  "status": "completed",
  "notes": "Great conversation about pain points",
  "insights": [
    {
      "id": "ins1",
      "type": "pain-point",
      "quote": "I spend 2 hours daily on this",
      "interpretation": "Significant time sink"
    }
  ]
}
```

## Content

### List Content for Idea
```
GET /api/ideas/[id]/content
```

### Create Content
```
POST /api/ideas/[id]/content
Content-Type: application/json

{
  "type": "twitter-thread",
  "body": "Thread content here...",
  "status": "draft"
}
```

### Update Content
```
PATCH /api/content/[id]
Content-Type: application/json

{
  "status": "published",
  "publishedAt": "2024-01-15T10:00:00Z"
}
```

## Analytics

### Track Page Event
```
POST /api/track
Content-Type: application/json

{
  "landingPageId": "lp123",
  "eventType": "view",
  "visitorId": "visitor-uuid",
  "utmSource": "twitter",
  "referrer": "https://twitter.com"
}
```

Event types: `view`, `cta_click`, `signup`

---

## Twitter API

### Account

#### Get Account
```
GET /api/twitter/account
```

#### Update Account
```
PUT /api/twitter/account
Content-Type: application/json

{
  "handle": "myhandle",
  "followers": 1234,
  "isPremium": true
}
```

### Relationships

#### List Relationships
```
GET /api/twitter/relationships
```

Query parameters:
- `tier`: Filter by tier (whale/peer/fan)

#### Create Relationship
```
POST /api/twitter/relationships
Content-Type: application/json

{
  "handle": "username",
  "displayName": "Display Name",
  "tier": "whale",
  "niche": ["saas", "ai"],
  "followsYou": false,
  "youFollow": true,
  "priority": "high",
  "notes": "Great content about AI"
}
```

#### Get Relationship
```
GET /api/twitter/relationships/[id]
```

Returns relationship with interaction history.

#### Update Relationship
```
PATCH /api/twitter/relationships/[id]
Content-Type: application/json

{
  "tier": "peer",
  "priority": "medium"
}
```

#### Delete Relationship
```
DELETE /api/twitter/relationships/[id]
```

### Interactions

#### Log Interaction
```
POST /api/twitter/interactions
Content-Type: application/json

{
  "relationshipId": "rel123",
  "type": "reply",
  "direction": "sent",
  "tweetId": "tweet123",
  "content": "Great thread!"
}
```

Interaction types: `reply`, `like`, `retweet`, `quote`, `dm`, `mention`
Directions: `sent`, `received`

### Tweets

#### List Tweets
```
GET /api/twitter/tweets
```

Query parameters:
- `status`: Filter by status (draft/scheduled/published)
- `ideaId`: Filter by linked idea

#### Create Tweet
```
POST /api/twitter/tweets
Content-Type: application/json

{
  "type": "single",
  "content": "Tweet content here",
  "ideaId": "idea123",
  "status": "draft"
}
```

#### Get Tweet
```
GET /api/twitter/tweets/[id]
```

#### Update Tweet
```
PATCH /api/twitter/tweets/[id]
Content-Type: application/json

{
  "status": "scheduled",
  "scheduledFor": "2024-01-20T14:00:00Z"
}
```

#### Delete Tweet
```
DELETE /api/twitter/tweets/[id]
```

### Tweet Metrics

#### Get Tweet Metrics
```
GET /api/twitter/tweets/[id]/metrics
```

#### Add Metrics Snapshot
```
POST /api/twitter/tweets/[id]/metrics
Content-Type: application/json

{
  "impressions": 1500,
  "engagements": 75,
  "likes": 45,
  "retweets": 12,
  "replies": 8,
  "quotes": 3,
  "profileVisits": 25,
  "linkClicks": 10,
  "followersDelta": 5,
  "engagementRate": 5.0
}
```

### Engagement Queue

#### List Engagements
```
GET /api/twitter/engagement
```

Query parameters:
- `status`: Filter by status (pending/completed/skipped)

#### Create Engagement Target
```
POST /api/twitter/engagement
Content-Type: application/json

{
  "relationshipId": "rel123",
  "targetTweetId": "tweet456",
  "targetTweetContent": "Their tweet content",
  "suggestedReply": "Suggested reply text",
  "replyType": "value-add",
  "priority": "high"
}
```

#### Complete Engagement
```
PATCH /api/twitter/engagement/[id]?action=complete
```

#### Skip Engagement
```
PATCH /api/twitter/engagement/[id]?action=skip
```

#### Delete Engagement
```
DELETE /api/twitter/engagement/[id]
```

### Milestones

#### List Milestones
```
GET /api/twitter/milestones
```

Query parameters:
- `ideaId`: Filter by idea
- `status`: Filter by status

#### Create Milestone
```
POST /api/twitter/milestones
Content-Type: application/json

{
  "ideaId": "idea123",
  "type": "mrr",
  "threshold": 1000,
  "template": "Just hit ${{threshold}} MRR! Here's what I learned..."
}
```

#### Update Milestone
```
PATCH /api/twitter/milestones/[id]
Content-Type: application/json

{
  "currentValue": 1000,
  "generatedContent": "Just hit $1000 MRR!"
}
```

#### Approve Milestone
```
PATCH /api/twitter/milestones/[id]?action=approve
```

#### Mark as Posted
```
PATCH /api/twitter/milestones/[id]?action=posted
```

### Twitter Metrics

#### Get Analytics
```
GET /api/twitter/metrics
```

Returns aggregated Twitter analytics.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Something went wrong |

## Rate Limiting

Currently no rate limiting is enforced. For production deployments, implement appropriate rate limiting.
