import { NextRequest, NextResponse } from "next/server";
import { waitlistEntries } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entries = waitlistEntries.getByIdeaId(id);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, landingPageId, source, segments } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const entry = waitlistEntries.create({
      ideaId: id,
      landingPageId: landingPageId || "",
      email,
      source: source || {},
      segments: segments || [],
      engagementScore: 0,
      status: "active",
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    return NextResponse.json({ error: "Failed to create waitlist entry" }, { status: 500 });
  }
}
