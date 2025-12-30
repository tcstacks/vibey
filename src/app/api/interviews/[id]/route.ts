import { NextRequest, NextResponse } from "next/server";
import { interviews } from "@/lib/db";
import type { InterviewStatus, InterviewInsight } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const interview = interviews.getById(id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { contactEmail, contactName, scheduledAt, completedAt, status, notes, insights } = body;

    const updated = interviews.update(id, {
      ...(contactEmail !== undefined && { contactEmail }),
      ...(contactName !== undefined && { contactName }),
      ...(scheduledAt !== undefined && { scheduledAt }),
      ...(completedAt !== undefined && { completedAt }),
      ...(status !== undefined && { status: status as InterviewStatus }),
      ...(notes !== undefined && { notes }),
      ...(insights !== undefined && { insights: insights as InterviewInsight[] }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = interviews.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 });
  }
}
