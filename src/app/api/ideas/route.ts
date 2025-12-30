import { NextRequest, NextResponse } from "next/server";
import { ideas, getIdeaMetrics, getValidationRecommendation } from "@/lib/db";
import type { IdeaStatus } from "@/types";

export async function GET() {
  try {
    const allIdeas = ideas.getAll();
    const ideasWithMetrics = allIdeas.map((idea) => ({
      ...idea,
      metrics: getIdeaMetrics(idea.id),
      recommendation: getValidationRecommendation(idea.id),
    }));
    return NextResponse.json(ideasWithMetrics);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, hypothesis, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const idea = ideas.create({
      name,
      description: description || "",
      hypothesis: hypothesis || "",
      status: (status as IdeaStatus) || "researching",
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json({ error: "Failed to create idea" }, { status: 500 });
  }
}
