import { NextRequest, NextResponse } from "next/server";
import { bipMilestones } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get("ideaId");
    const pending = searchParams.get("pending");

    let milestones;
    if (ideaId) {
      milestones = bipMilestones.getByIdeaId(ideaId);
    } else if (pending === "true") {
      milestones = bipMilestones.getPending();
    } else {
      milestones = bipMilestones.getAll();
    }

    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const milestone = bipMilestones.create(data);
    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
