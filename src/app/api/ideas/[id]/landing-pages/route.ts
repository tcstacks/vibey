import { NextRequest, NextResponse } from "next/server";
import { landingPages, pageEvents } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { LandingPageStatus, LandingPageTemplate, LandingPageContent, LandingPageDesign } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pages = landingPages.getByIdeaId(id);
    const pagesWithStats = pages.map((page) => ({
      ...page,
      stats: pageEvents.getStats(page.id),
    }));
    return NextResponse.json(pagesWithStats);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json({ error: "Failed to fetch landing pages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { slug, content, design, status, variant } = body;

    if (!content || !content.headline) {
      return NextResponse.json({ error: "Content with headline is required" }, { status: 400 });
    }

    const finalSlug = slug || slugify(content.headline);

    // Check if slug exists
    const existing = landingPages.getBySlug(finalSlug);
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const page = landingPages.create({
      ideaId: id,
      slug: finalSlug,
      status: (status as LandingPageStatus) || "draft",
      variant: variant || "control",
      content: content as LandingPageContent,
      design: design as LandingPageDesign || {
        template: "minimal",
        primaryColor: "#3b82f6",
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json({ error: "Failed to create landing page" }, { status: 500 });
  }
}
