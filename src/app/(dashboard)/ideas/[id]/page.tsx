"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Target,
  Zap,
  Edit,
} from "lucide-react";
import type {
  PainPoint,
  LandingPage,
  WaitlistEntry,
  Interview,
  Competitor,
  Content,
} from "@/types";

interface IdeaWithMetrics {
  id: string;
  name: string;
  description: string;
  status: string;
  hypothesis: string;
  createdAt: string;
  updatedAt: string;
  metrics: {
    painPointsCollected: number;
    competitorsTracked: number;
    waitlistSize: number;
    interviewsCompleted: number;
    contentPublished: number;
    landingPageViews: number;
    conversionRate: number;
    demandScore: number;
  };
  recommendation: string;
}

interface LandingPageWithStats extends LandingPage {
  stats: { views: number; ctaClicks: number; signups: number };
}

const statusOptions = [
  { value: "researching", label: "Researching" },
  { value: "testing", label: "Testing" },
  { value: "validating", label: "Validating" },
  { value: "validated", label: "Validated" },
  { value: "killed", label: "Killed" },
];

const intensityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const templateOptions = [
  { value: "minimal", label: "Minimal" },
  { value: "feature-list", label: "Feature List" },
  { value: "problem-agitate-solve", label: "Problem-Agitate-Solve" },
];

