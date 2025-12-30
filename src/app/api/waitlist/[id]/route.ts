import { NextRequest, NextResponse } from "next/server";
import { waitlistEntries } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = waitlistEntries.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting waitlist entry:", error);
    return NextResponse.json({ error: "Failed to delete waitlist entry" }, { status: 500 });
  }
}
