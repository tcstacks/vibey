import { NextRequest, NextResponse } from "next/server";
import { content } from "@/lib/db";
import type { ContentType, ContentStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pieces = content.getByIdeaId(id);
    return NextResponse.json(pieces);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, body: contentBody, derivedFrom, scheduledFor, status } = body;

    if (!type || !contentBody) {
      return NextResponse.json({ error: "Type and body are required" }, { status: 400 });
    }

    const piece = content.create({
      ideaId: id,
      type: type as ContentType,
      status: (status as ContentStatus) || "draft",
      body: contentBody,
      derivedFrom: derivedFrom || undefined,
      scheduledFor: scheduledFor || undefined,
    });

    return NextResponse.json(piece, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}
