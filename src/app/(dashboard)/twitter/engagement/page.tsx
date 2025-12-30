"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, SkipForward, ExternalLink, MessageSquare, Clock } from "lucide-react";
import type { EngagementTarget } from "@/types";

interface EnrichedEngagement extends Omit<EngagementTarget, "relationship"> {
  relationship?: {
    handle: string;
    displayName?: string;
    tier: string;
  };
}

export default function EngagementPage() {
  const [engagements, setEngagements] = useState<EnrichedEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      const response = await fetch("/api/twitter/engagement");
      const data = await response.json();
      setEngagements(data);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    await fetch(`/api/twitter/engagement/${id}?action=complete`, { method: "PATCH" });
    fetchEngagements();
  };

  const handleSkip = async (id: string) => {
    await fetch(`/api/twitter/engagement/${id}?action=skip`, { method: "PATCH" });
    fetchEngagements();
  };

  const pendingEngagements = engagements.filter(e => e.status === "pending");
  const completedEngagements = engagements.filter(e => e.status === "completed");
  const skippedEngagements = engagements.filter(e => e.status === "skipped");

  const priorityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/twitter">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Engagement Queue</h1>
          <p className="text-muted-foreground">
            Reply to tweets from your network
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingEngagements.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedEngagements.length})
          </TabsTrigger>
          <TabsTrigger value="skipped">
            Skipped ({skippedEngagements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingEngagements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-muted-foreground">
                  No pending engagements. Check back later or add new targets.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingEngagements.map((engagement) => (
              <Card key={engagement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-medium">
                        {engagement.relationship?.handle?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          @{engagement.relationship?.handle || "Unknown"}
                        </span>
                        {engagement.relationship?.tier && (
                          <Badge variant="outline">{engagement.relationship.tier}</Badge>
                        )}
                        <Badge className={priorityColors[engagement.priority] || ""}>
                          {engagement.priority}
                        </Badge>
                        {engagement.dueBy && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(engagement.dueBy).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {engagement.targetTweetContent && (
                        <div className="p-3 bg-muted rounded-lg mb-3">
                          <p className="text-sm">{engagement.targetTweetContent}</p>
                          {engagement.targetTweetPostedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Posted: {new Date(engagement.targetTweetPostedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {engagement.suggestedReply && (
                        <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Suggested reply:</p>
                          <p className="text-sm">{engagement.suggestedReply}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleComplete(engagement.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSkip(engagement.id)}>
                          <SkipForward className="h-4 w-4 mr-2" />
                          Skip
                        </Button>
                        {engagement.targetTweetId && (
                          <a
                            href={`https://twitter.com/i/web/status/${engagement.targetTweetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on X
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedEngagements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No completed engagements yet.</p>
              </CardContent>
            </Card>
          ) : (
            completedEngagements.map((engagement) => (
              <Card key={engagement.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          @{engagement.relationship?.handle || "Unknown"}
                        </span>
                        <Badge variant="outline" className="bg-green-50">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {engagement.targetTweetContent || "No content"}
                      </p>
                      {engagement.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed: {new Date(engagement.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="skipped" className="space-y-4">
          {skippedEngagements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <SkipForward className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No skipped engagements.</p>
              </CardContent>
            </Card>
          ) : (
            skippedEngagements.map((engagement) => (
              <Card key={engagement.id} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <SkipForward className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          @{engagement.relationship?.handle || "Unknown"}
                        </span>
                        <Badge variant="secondary">Skipped</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {engagement.targetTweetContent || "No content"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
