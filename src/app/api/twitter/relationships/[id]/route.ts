import { NextRequest, NextResponse } from "next/server";
import { twitterRelationships, twitterInteractions } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const relationship = twitterRelationships.getById(id);

    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    // Get interaction history
    const interactions = twitterInteractions.getByRelationshipId(id);

    return NextResponse.json({ ...relationship, interactions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch relationship" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const data = await request.json();
    const relationship = twitterRelationships.update(id, data);

    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    return NextResponse.json(relationship);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update relationship" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const deleted = twitterRelationships.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete relationship" }, { status: 500 });
  }
}
