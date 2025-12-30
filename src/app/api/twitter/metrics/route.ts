import { NextResponse } from "next/server";
import { getTwitterMetrics } from "@/lib/db";

export async function GET() {
  try {
    const metrics = getTwitterMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
