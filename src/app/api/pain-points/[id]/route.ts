import { NextRequest, NextResponse } from "next/server";
import { painPoints } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = painPoints.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Pain point not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pain point:", error);
    return NextResponse.json({ error: "Failed to delete pain point" }, { status: 500 });
  }
}
