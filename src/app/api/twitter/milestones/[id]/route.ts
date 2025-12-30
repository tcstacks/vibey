import { NextRequest, NextResponse } from "next/server";
import { bipMilestones } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const milestone = bipMilestones.getById(id);

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch milestone" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "approve") {
      const milestone = bipMilestones.approve(id);
      if (!milestone) {
        return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
      }
      return NextResponse.json(milestone);
    }

    if (action === "post") {
      const milestone = bipMilestones.markPosted(id);
      if (!milestone) {
        return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
      }
      return NextResponse.json(milestone);
    }

    const data = await request.json();
    const milestone = bipMilestones.update(id, data);

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const deleted = bipMilestones.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
