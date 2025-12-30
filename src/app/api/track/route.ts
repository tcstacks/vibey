import { NextRequest, NextResponse } from "next/server";
import { pageEvents, landingPages, waitlistEntries } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landingPageId, eventType, visitorId, utmSource, utmMedium, utmCampaign, referrer, email } = body;

    if (!landingPageId || !eventType) {
      return NextResponse.json({ error: "Landing page ID and event type are required" }, { status: 400 });
    }

    // Track the event
    const event = pageEvents.create({
      landingPageId,
      eventType,
      visitorId: visitorId || "anonymous",
      utmSource,
      utmMedium,
      utmCampaign,
      referrer,
    });

    // If signup event with email, create waitlist entry
    if (eventType === "signup" && email) {
      const page = landingPages.getById(landingPageId);
      if (page) {
        waitlistEntries.create({
          ideaId: page.ideaId,
          landingPageId,
          email,
          source: {
            utmSource,
            utmMedium,
            utmCampaign,
            referrer,
          },
          segments: [],
          engagementScore: 0,
          status: "active",
        });
      }
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
