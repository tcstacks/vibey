import Database from "better-sqlite3";
import path from "path";
import { generateId } from "./utils";
import type {
  Idea,
  PainPoint,
  LandingPage,
  PageEvent,
  WaitlistEntry,
  Interview,
  Competitor,
  Content,
  IdeaStatus,
  LandingPageStatus,
  WaitlistStatus,
  InterviewStatus,
  ContentStatus,
  TwitterAccount,
  TwitterRelationship,
  TwitterInteraction,
  Tweet,
  TweetMetrics,
  EngagementTarget,
  BIPMilestone,
  TwitterAccountStage,
  TwitterHealthStatus,
  TwitterRelationshipTier,
  TweetType,
  TweetStatus,
  Priority,
  EngagementStatus,
  MilestoneStatus,
} from "@/types";

// Database singleton
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "validation-stack.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database) {
  database.exec(`
    -- Ideas table
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'researching',
      hypothesis TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Pain points table
    CREATE TABLE IF NOT EXISTS pain_points (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      source_url TEXT,
      source_type TEXT,
      frequency INTEGER DEFAULT 1,
      intensity TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Landing pages table
    CREATE TABLE IF NOT EXISTS landing_pages (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      slug TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'draft',
      variant TEXT DEFAULT 'control',
      content TEXT NOT NULL,
      design TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Page events table
    CREATE TABLE IF NOT EXISTS page_events (
      id TEXT PRIMARY KEY,
      landing_page_id TEXT REFERENCES landing_pages(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      visitor_id TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referrer TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Waitlist entries table
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      landing_page_id TEXT REFERENCES landing_pages(id),
      email TEXT NOT NULL,
      source TEXT,
      segments TEXT,
      survey_responses TEXT,
      engagement_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      signed_up_at TEXT DEFAULT (datetime('now')),
      last_engaged_at TEXT DEFAULT (datetime('now'))
    );

    -- Interviews table
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      contact_email TEXT,
      contact_name TEXT,
      scheduled_at TEXT,
      completed_at TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      insights TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Competitors table
    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT,
      pricing TEXT,
      strengths TEXT,
      weaknesses TEXT,
      gaps TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Content table
    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      body TEXT NOT NULL,
      derived_from TEXT,
      scheduled_for TEXT,
      published_at TEXT,
      performance TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Twitter account tracking
    CREATE TABLE IF NOT EXISTS twitter_account (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL,
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      stage TEXT DEFAULT '0-1k',
      health_status TEXT DEFAULT 'healthy',
      daily_limits TEXT,
      follower_velocity REAL,
      engagement_rate REAL,
      avg_impressions REAL,
      warnings TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Twitter relationship CRM
    CREATE TABLE IF NOT EXISTS twitter_relationships (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      tier TEXT DEFAULT 'peer',
      niche TEXT,
      follows_you INTEGER DEFAULT 0,
      you_follow INTEGER DEFAULT 0,
      mutual_follow_date TEXT,
      priority TEXT DEFAULT 'medium',
      notes TEXT,
      tags TEXT,
      last_interaction TEXT,
      reciprocity_score REAL DEFAULT 0,
      total_replies INTEGER DEFAULT 0,
      total_likes INTEGER DEFAULT 0,
      total_dms INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Twitter interaction history
    CREATE TABLE IF NOT EXISTS twitter_interactions (
      id TEXT PRIMARY KEY,
      relationship_id TEXT REFERENCES twitter_relationships(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      direction TEXT NOT NULL,
      tweet_id TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tweets and threads
    CREATE TABLE IF NOT EXISTS tweets (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      media_urls TEXT,
      thread_id TEXT,
      thread_position INTEGER,
      derived_from TEXT,
      status TEXT DEFAULT 'draft',
      scheduled_for TEXT,
      published_at TEXT,
      platform_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tweet performance metrics
    CREATE TABLE IF NOT EXISTS tweet_metrics (
      id TEXT PRIMARY KEY,
      tweet_id TEXT REFERENCES tweets(id) ON DELETE CASCADE,
      impressions INTEGER DEFAULT 0,
      engagements INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      retweets INTEGER DEFAULT 0,
      replies INTEGER DEFAULT 0,
      quotes INTEGER DEFAULT 0,
      profile_visits INTEGER DEFAULT 0,
      link_clicks INTEGER DEFAULT 0,
      followers_delta INTEGER DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      collected_at TEXT DEFAULT (datetime('now'))
    );

    -- Engagement queue for reply guy strategy
    CREATE TABLE IF NOT EXISTS engagement_queue (
      id TEXT PRIMARY KEY,
      relationship_id TEXT REFERENCES twitter_relationships(id) ON DELETE CASCADE,
      target_tweet_id TEXT,
      target_tweet_content TEXT,
      target_tweet_posted_at TEXT,
      suggested_reply TEXT,
      reply_type TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      due_by TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Build in public milestones
    CREATE TABLE IF NOT EXISTS bip_milestones (
      id TEXT PRIMARY KEY,
      idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      threshold INTEGER,
      current_value INTEGER,
      previous_value INTEGER,
      template TEXT,
      generated_content TEXT,
      status TEXT DEFAULT 'pending-approval',
      triggered_at TEXT,
      posted_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_pain_points_idea ON pain_points(idea_id);
    CREATE INDEX IF NOT EXISTS idx_landing_pages_idea ON landing_pages(idea_id);
    CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_page_events_page ON page_events(landing_page_id);
    CREATE INDEX IF NOT EXISTS idx_page_events_time ON page_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_waitlist_idea ON waitlist_entries(idea_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_idea ON interviews(idea_id);
    CREATE INDEX IF NOT EXISTS idx_competitors_idea ON competitors(idea_id);
    CREATE INDEX IF NOT EXISTS idx_content_idea ON content(idea_id);
    CREATE INDEX IF NOT EXISTS idx_twitter_rel_handle ON twitter_relationships(handle);
    CREATE INDEX IF NOT EXISTS idx_twitter_rel_priority ON twitter_relationships(priority);
    CREATE INDEX IF NOT EXISTS idx_twitter_interactions_rel ON twitter_interactions(relationship_id);
    CREATE INDEX IF NOT EXISTS idx_tweets_idea ON tweets(idea_id);
    CREATE INDEX IF NOT EXISTS idx_tweets_status ON tweets(status);
    CREATE INDEX IF NOT EXISTS idx_tweet_metrics_tweet ON tweet_metrics(tweet_id);
    CREATE INDEX IF NOT EXISTS idx_engagement_queue_status ON engagement_queue(status);
    CREATE INDEX IF NOT EXISTS idx_engagement_queue_due ON engagement_queue(due_by);
    CREATE INDEX IF NOT EXISTS idx_bip_milestones_idea ON bip_milestones(idea_id);
  `);
}

