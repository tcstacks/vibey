import { NextRequest, NextResponse } from "next/server";
import { interviews } from "@/lib/db";
import type { InterviewStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inters = interviews.getByIdeaId(id);
    return NextResponse.json(inters);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { contactEmail, contactName, scheduledAt, notes, insights, status } = body;

    const interview = interviews.create({
      ideaId: id,
      contactEmail: contactEmail || undefined,
      contactName: contactName || undefined,
      scheduledAt: scheduledAt || undefined,
      status: (status as InterviewStatus) || "scheduled",
      notes: notes || "",
      insights: insights || [],
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
