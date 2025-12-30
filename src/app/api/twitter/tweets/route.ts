import { NextRequest, NextResponse } from "next/server";
import { tweets } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get("ideaId");
    const status = searchParams.get("status");
    const threadId = searchParams.get("threadId");

    let tweetList;
    if (ideaId) {
      tweetList = tweets.getByIdeaId(ideaId);
    } else if (status) {
      if (status === "scheduled") {
        tweetList = tweets.getScheduled();
      } else {
        tweetList = tweets.getByStatus(status as any);
      }
    } else if (threadId) {
      tweetList = tweets.getThread(threadId);
    } else {
      tweetList = tweets.getAll();
    }

    return NextResponse.json(tweetList);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const tweet = tweets.create(data);
    return NextResponse.json(tweet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
