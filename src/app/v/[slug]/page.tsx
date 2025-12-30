import { notFound } from "next/navigation";
import { landingPages, pageEvents } from "@/lib/db";
import { LandingPageClient } from "./client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = landingPages.getBySlug(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.content.headline,
    description: page.content.subheadline || page.content.solution,
    openGraph: {
      title: page.content.headline,
      description: page.content.subheadline || page.content.solution,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const page = landingPages.getBySlug(slug);

  if (!page || page.status !== "live") {
    notFound();
  }

  return <LandingPageClient page={page} />;
}