// Ideas CRUD
export const ideas = {
  getAll(): Idea[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM ideas ORDER BY created_at DESC").all() as any[];
    return rows.map(mapRowToIdea);
  },

  getById(id: string): Idea | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id) as any;
    return row ? mapRowToIdea(row) : null;
  },

  create(data: Omit<Idea, "id" | "createdAt" | "updatedAt">): Idea {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO ideas (id, name, description, status, hypothesis, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.description, data.status, data.hypothesis, now, now);
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Idea, "id" | "createdAt">>): Idea | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.name !== undefined) { updates.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { updates.push("description = ?"); values.push(data.description); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.hypothesis !== undefined) { updates.push("hypothesis = ?"); values.push(data.hypothesis); }
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE ideas SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM ideas WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Pain Points CRUD
export const painPoints = {
  getByIdeaId(ideaId: string): PainPoint[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM pain_points WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToPainPoint);
  },

  create(data: Omit<PainPoint, "id" | "createdAt">): PainPoint {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO pain_points (id, idea_id, description, source_url, source_type, frequency, intensity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.ideaId, data.description, data.sourceUrl || null, data.sourceType, data.frequency, data.intensity, now);
    return { id, ...data, createdAt: now };
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM pain_points WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Landing Pages CRUD
export const landingPages = {
  getByIdeaId(ideaId: string): LandingPage[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM landing_pages WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToLandingPage);
  },

  getBySlug(slug: string): LandingPage | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM landing_pages WHERE slug = ?").get(slug) as any;
    return row ? mapRowToLandingPage(row) : null;
  },

  getById(id: string): LandingPage | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM landing_pages WHERE id = ?").get(id) as any;
    return row ? mapRowToLandingPage(row) : null;
  },

  create(data: Omit<LandingPage, "id" | "createdAt" | "updatedAt">): LandingPage {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO landing_pages (id, idea_id, slug, status, variant, content, design, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.ideaId, data.slug, data.status, data.variant, JSON.stringify(data.content), JSON.stringify(data.design), now, now);
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<LandingPage, "id" | "createdAt">>): LandingPage | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.slug !== undefined) { updates.push("slug = ?"); values.push(data.slug); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.variant !== undefined) { updates.push("variant = ?"); values.push(data.variant); }
    if (data.content !== undefined) { updates.push("content = ?"); values.push(JSON.stringify(data.content)); }
    if (data.design !== undefined) { updates.push("design = ?"); values.push(JSON.stringify(data.design)); }
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE landing_pages SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM landing_pages WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Page Events
export const pageEvents = {
  getByLandingPageId(landingPageId: string): PageEvent[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM page_events WHERE landing_page_id = ? ORDER BY created_at DESC").all(landingPageId) as any[];
    return rows.map(mapRowToPageEvent);
  },

  create(data: Omit<PageEvent, "id" | "createdAt">): PageEvent {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO page_events (id, landing_page_id, event_type, visitor_id, utm_source, utm_medium, utm_campaign, referrer, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.landingPageId, data.eventType, data.visitorId, data.utmSource || null, data.utmMedium || null, data.utmCampaign || null, data.referrer || null, now);
    return { id, ...data, createdAt: now };
  },

  getStats(landingPageId: string): { views: number; ctaClicks: number; signups: number } {
    const db = getDb();
    const views = db.prepare("SELECT COUNT(*) as count FROM page_events WHERE landing_page_id = ? AND event_type = 'view'").get(landingPageId) as any;
    const ctaClicks = db.prepare("SELECT COUNT(*) as count FROM page_events WHERE landing_page_id = ? AND event_type = 'cta_click'").get(landingPageId) as any;
    const signups = db.prepare("SELECT COUNT(*) as count FROM page_events WHERE landing_page_id = ? AND event_type = 'signup'").get(landingPageId) as any;
    return {
      views: views?.count || 0,
      ctaClicks: ctaClicks?.count || 0,
      signups: signups?.count || 0,
    };
  },
};

