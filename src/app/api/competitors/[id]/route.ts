import { NextRequest, NextResponse } from "next/server";
import { competitors } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const competitor = competitors.getById(id);
    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }
    return NextResponse.json(competitor);
  } catch (error) {
    console.error("Error fetching competitor:", error);
    return NextResponse.json({ error: "Failed to fetch competitor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, pricing, strengths, weaknesses, gaps } = body;

    const updated = competitors.update(id, {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(pricing !== undefined && { pricing }),
      ...(strengths !== undefined && { strengths }),
      ...(weaknesses !== undefined && { weaknesses }),
      ...(gaps !== undefined && { gaps }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating competitor:", error);
    return NextResponse.json({ error: "Failed to update competitor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = competitors.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
