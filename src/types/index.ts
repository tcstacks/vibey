// Core Types for Validation Stack

export type IdeaStatus = 'researching' | 'testing' | 'validating' | 'validated' | 'killed';
export type LandingPageStatus = 'draft' | 'live' | 'paused';
export type LandingPageTemplate = 'minimal' | 'feature-list' | 'problem-agitate-solve';
export type WaitlistStatus = 'active' | 'converted' | 'unsubscribed';
export type InterviewStatus = 'scheduled' | 'completed' | 'no-show' | 'cancelled';
export type ContentType = 'twitter-thread' | 'linkedin-post' | 'blog-post' | 'newsletter';
export type ContentStatus = 'draft' | 'scheduled' | 'published';
export type SentimentType = 'pain' | 'wish' | 'question' | 'neutral';
export type IntensityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InsightType = 'pain-point' | 'objection' | 'feature-request' | 'willingness-to-pay';
export type PricingModel = 'subscription' | 'one-time' | 'usage' | 'freemium';
export type CommunitySource = 'reddit' | 'hackernews' | 'twitter' | 'indiehackers';

// Idea - Top level container
export interface Idea {
  id: string;
  name: string;
  description: string;
  status: IdeaStatus;
  hypothesis: string;
  createdAt: string;
  updatedAt: string;
}

// Pain Point - Research findings
export interface PainPoint {
  id: string;
  ideaId: string;
  description: string;
  sourceUrl?: string;
  sourceType: string;
  frequency: number;
  intensity: IntensityLevel;
  createdAt: string;
}

// Landing Page
export interface LandingPageContent {
  headline: string;
  subheadline: string;
  painPoints: string[];
  solution: string;
  cta: string;
  socialProof?: string;
}

export interface LandingPageDesign {
  template: LandingPageTemplate;
  primaryColor: string;
  logoUrl?: string;
}

export interface LandingPage {
  id: string;
  ideaId: string;
  slug: string;
  status: LandingPageStatus;
  variant: string;
  content: LandingPageContent;
  design: LandingPageDesign;
  createdAt: string;
  updatedAt: string;
}

// Page Events for Analytics
export interface PageEvent {
  id: string;
  landingPageId: string;
  eventType: 'view' | 'cta_click' | 'signup';
  visitorId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  createdAt: string;
}

// Waitlist Entry
export interface WaitlistEntry {
  id: string;
  ideaId: string;
  landingPageId: string;
  email: string;
  source: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
  };
  segments: string[];
  surveyResponses?: Array<{
    questionId: string;
    response: string;
  }>;
  engagementScore: number;
  status: WaitlistStatus;
  signedUpAt: string;
  lastEngagedAt: string;
}

// Interview
export interface InterviewInsight {
  id: string;
  type: InsightType;
  quote: string;
  interpretation: string;
}

export interface Interview {
  id: string;
  ideaId: string;
  contactEmail?: string;
  contactName?: string;
  scheduledAt?: string;
  completedAt?: string;
  status: InterviewStatus;
  notes: string;
  insights: InterviewInsight[];
  createdAt: string;
}

// Competitor
export interface CompetitorPricing {
  model: PricingModel;
  lowestTier: number;
  highestTier: number;
}

export interface CompetitorGap {
  id: string;
  gap: string;
  source: string;
  frequency: number;
  opportunityScore: number;
}

export interface Competitor {
  id: string;
  ideaId: string;
  name: string;
  url: string;
  pricing?: CompetitorPricing;
  strengths: string[];
  weaknesses: string[];
  gaps: CompetitorGap[];
  updatedAt: string;
}

// Content
export interface ContentDerivedFrom {
  painPoints: string[];
  interviewInsights: string[];
  landingPageCopy: string[];
}

export interface ContentPerformance {
  views: number;
  engagement: number;
  clicks: number;
  conversions: number;
}

export interface Content {
  id: string;
  ideaId: string;
  type: ContentType;
  status: ContentStatus;
  body: string;
  derivedFrom?: ContentDerivedFrom;
  scheduledFor?: string;
  publishedAt?: string;
  performance?: ContentPerformance;
  createdAt: string;
}

