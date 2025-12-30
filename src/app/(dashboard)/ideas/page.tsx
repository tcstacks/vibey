"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Lightbulb,
  Plus,
  Search,
  ArrowRight,
  Trash2,
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

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "researching", label: "Researching" },
  { value: "testing", label: "Testing" },
  { value: "validating", label: "Validating" },
  { value: "validated", label: "Validated" },
  { value: "killed", label: "Killed" },
];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = () => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        setIdeas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const deleteIdea = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this idea?")) return;

    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    fetchIdeas();
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.name.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideas</h1>
          <p className="text-muted-foreground">
            Manage and track your business ideas
          </p>
        </div>
        <Link href="/ideas/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-40"
        />
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filteredIdeas.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {ideas.length === 0 ? "No ideas yet" : "No matching ideas"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {ideas.length === 0
                ? "Start by creating your first idea to validate"
                : "Try adjusting your search or filters"}
            </p>
            {ideas.length === 0 && (
              <Link href="/ideas/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Idea
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{idea.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {idea.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[idea.status] || "default"}>
                        {idea.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteIdea(idea.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
                      <p className="text-muted-foreground">Demand Score</p>
                      <p className="font-medium">{idea.metrics.demandScore}/100</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium">{idea.metrics.landingPageViews}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
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
  );
}
