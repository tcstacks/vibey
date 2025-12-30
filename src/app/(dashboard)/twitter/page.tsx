"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { TwitterRelationship, Tweet, EngagementTarget } from "@/types";

interface TwitterMetrics {
  totalRelationships: number;
  whales: number;
  peers: number;
  fans: number;
  pendingEngagements: number;
  tweetsThisWeek: number;
  avgEngagementRate: number;
}

export default function TwitterPage() {
  const [metrics, setMetrics] = useState<TwitterMetrics | null>(null);
  const [relationships, setRelationships] = useState<TwitterRelationship[]>([]);
  const [pendingEngagements, setPendingEngagements] = useState<(EngagementTarget & { relationship?: { handle: string; displayName?: string; tier: string } })[]>([]);
  const [scheduledTweets, setScheduledTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/twitter/metrics").then(r => r.json()),
      fetch("/api/twitter/relationships?priority=high").then(r => r.json()),
      fetch("/api/twitter/engagement?pending=true").then(r => r.json()),
      fetch("/api/twitter/tweets?status=scheduled").then(r => r.json()),
    ]).then(([metricsData, relationshipsData, engagementsData, tweetsData]) => {
      setMetrics(metricsData);
      setRelationships(relationshipsData);
      setPendingEngagements(engagementsData);
      setScheduledTweets(tweetsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Twitter Growth Engine</h1>
          <p className="text-muted-foreground">
            Build relationships, create content, and grow your audience
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/twitter/relationships/new">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </Link>
          <Link href="/twitter/compose">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tweet
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Relationships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRelationships || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.whales || 0} whales, {metrics?.peers || 0} peers, {metrics?.fans || 0} fans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Engagements</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pendingEngagements || 0}</div>
            <p className="text-xs text-muted-foreground">
              Replies waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tweets This Week</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.tweetsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Content published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.avgEngagementRate || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement Queue</TabsTrigger>
          <TabsTrigger value="relationships">Key Relationships</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Tweets</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Engagements</CardTitle>
              <CardDescription>
                Reply to these tweets to maintain your relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingEngagements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>All caught up! No pending engagements.</p>
                  <Link href="/twitter/engagement">
                    <Button variant="link">Browse engagement queue</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEngagements.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            @{item.relationship?.handle || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.relationship?.tier || "peer"}
                          </Badge>
                          <Badge variant={item.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.targetTweetContent?.slice(0, 200)}...
                        </p>
                        {item.suggestedReply && (
                          <div className="bg-muted p-3 rounded-lg text-sm">
                            <span className="text-xs text-muted-foreground block mb-1">Suggested reply:</span>
                            {item.suggestedReply}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Skip</Button>
                        <Button size="sm">Reply</Button>
                      </div>
                    </div>
                  ))}
                  {pendingEngagements.length > 5 && (
                    <Link href="/twitter/engagement">
                      <Button variant="outline" className="w-full">
                        View all {pendingEngagements.length} engagements
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Relationships</CardTitle>
              <CardDescription>
                Your most important connections to nurture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relationships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No relationships added yet.</p>
                  <Link href="/twitter/relationships/new">
                    <Button variant="link">Add your first contact</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {relationships.slice(0, 10).map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/twitter/relationships/${rel.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {rel.avatarUrl ? (
                            <img src={rel.avatarUrl} alt={rel.handle} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-lg font-medium">{rel.handle[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rel.displayName || `@${rel.handle}`}</span>
                            <Badge variant="outline" className="text-xs">
                              {rel.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{rel.handle}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {rel.lastInteraction ? (
                          <span>Last: {new Date(rel.lastInteraction).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-amber-500">No interaction yet</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <Link href="/twitter/relationships">
                    <Button variant="outline" className="w-full mt-2">
                      View all relationships
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tweets</CardTitle>
              <CardDescription>
                Upcoming content in your queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledTweets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No scheduled tweets.</p>
                  <Link href="/twitter/compose">
                    <Button variant="link">Schedule your first tweet</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledTweets.map((tweet) => (
                    <div key={tweet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {tweet.scheduledFor ? new Date(tweet.scheduledFor).toLocaleString() : "Not scheduled"}
                        </span>
                        <Badge variant="outline">{tweet.type}</Badge>
                      </div>
                      <p className="text-sm">{tweet.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
