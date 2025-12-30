import { NextRequest, NextResponse } from "next/server";
import { ideas, getIdeaMetrics, getValidationRecommendation } from "@/lib/db";
import type { IdeaStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idea = ideas.getById(id);
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...idea,
      metrics: getIdeaMetrics(idea.id),
      recommendation: getValidationRecommendation(idea.id),
    });
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, hypothesis, status } = body;

    const updated = ideas.update(id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(hypothesis !== undefined && { hypothesis }),
      ...(status !== undefined && { status: status as IdeaStatus }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating idea:", error);
    return NextResponse.json({ error: "Failed to update idea" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = ideas.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 });
  }
}
