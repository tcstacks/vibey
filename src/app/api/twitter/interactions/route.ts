import { NextRequest, NextResponse } from "next/server";
import { twitterInteractions } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relationshipId = searchParams.get("relationshipId");

    if (!relationshipId) {
      return NextResponse.json({ error: "relationshipId is required" }, { status: 400 });
    }

    const interactions = twitterInteractions.getByRelationshipId(relationshipId);
    return NextResponse.json(interactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.relationshipId || !data.type || !data.direction) {
      return NextResponse.json({ error: "relationshipId, type, and direction are required" }, { status: 400 });
    }

    const interaction = twitterInteractions.create(data);
    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create interaction" }, { status: 500 });
  }
}
