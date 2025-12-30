import { NextRequest, NextResponse } from "next/server";
import { twitterRelationships } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const priority = searchParams.get("priority");

    let relationships;
    if (tier) {
      relationships = twitterRelationships.getByTier(tier as any);
    } else if (priority === "high") {
      relationships = twitterRelationships.getHighPriority();
    } else {
      relationships = twitterRelationships.getAll();
    }

    return NextResponse.json(relationships);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch relationships" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if handle already exists
    const existing = twitterRelationships.getByHandle(data.handle);
    if (existing) {
      return NextResponse.json({ error: "Relationship with this handle already exists" }, { status: 400 });
    }

    const relationship = twitterRelationships.create(data);
    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create relationship" }, { status: 500 });
  }
}
