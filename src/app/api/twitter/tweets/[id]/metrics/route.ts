import { NextRequest, NextResponse } from "next/server";
import { tweetMetrics } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const history = searchParams.get("history");

    if (history === "true") {
      const metricsHistory = tweetMetrics.getHistory(id);
      return NextResponse.json(metricsHistory);
    }

    const metrics = tweetMetrics.getByTweetId(id);
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const data = await request.json();
    const metrics = tweetMetrics.create({ ...data, tweetId: id });
    return NextResponse.json(metrics, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create metrics" }, { status: 500 });
  }
}