// Waitlist Entries
export const waitlistEntries = {
  getByIdeaId(ideaId: string): WaitlistEntry[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM waitlist_entries WHERE idea_id = ? ORDER BY signed_up_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToWaitlistEntry);
  },

  create(data: Omit<WaitlistEntry, "id" | "signedUpAt" | "lastEngagedAt">): WaitlistEntry {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO waitlist_entries (id, idea_id, landing_page_id, email, source, segments, survey_responses, engagement_score, status, signed_up_at, last_engaged_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId,
      data.landingPageId,
      data.email,
      JSON.stringify(data.source),
      JSON.stringify(data.segments),
      data.surveyResponses ? JSON.stringify(data.surveyResponses) : null,
      data.engagementScore,
      data.status,
      now,
      now
    );
    return { id, ...data, signedUpAt: now, lastEngagedAt: now };
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM waitlist_entries WHERE id = ?").run(id);
    return result.changes > 0;
  },

  getCount(ideaId: string): number {
    const db = getDb();
    const result = db.prepare("SELECT COUNT(*) as count FROM waitlist_entries WHERE idea_id = ?").get(ideaId) as any;
    return result?.count || 0;
  },
};

// Interviews
export const interviews = {
  getByIdeaId(ideaId: string): Interview[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM interviews WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToInterview);
  },

  getById(id: string): Interview | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id) as any;
    return row ? mapRowToInterview(row) : null;
  },

  create(data: Omit<Interview, "id" | "createdAt">): Interview {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO interviews (id, idea_id, contact_email, contact_name, scheduled_at, completed_at, status, notes, insights, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId,
      data.contactEmail || null,
      data.contactName || null,
      data.scheduledAt || null,
      data.completedAt || null,
      data.status,
      data.notes,
      JSON.stringify(data.insights),
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Interview, "id" | "createdAt">>): Interview | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.contactEmail !== undefined) { updates.push("contact_email = ?"); values.push(data.contactEmail); }
    if (data.contactName !== undefined) { updates.push("contact_name = ?"); values.push(data.contactName); }
    if (data.scheduledAt !== undefined) { updates.push("scheduled_at = ?"); values.push(data.scheduledAt); }
    if (data.completedAt !== undefined) { updates.push("completed_at = ?"); values.push(data.completedAt); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.notes !== undefined) { updates.push("notes = ?"); values.push(data.notes); }
    if (data.insights !== undefined) { updates.push("insights = ?"); values.push(JSON.stringify(data.insights)); }
    values.push(id);

    if (updates.length > 0) {
      db.prepare(`UPDATE interviews SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM interviews WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Competitors
export const competitors = {
  getByIdeaId(ideaId: string): Competitor[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM competitors WHERE idea_id = ? ORDER BY updated_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToCompetitor);
  },

  getById(id: string): Competitor | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM competitors WHERE id = ?").get(id) as any;
    return row ? mapRowToCompetitor(row) : null;
  },

  create(data: Omit<Competitor, "id" | "updatedAt">): Competitor {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO competitors (id, idea_id, name, url, pricing, strengths, weaknesses, gaps, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId,
      data.name,
      data.url,
      data.pricing ? JSON.stringify(data.pricing) : null,
      JSON.stringify(data.strengths),
      JSON.stringify(data.weaknesses),
      JSON.stringify(data.gaps),
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Competitor, "id">>): Competitor | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.name !== undefined) { updates.push("name = ?"); values.push(data.name); }
    if (data.url !== undefined) { updates.push("url = ?"); values.push(data.url); }
    if (data.pricing !== undefined) { updates.push("pricing = ?"); values.push(JSON.stringify(data.pricing)); }
    if (data.strengths !== undefined) { updates.push("strengths = ?"); values.push(JSON.stringify(data.strengths)); }
    if (data.weaknesses !== undefined) { updates.push("weaknesses = ?"); values.push(JSON.stringify(data.weaknesses)); }
    if (data.gaps !== undefined) { updates.push("gaps = ?"); values.push(JSON.stringify(data.gaps)); }
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE competitors SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM competitors WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Content
export const content = {
  getByIdeaId(ideaId: string): Content[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM content WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToContent);
  },

  getById(id: string): Content | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM content WHERE id = ?").get(id) as any;
    return row ? mapRowToContent(row) : null;
  },

  create(data: Omit<Content, "id" | "createdAt">): Content {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO content (id, idea_id, type, status, body, derived_from, scheduled_for, published_at, performance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId,
      data.type,
      data.status,
      data.body,
      data.derivedFrom ? JSON.stringify(data.derivedFrom) : null,
      data.scheduledFor || null,
      data.publishedAt || null,
      data.performance ? JSON.stringify(data.performance) : null,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Content, "id" | "createdAt">>): Content | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.type !== undefined) { updates.push("type = ?"); values.push(data.type); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.body !== undefined) { updates.push("body = ?"); values.push(data.body); }
    if (data.derivedFrom !== undefined) { updates.push("derived_from = ?"); values.push(JSON.stringify(data.derivedFrom)); }
    if (data.scheduledFor !== undefined) { updates.push("scheduled_for = ?"); values.push(data.scheduledFor); }
    if (data.publishedAt !== undefined) { updates.push("published_at = ?"); values.push(data.publishedAt); }
    if (data.performance !== undefined) { updates.push("performance = ?"); values.push(JSON.stringify(data.performance)); }
    values.push(id);

    if (updates.length > 0) {
      db.prepare(`UPDATE content SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM content WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Helper functions to map database rows to typed objects
function mapRowToIdea(row: any): Idea {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    status: row.status as IdeaStatus,
    hypothesis: row.hypothesis || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToPainPoint(row: any): PainPoint {
  return {
    id: row.id,
    ideaId: row.idea_id,
    description: row.description,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    frequency: row.frequency,
    intensity: row.intensity,
    createdAt: row.created_at,
  };
}

function mapRowToLandingPage(row: any): LandingPage {
  return {
    id: row.id,
    ideaId: row.idea_id,
    slug: row.slug,
    status: row.status as LandingPageStatus,
    variant: row.variant,
    content: JSON.parse(row.content),
    design: row.design ? JSON.parse(row.design) : { template: "minimal", primaryColor: "#3b82f6" },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToPageEvent(row: any): PageEvent {
  return {
    id: row.id,
    landingPageId: row.landing_page_id,
    eventType: row.event_type,
    visitorId: row.visitor_id,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    referrer: row.referrer,
    createdAt: row.created_at,
  };
}

function mapRowToWaitlistEntry(row: any): WaitlistEntry {
  return {
    id: row.id,
    ideaId: row.idea_id,
    landingPageId: row.landing_page_id,
    email: row.email,
    source: row.source ? JSON.parse(row.source) : {},
    segments: row.segments ? JSON.parse(row.segments) : [],
    surveyResponses: row.survey_responses ? JSON.parse(row.survey_responses) : undefined,
    engagementScore: row.engagement_score,
    status: row.status as WaitlistStatus,
    signedUpAt: row.signed_up_at,
    lastEngagedAt: row.last_engaged_at,
  };
}

function mapRowToInterview(row: any): Interview {
  return {
    id: row.id,
    ideaId: row.idea_id,
    contactEmail: row.contact_email,
    contactName: row.contact_name,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    status: row.status as InterviewStatus,
    notes: row.notes || "",
    insights: row.insights ? JSON.parse(row.insights) : [],
    createdAt: row.created_at,
  };
}

function mapRowToCompetitor(row: any): Competitor {
  return {
    id: row.id,
    ideaId: row.idea_id,
    name: row.name,
    url: row.url,
    pricing: row.pricing ? JSON.parse(row.pricing) : undefined,
    strengths: row.strengths ? JSON.parse(row.strengths) : [],
    weaknesses: row.weaknesses ? JSON.parse(row.weaknesses) : [],
    gaps: row.gaps ? JSON.parse(row.gaps) : [],
    updatedAt: row.updated_at,
  };
}

function mapRowToContent(row: any): Content {
  return {
    id: row.id,
    ideaId: row.idea_id,
    type: row.type,
    status: row.status as ContentStatus,
    body: row.body,
    derivedFrom: row.derived_from ? JSON.parse(row.derived_from) : undefined,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    performance: row.performance ? JSON.parse(row.performance) : undefined,
    createdAt: row.created_at,
  };
}

// Analytics helper
export function getIdeaMetrics(ideaId: string) {
  const db = getDb();

  const painPointCount = db.prepare("SELECT COUNT(*) as count FROM pain_points WHERE idea_id = ?").get(ideaId) as any;
  const competitorCount = db.prepare("SELECT COUNT(*) as count FROM competitors WHERE idea_id = ?").get(ideaId) as any;
  const waitlistCount = db.prepare("SELECT COUNT(*) as count FROM waitlist_entries WHERE idea_id = ?").get(ideaId) as any;
  const interviewCount = db.prepare("SELECT COUNT(*) as count FROM interviews WHERE idea_id = ? AND status = 'completed'").get(ideaId) as any;
  const contentCount = db.prepare("SELECT COUNT(*) as count FROM content WHERE idea_id = ? AND status = 'published'").get(ideaId) as any;

  // Get landing page stats
  const pages = landingPages.getByIdeaId(ideaId);
  let totalViews = 0;
  let totalSignups = 0;

  for (const page of pages) {
    const stats = pageEvents.getStats(page.id);
    totalViews += stats.views;
    totalSignups += stats.signups;
  }

  const conversionRate = totalViews > 0 ? (totalSignups / totalViews) * 100 : 0;

  return {
    painPointsCollected: painPointCount?.count || 0,
    competitorsTracked: competitorCount?.count || 0,
    waitlistSize: waitlistCount?.count || 0,
    interviewsCompleted: interviewCount?.count || 0,
    contentPublished: contentCount?.count || 0,
    landingPageViews: totalViews,
    conversionRate: Math.round(conversionRate * 100) / 100,
    demandScore: calculateDemandScore(ideaId),
  };
}

function calculateDemandScore(ideaId: string): number {
  // Simple demand score calculation based on available signals
  const metrics = {
    painPoints: painPoints.getByIdeaId(ideaId).length,
    competitors: competitors.getByIdeaId(ideaId).length,
    waitlist: waitlistEntries.getCount(ideaId),
  };

  let score = 0;
  if (metrics.painPoints >= 10) score += 30;
  else if (metrics.painPoints >= 5) score += 20;
  else if (metrics.painPoints >= 1) score += 10;

  if (metrics.competitors >= 3) score += 20;
  else if (metrics.competitors >= 1) score += 10;

  if (metrics.waitlist >= 100) score += 50;
  else if (metrics.waitlist >= 50) score += 40;
  else if (metrics.waitlist >= 20) score += 30;
  else if (metrics.waitlist >= 10) score += 20;
  else if (metrics.waitlist >= 1) score += 10;

  return Math.min(score, 100);
}

export function getValidationRecommendation(ideaId: string): 'kill' | 'pivot' | 'continue' | 'accelerate' {
  const metrics = getIdeaMetrics(ideaId);

  // Kill criteria
  if (metrics.landingPageViews > 500 && metrics.conversionRate < 1) {
    return 'kill';
  }

  // Accelerate criteria
  if (metrics.conversionRate >= 5 && metrics.waitlistSize >= 50) {
    return 'accelerate';
  }

  // Pivot criteria
  if (metrics.conversionRate < 3 && metrics.painPointsCollected >= 10) {
    return 'pivot';
  }

  return 'continue';
}

// ============================================
// Twitter/X Growth Engine CRUD Operations
// ============================================

// Twitter Account
export const twitterAccount = {
  get(): TwitterAccount | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM twitter_account LIMIT 1").get() as any;
    return row ? mapRowToTwitterAccount(row) : null;
  },

  create(data: Omit<TwitterAccount, "id" | "updatedAt">): TwitterAccount {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO twitter_account (id, handle, followers, following, is_premium, stage, health_status, daily_limits, follower_velocity, engagement_rate, avg_impressions, warnings, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.handle,
      data.followers || 0,
      data.following || 0,
      data.isPremium ? 1 : 0,
      data.stage || '0-1k',
      data.healthStatus || 'healthy',
      data.dailyLimits ? JSON.stringify(data.dailyLimits) : null,
      data.followerVelocity || null,
      data.engagementRate || null,
      data.avgImpressions || null,
      data.warnings ? JSON.stringify(data.warnings) : null,
      now
    );
    return this.get()!;
  },

  update(data: Partial<Omit<TwitterAccount, "id">>): TwitterAccount | null {
    const db = getDb();
    const existing = this.get();
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.handle !== undefined) { updates.push("handle = ?"); values.push(data.handle); }
    if (data.followers !== undefined) { updates.push("followers = ?"); values.push(data.followers); }
    if (data.following !== undefined) { updates.push("following = ?"); values.push(data.following); }
    if (data.isPremium !== undefined) { updates.push("is_premium = ?"); values.push(data.isPremium ? 1 : 0); }
    if (data.stage !== undefined) { updates.push("stage = ?"); values.push(data.stage); }
    if (data.healthStatus !== undefined) { updates.push("health_status = ?"); values.push(data.healthStatus); }
    if (data.dailyLimits !== undefined) { updates.push("daily_limits = ?"); values.push(JSON.stringify(data.dailyLimits)); }
    if (data.followerVelocity !== undefined) { updates.push("follower_velocity = ?"); values.push(data.followerVelocity); }
    if (data.engagementRate !== undefined) { updates.push("engagement_rate = ?"); values.push(data.engagementRate); }
    if (data.avgImpressions !== undefined) { updates.push("avg_impressions = ?"); values.push(data.avgImpressions); }
    if (data.warnings !== undefined) { updates.push("warnings = ?"); values.push(JSON.stringify(data.warnings)); }
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(existing.id);

    db.prepare(`UPDATE twitter_account SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.get();
  },
};

// Twitter Relationships CRM
export const twitterRelationships = {
  getAll(): TwitterRelationship[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM twitter_relationships ORDER BY priority DESC, reciprocity_score DESC").all() as any[];
    return rows.map(mapRowToTwitterRelationship);
  },

  getByTier(tier: TwitterRelationshipTier): TwitterRelationship[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM twitter_relationships WHERE tier = ? ORDER BY priority DESC, reciprocity_score DESC").all(tier) as any[];
    return rows.map(mapRowToTwitterRelationship);
  },

  getByHandle(handle: string): TwitterRelationship | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM twitter_relationships WHERE handle = ?").get(handle) as any;
    return row ? mapRowToTwitterRelationship(row) : null;
  },

  getById(id: string): TwitterRelationship | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM twitter_relationships WHERE id = ?").get(id) as any;
    return row ? mapRowToTwitterRelationship(row) : null;
  },

  create(data: Omit<TwitterRelationship, "id" | "createdAt" | "updatedAt">): TwitterRelationship {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO twitter_relationships (id, handle, display_name, avatar_url, tier, niche, follows_you, you_follow, mutual_follow_date, priority, notes, tags, last_interaction, reciprocity_score, total_replies, total_likes, total_dms, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.handle,
      data.displayName || null,
      data.avatarUrl || null,
      data.tier || 'peer',
      data.niche ? JSON.stringify(data.niche) : null,
      data.followsYou ? 1 : 0,
      data.youFollow ? 1 : 0,
      data.mutualFollowDate || null,
      data.priority || 'medium',
      data.notes || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.lastInteraction || null,
      data.reciprocityScore || 0,
      data.totalReplies || 0,
      data.totalLikes || 0,
      data.totalDMs || 0,
      now,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<TwitterRelationship, "id" | "createdAt">>): TwitterRelationship | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.handle !== undefined) { updates.push("handle = ?"); values.push(data.handle); }
    if (data.displayName !== undefined) { updates.push("display_name = ?"); values.push(data.displayName); }
    if (data.avatarUrl !== undefined) { updates.push("avatar_url = ?"); values.push(data.avatarUrl); }
    if (data.tier !== undefined) { updates.push("tier = ?"); values.push(data.tier); }
    if (data.niche !== undefined) { updates.push("niche = ?"); values.push(JSON.stringify(data.niche)); }
    if (data.followsYou !== undefined) { updates.push("follows_you = ?"); values.push(data.followsYou ? 1 : 0); }
    if (data.youFollow !== undefined) { updates.push("you_follow = ?"); values.push(data.youFollow ? 1 : 0); }
    if (data.mutualFollowDate !== undefined) { updates.push("mutual_follow_date = ?"); values.push(data.mutualFollowDate); }
    if (data.priority !== undefined) { updates.push("priority = ?"); values.push(data.priority); }
    if (data.notes !== undefined) { updates.push("notes = ?"); values.push(data.notes); }
    if (data.tags !== undefined) { updates.push("tags = ?"); values.push(JSON.stringify(data.tags)); }
    if (data.lastInteraction !== undefined) { updates.push("last_interaction = ?"); values.push(data.lastInteraction); }
    if (data.reciprocityScore !== undefined) { updates.push("reciprocity_score = ?"); values.push(data.reciprocityScore); }
    if (data.totalReplies !== undefined) { updates.push("total_replies = ?"); values.push(data.totalReplies); }
    if (data.totalLikes !== undefined) { updates.push("total_likes = ?"); values.push(data.totalLikes); }
    if (data.totalDMs !== undefined) { updates.push("total_dms = ?"); values.push(data.totalDMs); }
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE twitter_relationships SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM twitter_relationships WHERE id = ?").run(id);
    return result.changes > 0;
  },

  getHighPriority(): TwitterRelationship[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM twitter_relationships WHERE priority IN ('high', 'critical') ORDER BY priority DESC, reciprocity_score DESC").all() as any[];
    return rows.map(mapRowToTwitterRelationship);
  },
};

// Twitter Interactions
export const twitterInteractions = {
  getByRelationshipId(relationshipId: string): TwitterInteraction[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM twitter_interactions WHERE relationship_id = ? ORDER BY created_at DESC").all(relationshipId) as any[];
    return rows.map(mapRowToTwitterInteraction);
  },

  create(data: Omit<TwitterInteraction, "id" | "createdAt">): TwitterInteraction {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO twitter_interactions (id, relationship_id, type, direction, tweet_id, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.relationshipId, data.type, data.direction, data.tweetId || null, data.content || null, now);

    // Update relationship stats
    const relationship = twitterRelationships.getById(data.relationshipId);
    if (relationship) {
      const updateData: Partial<TwitterRelationship> = { lastInteraction: now };
      if (data.type === 'reply') updateData.totalReplies = (relationship.totalReplies || 0) + 1;
      if (data.type === 'like') updateData.totalLikes = (relationship.totalLikes || 0) + 1;
      if (data.type === 'dm') updateData.totalDMs = (relationship.totalDMs || 0) + 1;
      twitterRelationships.update(data.relationshipId, updateData);
    }

    return { id, ...data, createdAt: now };
  },
};

// Tweets
export const tweets = {
  getAll(): Tweet[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweets ORDER BY created_at DESC").all() as any[];
    return rows.map(mapRowToTweet);
  },

  getById(id: string): Tweet | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM tweets WHERE id = ?").get(id) as any;
    return row ? mapRowToTweet(row) : null;
  },

  getByIdeaId(ideaId: string): Tweet[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweets WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToTweet);
  },

  getByStatus(status: TweetStatus): Tweet[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweets WHERE status = ? ORDER BY created_at DESC").all(status) as any[];
    return rows.map(mapRowToTweet);
  },

  getScheduled(): Tweet[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweets WHERE status = 'scheduled' ORDER BY scheduled_for ASC").all() as any[];
    return rows.map(mapRowToTweet);
  },

  getThread(threadId: string): Tweet[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweets WHERE thread_id = ? ORDER BY thread_position ASC").all(threadId) as any[];
    return rows.map(mapRowToTweet);
  },

  create(data: Omit<Tweet, "id" | "createdAt">): Tweet {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO tweets (id, idea_id, type, content, media_urls, thread_id, thread_position, derived_from, status, scheduled_for, published_at, platform_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId || null,
      data.type,
      data.content,
      data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
      data.threadId || null,
      data.threadPosition || null,
      data.derivedFrom ? JSON.stringify(data.derivedFrom) : null,
      data.status || 'draft',
      data.scheduledFor || null,
      data.publishedAt || null,
      data.platformId || null,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Tweet, "id" | "createdAt">>): Tweet | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.ideaId !== undefined) { updates.push("idea_id = ?"); values.push(data.ideaId); }
    if (data.type !== undefined) { updates.push("type = ?"); values.push(data.type); }
    if (data.content !== undefined) { updates.push("content = ?"); values.push(data.content); }
    if (data.mediaUrls !== undefined) { updates.push("media_urls = ?"); values.push(JSON.stringify(data.mediaUrls)); }
    if (data.threadId !== undefined) { updates.push("thread_id = ?"); values.push(data.threadId); }
    if (data.threadPosition !== undefined) { updates.push("thread_position = ?"); values.push(data.threadPosition); }
    if (data.derivedFrom !== undefined) { updates.push("derived_from = ?"); values.push(JSON.stringify(data.derivedFrom)); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.scheduledFor !== undefined) { updates.push("scheduled_for = ?"); values.push(data.scheduledFor); }
    if (data.publishedAt !== undefined) { updates.push("published_at = ?"); values.push(data.publishedAt); }
    if (data.platformId !== undefined) { updates.push("platform_id = ?"); values.push(data.platformId); }
    values.push(id);

    if (updates.length > 0) {
      db.prepare(`UPDATE tweets SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM tweets WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Tweet Metrics
export const tweetMetrics = {
  getByTweetId(tweetId: string): TweetMetrics | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM tweet_metrics WHERE tweet_id = ? ORDER BY collected_at DESC LIMIT 1").get(tweetId) as any;
    return row ? mapRowToTweetMetrics(row) : null;
  },

  getHistory(tweetId: string): TweetMetrics[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM tweet_metrics WHERE tweet_id = ? ORDER BY collected_at ASC").all(tweetId) as any[];
    return rows.map(mapRowToTweetMetrics);
  },

  create(data: Omit<TweetMetrics, "id" | "collectedAt">): TweetMetrics {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO tweet_metrics (id, tweet_id, impressions, engagements, likes, retweets, replies, quotes, profile_visits, link_clicks, followers_delta, engagement_rate, collected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.tweetId,
      data.impressions || 0,
      data.engagements || 0,
      data.likes || 0,
      data.retweets || 0,
      data.replies || 0,
      data.quotes || 0,
      data.profileVisits || 0,
      data.linkClicks || 0,
      data.followersDelta || 0,
      data.engagementRate || 0,
      now
    );
    return { id, ...data, collectedAt: now };
  },

  update(id: string, data: Partial<Omit<TweetMetrics, "id" | "collectedAt">>): TweetMetrics | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM tweet_metrics WHERE id = ?").get(id) as any;
    if (!row) return null;

    const updates = [];
    const values = [];
    if (data.impressions !== undefined) { updates.push("impressions = ?"); values.push(data.impressions); }
    if (data.engagements !== undefined) { updates.push("engagements = ?"); values.push(data.engagements); }
    if (data.likes !== undefined) { updates.push("likes = ?"); values.push(data.likes); }
    if (data.retweets !== undefined) { updates.push("retweets = ?"); values.push(data.retweets); }
    if (data.replies !== undefined) { updates.push("replies = ?"); values.push(data.replies); }
    if (data.quotes !== undefined) { updates.push("quotes = ?"); values.push(data.quotes); }
    if (data.profileVisits !== undefined) { updates.push("profile_visits = ?"); values.push(data.profileVisits); }
    if (data.linkClicks !== undefined) { updates.push("link_clicks = ?"); values.push(data.linkClicks); }
    if (data.followersDelta !== undefined) { updates.push("followers_delta = ?"); values.push(data.followersDelta); }
    if (data.engagementRate !== undefined) { updates.push("engagement_rate = ?"); values.push(data.engagementRate); }
    values.push(id);

    if (updates.length > 0) {
      db.prepare(`UPDATE tweet_metrics SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return mapRowToTweetMetrics(db.prepare("SELECT * FROM tweet_metrics WHERE id = ?").get(id) as any);
  },
};

// Engagement Queue
export const engagementQueue = {
  getAll(): EngagementTarget[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM engagement_queue ORDER BY priority DESC, due_by ASC").all() as any[];
    return rows.map(mapRowToEngagementTarget);
  },

  getPending(): EngagementTarget[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM engagement_queue WHERE status = 'pending' ORDER BY priority DESC, due_by ASC").all() as any[];
    return rows.map(mapRowToEngagementTarget);
  },

  getById(id: string): EngagementTarget | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM engagement_queue WHERE id = ?").get(id) as any;
    return row ? mapRowToEngagementTarget(row) : null;
  },

  getByRelationshipId(relationshipId: string): EngagementTarget[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM engagement_queue WHERE relationship_id = ? ORDER BY created_at DESC").all(relationshipId) as any[];
    return rows.map(mapRowToEngagementTarget);
  },

  create(data: Omit<EngagementTarget, "id" | "createdAt">): EngagementTarget {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO engagement_queue (id, relationship_id, target_tweet_id, target_tweet_content, target_tweet_posted_at, suggested_reply, reply_type, priority, status, due_by, completed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.relationshipId,
      data.targetTweetId || null,
      data.targetTweetContent || null,
      data.targetTweetPostedAt || null,
      data.suggestedReply || null,
      data.replyType || null,
      data.priority || 'medium',
      data.status || 'pending',
      data.dueBy || null,
      data.completedAt || null,
      now
    );
    return this.getById(id)!;
  },

  complete(id: string): EngagementTarget | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare("UPDATE engagement_queue SET status = 'completed', completed_at = ? WHERE id = ?").run(now, id);
    return this.getById(id);
  },

  skip(id: string): EngagementTarget | null {
    const db = getDb();
    db.prepare("UPDATE engagement_queue SET status = 'skipped' WHERE id = ?").run(id);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM engagement_queue WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Build in Public Milestones
export const bipMilestones = {
  getAll(): BIPMilestone[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM bip_milestones ORDER BY created_at DESC").all() as any[];
    return rows.map(mapRowToBIPMilestone);
  },

  getByIdeaId(ideaId: string): BIPMilestone[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM bip_milestones WHERE idea_id = ? ORDER BY created_at DESC").all(ideaId) as any[];
    return rows.map(mapRowToBIPMilestone);
  },

  getPending(): BIPMilestone[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM bip_milestones WHERE status = 'pending-approval' ORDER BY triggered_at DESC").all() as any[];
    return rows.map(mapRowToBIPMilestone);
  },

  getById(id: string): BIPMilestone | null {
    const db = getDb();
    const row = db.prepare("SELECT * FROM bip_milestones WHERE id = ?").get(id) as any;
    return row ? mapRowToBIPMilestone(row) : null;
  },

  create(data: Omit<BIPMilestone, "id" | "createdAt">): BIPMilestone {
    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO bip_milestones (id, idea_id, type, threshold, current_value, previous_value, template, generated_content, status, triggered_at, posted_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.ideaId,
      data.type,
      data.threshold || null,
      data.currentValue || null,
      data.previousValue || null,
      data.template || null,
      data.generatedContent || null,
      data.status || 'pending-approval',
      data.triggeredAt || null,
      data.postedAt || null,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<BIPMilestone, "id" | "createdAt">>): BIPMilestone | null {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const updates = [];
    const values = [];
    if (data.type !== undefined) { updates.push("type = ?"); values.push(data.type); }
    if (data.threshold !== undefined) { updates.push("threshold = ?"); values.push(data.threshold); }
    if (data.currentValue !== undefined) { updates.push("current_value = ?"); values.push(data.currentValue); }
    if (data.previousValue !== undefined) { updates.push("previous_value = ?"); values.push(data.previousValue); }
    if (data.template !== undefined) { updates.push("template = ?"); values.push(data.template); }
    if (data.generatedContent !== undefined) { updates.push("generated_content = ?"); values.push(data.generatedContent); }
    if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status); }
    if (data.triggeredAt !== undefined) { updates.push("triggered_at = ?"); values.push(data.triggeredAt); }
    if (data.postedAt !== undefined) { updates.push("posted_at = ?"); values.push(data.postedAt); }
    values.push(id);

    if (updates.length > 0) {
      db.prepare(`UPDATE bip_milestones SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return this.getById(id);
  },

  approve(id: string): BIPMilestone | null {
    return this.update(id, { status: 'scheduled' });
  },

  markPosted(id: string): BIPMilestone | null {
    return this.update(id, { status: 'published', postedAt: new Date().toISOString() });
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM bip_milestones WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

// Twitter mapping functions
function mapRowToTwitterAccount(row: any): TwitterAccount {
  return {
    id: row.id,
    handle: row.handle,
    followers: row.followers || 0,
    following: row.following || 0,
    isPremium: row.is_premium === 1,
    stage: row.stage as TwitterAccountStage,
    healthStatus: row.health_status as TwitterHealthStatus,
    dailyLimits: row.daily_limits ? JSON.parse(row.daily_limits) : undefined,
    followerVelocity: row.follower_velocity,
    engagementRate: row.engagement_rate,
    avgImpressions: row.avg_impressions,
    warnings: row.warnings ? JSON.parse(row.warnings) : undefined,
    updatedAt: row.updated_at,
  };
}

function mapRowToTwitterRelationship(row: any): TwitterRelationship {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    tier: row.tier as TwitterRelationshipTier,
    niche: row.niche ? JSON.parse(row.niche) : [],
    followsYou: row.follows_you === 1,
    youFollow: row.you_follow === 1,
    mutualFollowDate: row.mutual_follow_date,
    priority: row.priority as Priority,
    notes: row.notes,
    tags: row.tags ? JSON.parse(row.tags) : [],
    lastInteraction: row.last_interaction,
    reciprocityScore: row.reciprocity_score || 0,
    totalReplies: row.total_replies || 0,
    totalLikes: row.total_likes || 0,
    totalDMs: row.total_dms || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToTwitterInteraction(row: any): TwitterInteraction {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    type: row.type,
    direction: row.direction,
    tweetId: row.tweet_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapRowToTweet(row: any): Tweet {
  return {
    id: row.id,
    ideaId: row.idea_id,
    type: row.type as TweetType,
    content: row.content,
    mediaUrls: row.media_urls ? JSON.parse(row.media_urls) : undefined,
    threadId: row.thread_id,
    threadPosition: row.thread_position,
    derivedFrom: row.derived_from ? JSON.parse(row.derived_from) : undefined,
    status: row.status as TweetStatus,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    platformId: row.platform_id,
    createdAt: row.created_at,
  };
}

function mapRowToTweetMetrics(row: any): TweetMetrics {
  return {
    id: row.id,
    tweetId: row.tweet_id,
    impressions: row.impressions || 0,
    engagements: row.engagements || 0,
    likes: row.likes || 0,
    retweets: row.retweets || 0,
    replies: row.replies || 0,
    quotes: row.quotes || 0,
    profileVisits: row.profile_visits || 0,
    linkClicks: row.link_clicks || 0,
    followersDelta: row.followers_delta || 0,
    engagementRate: row.engagement_rate || 0,
    collectedAt: row.collected_at,
  };
}

function mapRowToEngagementTarget(row: any): EngagementTarget {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    targetTweetId: row.target_tweet_id,
    targetTweetContent: row.target_tweet_content,
    targetTweetPostedAt: row.target_tweet_posted_at,
    suggestedReply: row.suggested_reply,
    replyType: row.reply_type,
    priority: row.priority as Priority,
    status: row.status as EngagementStatus,
    dueBy: row.due_by,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

function mapRowToBIPMilestone(row: any): BIPMilestone {
  return {
    id: row.id,
    ideaId: row.idea_id,
    type: row.type,
    threshold: row.threshold,
    currentValue: row.current_value,
    previousValue: row.previous_value,
    template: row.template,
    generatedContent: row.generated_content,
    status: row.status as MilestoneStatus,
    triggeredAt: row.triggered_at,
    postedAt: row.posted_at,
    createdAt: row.created_at,
  };
}

// Twitter Analytics
export function getTwitterMetrics(): {
  totalRelationships: number;
  whales: number;
  peers: number;
  fans: number;
  pendingEngagements: number;
  tweetsThisWeek: number;
  avgEngagementRate: number;
} {
  const db = getDb();

  const total = db.prepare("SELECT COUNT(*) as count FROM twitter_relationships").get() as any;
  const whales = db.prepare("SELECT COUNT(*) as count FROM twitter_relationships WHERE tier = 'whale'").get() as any;
  const peers = db.prepare("SELECT COUNT(*) as count FROM twitter_relationships WHERE tier = 'peer'").get() as any;
  const fans = db.prepare("SELECT COUNT(*) as count FROM twitter_relationships WHERE tier = 'fan'").get() as any;
  const pending = db.prepare("SELECT COUNT(*) as count FROM engagement_queue WHERE status = 'pending'").get() as any;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const tweetsThisWeek = db.prepare("SELECT COUNT(*) as count FROM tweets WHERE created_at > ?").get(weekAgo) as any;

  const avgEngagement = db.prepare("SELECT AVG(engagement_rate) as avg FROM tweet_metrics").get() as any;

  return {
    totalRelationships: total?.count || 0,
    whales: whales?.count || 0,
    peers: peers?.count || 0,
    fans: fans?.count || 0,
    pendingEngagements: pending?.count || 0,
    tweetsThisWeek: tweetsThisWeek?.count || 0,
    avgEngagementRate: avgEngagement?.avg || 0,
  };
}
