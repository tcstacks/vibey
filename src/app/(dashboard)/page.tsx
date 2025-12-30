"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  Plus,
} from "lucide-react";

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

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  researching: "secondary",
  testing: "default",
  validating: "warning",
  validated: "success",
  killed: "destructive",
};

const recommendationColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  kill: "destructive",
  pivot: "warning",
  continue: "default",
  accelerate: "success",
};

export default function Dashboard() {
  const [ideas, setIdeas] = useState<IdeaWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        setIdeas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalWaitlist = ideas.reduce((acc, idea) => acc + idea.metrics.waitlistSize, 0);
  const totalViews = ideas.reduce((acc, idea) => acc + idea.metrics.landingPageViews, 0);
  const avgConversion = ideas.length > 0
    ? ideas.reduce((acc, idea) => acc + idea.metrics.conversionRate, 0) / ideas.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your validation efforts
          </p>
        </div>
        <Link href="/ideas/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideas.length}</div>
            <p className="text-xs text-muted-foreground">
              {ideas.filter(i => i.status === "testing").length} in testing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Waitlist</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWaitlist}</div>
            <p className="text-xs text-muted-foreground">
              Across all ideas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Landing Page Views</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Total page views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Signup rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Ideas</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : ideas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first idea to validate
              </p>
              <Link href="/ideas/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Idea
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{idea.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {idea.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant={statusColors[idea.status] || "default"}>
                        {idea.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Waitlist</p>
                        <p className="font-medium">{idea.metrics.waitlistSize}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversion</p>
                        <p className="font-medium">{idea.metrics.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pain Points</p>
                        <p className="font-medium">{idea.metrics.painPointsCollected}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interviews</p>
                        <p className="font-medium">{idea.metrics.interviewsCompleted}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant={recommendationColors[idea.recommendation] || "default"}>
                        {idea.recommendation}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        View details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
