import { NextRequest, NextResponse } from "next/server";
import { landingPages, pageEvents } from "@/lib/db";
import type { LandingPageStatus, LandingPageContent, LandingPageDesign } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = landingPages.getById(id);
    if (!page) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...page,
      stats: pageEvents.getStats(page.id),
    });
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return NextResponse.json({ error: "Failed to fetch landing page" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { slug, content, design, status, variant } = body;

    const updated = landingPages.update(id, {
      ...(slug !== undefined && { slug }),
      ...(content !== undefined && { content: content as LandingPageContent }),
      ...(design !== undefined && { design: design as LandingPageDesign }),
      ...(status !== undefined && { status: status as LandingPageStatus }),
      ...(variant !== undefined && { variant }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json({ error: "Failed to update landing page" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = landingPages.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json({ error: "Failed to delete landing page" }, { status: 500 });
  }
}