const contentTypeOptions = [
  { value: "twitter-thread", label: "Twitter Thread" },
  { value: "linkedin-post", label: "LinkedIn Post" },
  { value: "blog-post", label: "Blog Post" },
  { value: "newsletter", label: "Newsletter" },
];

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [idea, setIdea] = useState<IdeaWithMetrics | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageWithStats[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [contentPieces, setContentPieces] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showPainPointModal, setShowPainPointModal] = useState(false);
  const [showLandingPageModal, setShowLandingPageModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [ideaRes, painRes, lpRes, waitRes, intRes, compRes, contRes] = await Promise.all([
        fetch(`/api/ideas/${id}`),
        fetch(`/api/ideas/${id}/pain-points`),
        fetch(`/api/ideas/${id}/landing-pages`),
        fetch(`/api/ideas/${id}/waitlist`),
        fetch(`/api/ideas/${id}/interviews`),
        fetch(`/api/ideas/${id}/competitors`),
        fetch(`/api/ideas/${id}/content`),
      ]);

      if (!ideaRes.ok) {
        router.push("/ideas");
        return;
      }

      setIdea(await ideaRes.json());
      setPainPoints(await painRes.json());
      setLandingPages(await lpRes.json());
      setWaitlist(await waitRes.json());
      setInterviews(await intRes.json());
      setCompetitors(await compRes.json());
      setContentPieces(await contRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !idea) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/ideas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{idea.name}</h1>
              <Badge>{idea.status}</Badge>
              <Badge variant={
                idea.recommendation === "accelerate" ? "success" :
                idea.recommendation === "kill" ? "destructive" :
                idea.recommendation === "pivot" ? "warning" : "secondary"
              }>
                {idea.recommendation}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{idea.description}</p>
            {idea.hypothesis && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                &quot;{idea.hypothesis}&quot;
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditModal(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pain Points</span>
            </div>
            <p className="text-2xl font-bold mt-1">{idea.metrics.painPointsCollected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <p className="text-2xl font-bold mt-1">{idea.metrics.landingPageViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Waitlist</span>
            </div>
            <p className="text-2xl font-bold mt-1">{idea.metrics.waitlistSize}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Conversion</span>
            </div>
            <p className="text-2xl font-bold mt-1">{idea.metrics.conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Demand Score</span>
            </div>
            <p className="text-2xl font-bold mt-1">{idea.metrics.demandScore}/100</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="research">
        <TabsList>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="traction">Traction</TabsTrigger>
        </TabsList>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-6">
          {/* Pain Points */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pain Points</CardTitle>
                <CardDescription>Problems and frustrations from your research</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowPainPointModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {painPoints.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pain points collected yet
                </p>
              ) : (
                <div className="space-y-3">
                  {painPoints.map((point) => (
                    <div key={point.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p>{point.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{point.intensity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {point.sourceType}
                          </span>
                          {point.sourceUrl && (
                            <a
                              href={point.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center"
                            >
                              Source <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          await fetch(`/api/pain-points/${point.id}`, { method: "DELETE" });
                          fetchAll();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competitors</CardTitle>
                <CardDescription>Track and analyze your competition</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCompetitorModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No competitors tracked yet
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {competitors.map((comp) => (
                    <div key={comp.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{comp.name}</h4>
                          {comp.url && (
                            <a
                              href={comp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center"
                            >
                              {comp.url} <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await fetch(`/api/competitors/${comp.id}`, { method: "DELETE" });
                            fetchAll();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {comp.pricing && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ${comp.pricing.lowestTier} - ${comp.pricing.highestTier} ({comp.pricing.model})
                        </p>
                      )}
                      {comp.weaknesses.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Weaknesses:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comp.weaknesses.map((w, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{w}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          {/* Landing Pages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Landing Pages</CardTitle>
                <CardDescription>Test your messaging and capture leads</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowLandingPageModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </CardHeader>
            <CardContent>
              {landingPages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No landing pages created yet
                </p>
              ) : (
                <div className="space-y-4">
                  {landingPages.map((page) => (
                    <div key={page.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{page.content.headline}</h4>
                            <Badge variant={page.status === "live" ? "success" : "secondary"}>
                              {page.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">/v/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/v/${page.slug}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Link href={`/v/${page.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await fetch(`/api/landing-pages/${page.id}`, { method: "DELETE" });
                              fetchAll();
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="font-medium">{page.stats.views}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Signups</p>
                          <p className="font-medium">{page.stats.signups}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion</p>
                          <p className="font-medium">
                            {page.stats.views > 0
                              ? ((page.stats.signups / page.stats.views) * 100).toFixed(1)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waitlist */}
          <Card>
            <CardHeader>
              <CardTitle>Waitlist ({waitlist.length})</CardTitle>
              <CardDescription>People interested in your idea</CardDescription>
            </CardHeader>
            <CardContent>
              {waitlist.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No waitlist signups yet
                </p>
              ) : (
                <div className="space-y-2">
                  {waitlist.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{entry.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.signedUpAt).toLocaleDateString()}
                          {entry.source.utmSource && ` via ${entry.source.utmSource}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          await fetch(`/api/waitlist/${entry.id}`, { method: "DELETE" });
                          fetchAll();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {waitlist.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground">
                      And {waitlist.length - 10} more...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interviews</CardTitle>
                <CardDescription>Customer discovery conversations</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowInterviewModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </CardHeader>
            <CardContent>
              {interviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No interviews scheduled yet
                </p>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{interview.contactName || interview.contactEmail}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                              interview.status === "completed" ? "success" :
                              interview.status === "scheduled" ? "default" : "secondary"
                            }>
                              {interview.status}
                            </Badge>
                            {interview.scheduledAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(interview.scheduledAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await fetch(`/api/interviews/${interview.id}`, { method: "DELETE" });
                            fetchAll();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {interview.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {interview.notes}
                        </p>
                      )}
                      {interview.insights.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {interview.insights.map((insight, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traction Tab */}
        <TabsContent value="traction" className="space-y-6">
          {/* Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Content</CardTitle>
                <CardDescription>Marketing content for distribution</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowContentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </CardHeader>
            <CardContent>
              {contentPieces.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No content created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {contentPieces.map((piece) => (
                    <div key={piece.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{piece.type}</Badge>
                            <Badge variant={
                              piece.status === "published" ? "success" :
                              piece.status === "scheduled" ? "default" : "secondary"
                            }>
                              {piece.status}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2 line-clamp-3">{piece.body}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await fetch(`/api/content/${piece.id}`, { method: "DELETE" });
                            fetchAll();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PainPointModal
        open={showPainPointModal}
        onClose={() => setShowPainPointModal(false)}
        ideaId={id}
        onSuccess={fetchAll}
      />
      <LandingPageModal
        open={showLandingPageModal}
        onClose={() => setShowLandingPageModal(false)}
        ideaId={id}
        onSuccess={fetchAll}
      />
      <CompetitorModal
        open={showCompetitorModal}
        onClose={() => setShowCompetitorModal(false)}
        ideaId={id}
        onSuccess={fetchAll}
      />
      <InterviewModal
        open={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        ideaId={id}
        onSuccess={fetchAll}
      />
      <ContentModal
        open={showContentModal}
        onClose={() => setShowContentModal(false)}
        ideaId={id}
        onSuccess={fetchAll}
      />
      <EditIdeaModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        idea={idea}
        onSuccess={fetchAll}
      />
    </div>
  );
}

// Modal Components
function PainPointModal({
  open,
  onClose,
  ideaId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    description: "",
    sourceUrl: "",
    sourceType: "manual",
    intensity: "medium",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${ideaId}/pain-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ description: "", sourceUrl: "", sourceType: "manual", intensity: "medium" });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Add Pain Point</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Description *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What frustration did you discover?"
              required
            />
          </div>
          <div>
            <Label>Source URL</Label>
            <Input
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source Type</Label>
              <Input
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                placeholder="reddit, interview, etc."
              />
            </div>
            <div>
              <Label>Intensity</Label>
              <Select
                value={form.intensity}
                onChange={(e) => setForm({ ...form, intensity: e.target.value })}
                options={intensityOptions}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.description}>
              {loading ? "Adding..." : "Add Pain Point"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LandingPageModal({
  open,
  onClose,
  ideaId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    headline: "",
    subheadline: "",
    painPoints: "",
    solution: "",
    cta: "Join the Waitlist",
    template: "minimal",
    primaryColor: "#3b82f6",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${ideaId}/landing-pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          headline: form.headline,
          subheadline: form.subheadline,
          painPoints: form.painPoints.split("\n").filter(Boolean),
          solution: form.solution,
          cta: form.cta,
        },
        design: {
          template: form.template,
          primaryColor: form.primaryColor,
        },
        status: "live",
      }),
    });
    setForm({
      headline: "",
      subheadline: "",
      painPoints: "",
      solution: "",
      cta: "Join the Waitlist",
      template: "minimal",
      primaryColor: "#3b82f6",
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Landing Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Headline *</Label>
            <Input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="The main value proposition"
              required
            />
          </div>
          <div>
            <Label>Subheadline</Label>
            <Input
              value={form.subheadline}
              onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
              placeholder="Supporting text"
            />
          </div>
          <div>
            <Label>Pain Points (one per line)</Label>
            <Textarea
              value={form.painPoints}
              onChange={(e) => setForm({ ...form, painPoints: e.target.value })}
              placeholder="Frustrated with X?&#10;Tired of Y?"
              rows={3}
            />
          </div>
          <div>
            <Label>Solution</Label>
            <Textarea
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              placeholder="How your solution helps"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>CTA Text</Label>
              <Input
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
              />
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                options={templateOptions}
              />
            </div>
            <div>
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.headline}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompetitorModal({
  open,
  onClose,
  ideaId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    url: "",
    pricingModel: "subscription",
    lowestTier: "",
    highestTier: "",
    weaknesses: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${ideaId}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        url: form.url,
        pricing: form.lowestTier ? {
          model: form.pricingModel,
          lowestTier: parseFloat(form.lowestTier),
          highestTier: parseFloat(form.highestTier) || parseFloat(form.lowestTier),
        } : undefined,
        weaknesses: form.weaknesses.split("\n").filter(Boolean),
      }),
    });
    setForm({ name: "", url: "", pricingModel: "subscription", lowestTier: "", highestTier: "", weaknesses: "" });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Website URL</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Pricing Model</Label>
              <Select
                value={form.pricingModel}
                onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                options={[
                  { value: "subscription", label: "Subscription" },
                  { value: "one-time", label: "One-time" },
                  { value: "usage", label: "Usage-based" },
                  { value: "freemium", label: "Freemium" },
                ]}
              />
            </div>
            <div>
              <Label>Lowest Tier ($)</Label>
              <Input
                type="number"
                value={form.lowestTier}
                onChange={(e) => setForm({ ...form, lowestTier: e.target.value })}
              />
            </div>
            <div>
              <Label>Highest Tier ($)</Label>
              <Input
                type="number"
                value={form.highestTier}
                onChange={(e) => setForm({ ...form, highestTier: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Weaknesses (one per line)</Label>
            <Textarea
              value={form.weaknesses}
              onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
              placeholder="Poor customer support&#10;Missing feature X"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.name}>
              {loading ? "Adding..." : "Add Competitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InterviewModal({
  open,
  onClose,
  ideaId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    contactName: "",
    contactEmail: "",
    scheduledAt: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${ideaId}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      }),
    });
    setForm({ contactName: "", contactEmail: "", scheduledAt: "", notes: "" });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Contact Name</Label>
            <Input
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            />
          </div>
          <div>
            <Label>Scheduled Date/Time</Label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContentModal({
  open,
  onClose,
  ideaId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    type: "twitter-thread",
    body: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${ideaId}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ type: "twitter-thread", body: "" });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Create Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={contentTypeOptions}
            />
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write your content..."
              rows={6}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.body}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditIdeaModal({
  open,
  onClose,
  idea,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  idea: IdeaWithMetrics;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: idea.name,
    description: idea.description,
    hypothesis: idea.hypothesis,
    status: idea.status,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      name: idea.name,
      description: idea.description,
      hypothesis: idea.hypothesis,
      status: idea.status,
    });
  }, [idea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Hypothesis</Label>
            <Textarea
              value={form.hypothesis}
              onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={statusOptions}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.name}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