// Community Scanner
export interface CommunitySourceConfig {
  id: string;
  type: CommunitySource;
  config: {
    subreddits?: string[];
    keywords?: string[];
    minEngagement?: number;
  };
  lastScanned?: string;
}

export interface ScannedPost {
  id: string;
  sourceId: string;
  url: string;
  title: string;
  body: string;
  author: string;
  engagement: {
    upvotes: number;
    comments: number;
  };
  sentiment: SentimentType;
  relevanceScore: number;
  extractedPainPoints: string[];
  savedToIdea?: string;
  scannedAt: string;
}

// Analytics Dashboard
export interface IdeaMetrics {
  painPointsCollected: number;
  competitorsTracked: number;
  demandScore: number;
  landingPageViews: number;
  conversionRate: number;
  waitlistSize: number;
  interviewsCompleted: number;
  preOrderRevenue: number;
  contentPublished: number;
  totalReach: number;
  engagementRate: number;
  attributedSignups: number;
}

export interface IdeaDashboard {
  ideaId: string;
  research: {
    painPointsCollected: number;
    competitorsTracked: number;
    demandScore: number;
  };
  testing: {
    landingPageViews: number;
    conversionRate: number;
    waitlistSize: number;
    interviewsCompleted: number;
    preOrderRevenue: number;
  };
  traction: {
    contentPublished: number;
    totalReach: number;
    engagementRate: number;
    attributedSignups: number;
  };
  overallScore: number;
  recommendation: 'kill' | 'pivot' | 'continue' | 'accelerate';
}

// Demand Signal
export interface DemandSignal {
  id: string;
  ideaId: string;
  type: 'search_volume' | 'trend' | 'market_size' | 'growth_rate';
  metric: string;
  value: number;
  source: string;
  collectedAt: string;
}

// Survey
export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'scale' | 'open';
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  ideaId: string;
  type: 'embedded' | 'standalone' | 'post-signup';
  questions: SurveyQuestion[];
  responses: number;
  completionRate: number;
}

// Email Templates
export interface WaitlistEmail {
  id: string;
  ideaId: string;
  type: 'welcome' | 'update' | 'launch' | 'survey';
  subject: string;
  body: string;
  sendAfterDays: number;
  sentCount: number;
  openRate: number;
  replyCount: number;
}

// ============================================
// Twitter/X Growth Engine Types
// ============================================

export type TwitterAccountStage = '0-1k' | '1k-10k' | '10k+';
export type TwitterHealthStatus = 'healthy' | 'warning' | 'restricted';
export type TwitterRelationshipTier = 'whale' | 'peer' | 'fan';
export type TwitterInteractionType = 'reply' | 'like' | 'retweet' | 'quote' | 'dm' | 'mention';
export type TwitterInteractionDirection = 'sent' | 'received';
export type TweetType = 'single' | 'thread' | 'reply';
export type TweetStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type ThreadStructure = 'listicle' | 'story' | 'how-to' | 'contrarian' | 'case-study';
export type ReplyType = 'value-add' | 'question' | 'personal-experience' | 'contrarian';
export type EngagementStatus = 'pending' | 'completed' | 'skipped';
export type MilestoneType = 'mrr' | 'users' | 'followers' | 'launch' | 'custom';
export type MilestoneStatus = 'pending-approval' | 'scheduled' | 'published';
export type Priority = 'high' | 'medium' | 'low';

// Twitter Account
export interface TwitterAccountLimits {
  dailyTweets: { used: number; max: number };
  dailyFollows: { used: number; max: number };
  dailyDMs: { used: number; max: number };
  dailyLikes: { used: number; max: number };
}

export interface TwitterAccount {
  id: string;
  handle: string;
  followers: number;
  following: number;
  isPremium: boolean;
  stage: TwitterAccountStage;
  healthStatus: TwitterHealthStatus;
  dailyLimits: TwitterAccountLimits;
  followerVelocity?: number;
  engagementRate?: number;
  avgImpressions?: number;
  warnings: string[];
  updatedAt: string;
}

