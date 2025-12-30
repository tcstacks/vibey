import { NextRequest, NextResponse } from "next/server";
import { engagementQueue, twitterInteractions } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const engagement = engagementQueue.getById(id);

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    return NextResponse.json(engagement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const engagement = engagementQueue.getById(id);
    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    if (action === "complete") {
      const updated = engagementQueue.complete(id);

      // Log the interaction
      if (engagement.relationshipId) {
        twitterInteractions.create({
          relationshipId: engagement.relationshipId,
          type: "reply",
          direction: "sent",
          tweetId: engagement.targetTweetId,
          content: engagement.suggestedReply,
        });
      }

      return NextResponse.json(updated);
    }

    if (action === "skip") {
      const updated = engagementQueue.skip(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update engagement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const deleted = engagementQueue.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete engagement" }, { status: 500 });
  }
}
