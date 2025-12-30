import { NextRequest, NextResponse } from "next/server";
import { competitors } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comps = competitors.getByIdeaId(id);
    return NextResponse.json(comps);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, pricing, strengths, weaknesses, gaps } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const competitor = competitors.create({
      ideaId: id,
      name,
      url: url || "",
      pricing: pricing || undefined,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      gaps: gaps || [],
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("Error creating competitor:", error);
    return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 });
  }
}
