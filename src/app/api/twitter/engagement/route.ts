import { NextRequest, NextResponse } from "next/server";
import { engagementQueue, twitterRelationships } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pending = searchParams.get("pending");
    const relationshipId = searchParams.get("relationshipId");

    let queue;
    if (pending === "true") {
      queue = engagementQueue.getPending();
    } else if (relationshipId) {
      queue = engagementQueue.getByRelationshipId(relationshipId);
    } else {
      queue = engagementQueue.getAll();
    }

    // Enrich with relationship data
    const enriched = queue.map(item => {
      const relationship = twitterRelationships.getById(item.relationshipId);
      return {
        ...item,
        relationship: relationship ? {
          handle: relationship.handle,
          displayName: relationship.displayName,
          tier: relationship.tier,
        } : null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch engagement queue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const engagement = engagementQueue.create(data);
    return NextResponse.json(engagement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create engagement" }, { status: 500 });
  }
}
