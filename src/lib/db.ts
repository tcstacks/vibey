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
