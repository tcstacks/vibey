"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import type { LandingPage } from "@/types";

interface Props {
  page: LandingPage;
}

export function LandingPageClient({ page }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState("");

  useEffect(() => {
    // Generate or retrieve visitor ID
    let vid = localStorage.getItem("vid");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("vid", vid);
    }
    setVisitorId(vid);

    // Track page view
    const params = new URLSearchParams(window.location.search);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landingPageId: page.id,
        eventType: "view",
        visitorId: vid,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
        referrer: document.referrer,
      }),
    });
  }, [page.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    const params = new URLSearchParams(window.location.search);

    // Track CTA click
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landingPageId: page.id,
        eventType: "cta_click",
        visitorId,
      }),
    });

    // Track signup with email
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landingPageId: page.id,
        eventType: "signup",
        visitorId,
        email,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
        referrer: document.referrer,
      }),
    });

    setLoading(false);
    setSubmitted(true);
  };

  const { content, design } = page;
  const primaryColor = design.primaryColor || "#3b82f6";

  // Render based on template
  if (design.template === "problem-agitate-solve") {
    return (
      <ProblemAgitateSolveTemplate
        content={content}
        primaryColor={primaryColor}
        email={email}
        setEmail={setEmail}
        submitted={submitted}
        loading={loading}
        handleSubmit={handleSubmit}
      />
    );
  }

  if (design.template === "feature-list") {
    return (
      <FeatureListTemplate
        content={content}
        primaryColor={primaryColor}
        email={email}
        setEmail={setEmail}
        submitted={submitted}
        loading={loading}
        handleSubmit={handleSubmit}
      />
    );
  }

  // Default: Minimal template
  return (
    <MinimalTemplate
      content={content}
      primaryColor={primaryColor}
      email={email}
      setEmail={setEmail}
      submitted={submitted}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
}

interface TemplateProps {
  content: LandingPage["content"];
  primaryColor: string;
  email: string;
  setEmail: (email: string) => void;
  submitted: boolean;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

function MinimalTemplate({
  content,
  primaryColor,
  email,
  setEmail,
  submitted,
  loading,
  handleSubmit,
}: TemplateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {content.headline}
        </h1>

        {content.subheadline && (
          <p className="text-xl text-muted-foreground">
            {content.subheadline}
          </p>
        )}

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {content.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {content.socialProof && (
          <p className="text-sm text-muted-foreground">
            {content.socialProof}
          </p>
        )}
      </div>
    </div>
  );
}

function ProblemAgitateSolveTemplate({
  content,
  primaryColor,
  email,
  setEmail,
  submitted,
  loading,
  handleSubmit,
}: TemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="py-20 px-8 text-center bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {content.headline}
          </h1>
          {content.subheadline && (
            <p className="text-xl text-muted-foreground mb-8">
              {content.subheadline}
            </p>
          )}
        </div>
      </div>

      {/* Pain Points Section */}
      {content.painPoints.length > 0 && (
        <div className="py-16 px-8 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Sound familiar?
            </h2>
            <div className="space-y-4">
              {content.painPoints.map((point, i) => (
                <div
                  key={i}
                  className="p-4 bg-background rounded-lg border border-destructive/20 flex items-start gap-3"
                >
                  <span className="text-destructive text-xl">✗</span>
                  <p className="text-lg">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solution Section */}
      {content.solution && (
        <div className="py-16 px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">There&apos;s a better way</h2>
            <p className="text-lg text-muted-foreground">{content.solution}</p>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20 px-8 bg-gradient-to-t from-muted/50 to-background">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {content.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
          {content.socialProof && (
            <p className="text-sm text-muted-foreground mt-4">
              {content.socialProof}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureListTemplate({
  content,
  primaryColor,
  email,
  setEmail,
  submitted,
  loading,
  handleSubmit,
}: TemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="py-20 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {content.headline}
          </h1>
          {content.subheadline && (
            <p className="text-xl text-muted-foreground mb-8">
              {content.subheadline}
            </p>
          )}

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg max-w-md mx-auto">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  content.cta
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Features/Benefits Section */}
      {content.painPoints.length > 0 && (
        <div className="py-16 px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              What you&apos;ll get
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {content.painPoints.map((feature, i) => (
                <div
                  key={i}
                  className="p-6 bg-background rounded-xl border flex items-start gap-4"
                >
                  <div
                    className="p-2 rounded-lg text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solution Description */}
      {content.solution && (
        <div className="py-16 px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">{content.solution}</p>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="py-20 px-8 bg-gradient-to-t from-muted/50 to-background">
        <div className="max-w-xl mx-auto text-center">
          {!submitted && (
            <>
              <h2 className="text-3xl font-bold mb-6">Don&apos;t miss out</h2>
              <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: primaryColor }}
                  className="text-white hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {content.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
          {content.socialProof && (
            <p className="text-sm text-muted-foreground mt-4">
              {content.socialProof}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