// Twitter Relationship CRM
export interface TwitterInteraction {
  id: string;
  relationshipId: string;
  type: TwitterInteractionType;
  direction: TwitterInteractionDirection;
  tweetId?: string;
  content?: string;
  createdAt: string;
}

export interface TwitterRelationship {
  id: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  tier: TwitterRelationshipTier;
  niche: string[];
  followsYou: boolean;
  youFollow: boolean;
  mutualFollowDate?: string;
  priority: Priority;
  notes?: string;
  tags: string[];
  lastInteraction?: string;
  reciprocityScore: number;
  totalReplies: number;
  totalLikes: number;
  totalDMs: number;
  createdAt: string;
  updatedAt: string;
}

// Tweets
export interface TweetDerivedFrom {
  painPoints?: string[];
  interviewQuotes?: string[];
  competitorGaps?: string[];
}

export interface TweetMetrics {
  id: string;
  tweetId: string;
  impressions: number;
  engagements: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  profileVisits: number;
  linkClicks: number;
  followersDelta: number;
  engagementRate: number;
  collectedAt: string;
}

export interface Tweet {
  id: string;
  ideaId?: string;
  type: TweetType;
  content: string;
  mediaUrls?: string[];
  threadId?: string;
  threadPosition?: number;
  derivedFrom?: TweetDerivedFrom;
  status: TweetStatus;
  scheduledFor?: string;
  publishedAt?: string;
  platformId?: string;
  metrics?: TweetMetrics;
  createdAt: string;
}

export interface Thread {
  id: string;
  ideaId?: string;
  hook: string;
  hookVariants: string[];
  tweets: Tweet[];
  structure: ThreadStructure;
  cta: {
    type: 'follow' | 'newsletter' | 'landing-page' | 'reply';
    text: string;
    url?: string;
  };
  performance?: {
    totalImpressions: number;
    totalEngagements: number;
    threadCompletionRate: number;
    ctaConversions: number;
  };
  createdAt: string;
}

// Engagement Queue
export interface EngagementTarget {
  id: string;
  relationshipId: string;
  relationship?: TwitterRelationship;
  targetTweetId?: string;
  targetTweetContent?: string;
  targetTweetPostedAt?: string;
  suggestedReply?: string;
  replyType: ReplyType;
  priority: Priority;
  status: EngagementStatus;
  dueBy?: string;
  completedAt?: string;
  createdAt: string;
}

// Build in Public Milestones
export interface BIPMilestone {
  id: string;
  ideaId: string;
  type: MilestoneType;
  threshold?: number;
  currentValue: number;
  previousValue: number;
  template: string;
  generatedContent?: string;
  status: MilestoneStatus;
  triggeredAt?: string;
  postedAt?: string;
  createdAt: string;
}

// Twitter Analytics
export interface TwitterGrowthMetrics {
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  followersStart: number;
  followersEnd: number;
  netGain: number;
  velocity: number;
  projectedMonthly: number;
}

export interface TwitterContentMetrics {
  tweetsPublished: number;
  threadsPublished: number;
  avgImpressions: number;
  avgEngagementRate: number;
  topTweetId?: string;
  worstTweetId?: string;
}

export interface TwitterEngagementMetrics {
  repliesSent: number;
  profileVisitsFromReplies: number;
  followersFromReplies: number;
  replyROI: number;
}

export interface TwitterConversionMetrics {
  landingPageClicks: number;
  waitlistSignups: number;
  conversionRate: number;
  topConvertingTweetId?: string;
}

export interface TwitterAnalytics {
  accountId: string;
  period: 'day' | 'week' | 'month';
  growth: TwitterGrowthMetrics;
  content: TwitterContentMetrics;
  engagement: TwitterEngagementMetrics;
  conversion: TwitterConversionMetrics;
  patterns: {
    bestPostingTimes: { hour: number; engagementRate: number }[];
    bestContentTypes: { type: string; avgEngagement: number }[];
    topHashtags: { tag: string; impressions: number }[];
  };
}
