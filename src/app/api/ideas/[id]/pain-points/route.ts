import { NextRequest, NextResponse } from "next/server";
import { painPoints } from "@/lib/db";
import type { IntensityLevel } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const points = painPoints.getByIdeaId(id);
    return NextResponse.json(points);
  } catch (error) {
    console.error("Error fetching pain points:", error);
    return NextResponse.json({ error: "Failed to fetch pain points" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, sourceUrl, sourceType, frequency, intensity } = body;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const point = painPoints.create({
      ideaId: id,
      description,
      sourceUrl: sourceUrl || undefined,
      sourceType: sourceType || "manual",
      frequency: frequency || 1,
      intensity: (intensity as IntensityLevel) || "medium",
    });

    return NextResponse.json(point, { status: 201 });
  } catch (error) {
    console.error("Error creating pain point:", error);
    return NextResponse.json({ error: "Failed to create pain point" }, { status: 500 });
  }
}
