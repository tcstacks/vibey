import { NextRequest, NextResponse } from "next/server";
import { content } from "@/lib/db";
import type { ContentType, ContentStatus, ContentDerivedFrom, ContentPerformance } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const piece = content.getById(id);
    if (!piece) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json(piece);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, body: contentBody, status, derivedFrom, scheduledFor, publishedAt, performance } = body;

    const updated = content.update(id, {
      ...(type !== undefined && { type: type as ContentType }),
      ...(contentBody !== undefined && { body: contentBody }),
      ...(status !== undefined && { status: status as ContentStatus }),
      ...(derivedFrom !== undefined && { derivedFrom: derivedFrom as ContentDerivedFrom }),
      ...(scheduledFor !== undefined && { scheduledFor }),
      ...(publishedAt !== undefined && { publishedAt }),
      ...(performance !== undefined && { performance: performance as ContentPerformance }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = content.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
