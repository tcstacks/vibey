import { NextRequest, NextResponse } from "next/server";
import { tweets, tweetMetrics } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const tweet = tweets.getById(id);

    if (!tweet) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    // Get latest metrics
    const metrics = tweetMetrics.getByTweetId(id);

    return NextResponse.json({ ...tweet, metrics });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tweet" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const data = await request.json();
    const tweet = tweets.update(id, data);

    if (!tweet) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    return NextResponse.json(tweet);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tweet" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const deleted = tweets.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tweet" }, { status: 500 });
  }
}
