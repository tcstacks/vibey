"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Plus, Trash2, Calendar, Send, Save } from "lucide-react";
import type { Idea, Tweet } from "@/types";

const tweetTypeOptions = [
  { value: "standalone", label: "Single Tweet" },
  { value: "thread", label: "Thread" },
  { value: "reply", label: "Reply" },
  { value: "quote", label: "Quote Tweet" },
  { value: "bip-update", label: "Build in Public Update" },
];

export default function ComposePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  
  const [form, setForm] = useState({
    type: "standalone" as "standalone" | "thread" | "reply" | "quote" | "bip-update",
    content: "",
    ideaId: "",
    scheduledFor: "",
    status: "draft" as "draft" | "scheduled" | "published",
  });

  const [threadTweets, setThreadTweets] = useState<string[]>([""]);

  const ideaOptions = [
    { value: "", label: "None" },
    ...ideas.map(idea => ({ value: idea.id, label: idea.name })),
  ];

  useEffect(() => {
    Promise.all([
      fetch("/api/ideas").then(r => r.json()),
      fetch("/api/twitter/tweets").then(r => r.json()),
    ]).then(([ideasData, tweetsData]) => {
      setIdeas(ideasData);
      setTweets(tweetsData);
    });
  }, []);

  const charCount = form.content.length;
  const charLimit = 280;
  const isOverLimit = charCount > charLimit;

  const handleSubmit = async (status: "draft" | "scheduled" | "published") => {
    setLoading(true);

    try {
      if (form.type === "thread") {
        const threadId = `thread-${Date.now()}`;
        for (let i = 0; i < threadTweets.length; i++) {
          await fetch("/api/twitter/tweets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "thread",
              content: threadTweets[i],
              ideaId: form.ideaId || undefined,
              threadId,
              threadPosition: i + 1,
              status,
              scheduledFor: form.scheduledFor || undefined,
            }),
          });
        }
      } else {
        await fetch("/api/twitter/tweets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: form.type,
            content: form.content,
            ideaId: form.ideaId || undefined,
            status,
            scheduledFor: form.scheduledFor || undefined,
          }),
        });
      }

      router.push("/twitter");
    } catch (error) {
      console.error("Failed to save tweet:", error);
    } finally {
      setLoading(false);
    }
  };

  const addThreadTweet = () => {
    setThreadTweets([...threadTweets, ""]);
  };

  const removeThreadTweet = (index: number) => {
    if (threadTweets.length > 1) {
      setThreadTweets(threadTweets.filter((_, i) => i !== index));
    }
  };

  const updateThreadTweet = (index: number, value: string) => {
    const updated = [...threadTweets];
    updated[index] = value;
    setThreadTweets(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/twitter">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Compose Tweet</h1>
          <p className="text-muted-foreground">
            Create and schedule your content
          </p>
        </div>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({tweets.filter(t => t.status === "draft").length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({tweets.filter(t => t.status === "scheduled").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Tweet</CardTitle>
              <CardDescription>
                Write your tweet or create a thread
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    options={tweetTypeOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link to Idea (optional)</Label>
                  <Select
                    value={form.ideaId}
                    onChange={(e) => setForm({ ...form, ideaId: e.target.value })}
                    options={ideaOptions}
                  />
                </div>
              </div>

              {form.type === "thread" ? (
                <div className="space-y-4">
                  <Label>Thread Tweets</Label>
                  {threadTweets.map((tweet, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-muted-foreground w-6 pt-2">{index + 1}.</span>
                        <div className="flex-1">
                          <Textarea
                            value={tweet}
                            onChange={(e) => updateThreadTweet(index, e.target.value)}
                            placeholder="Write your tweet..."
                            rows={3}
                            className={tweet.length > charLimit ? "border-destructive" : ""}
                          />
                          <div className="flex justify-between mt-1">
                            <span className={`text-xs ${tweet.length > charLimit ? "text-destructive" : "text-muted-foreground"}`}>
                              {tweet.length}/{charLimit}
                            </span>
                            {threadTweets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeThreadTweet(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addThreadTweet}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tweet to Thread
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="What's happening?"
                    rows={4}
                    className={isOverLimit ? "border-destructive" : ""}
                  />
                  <div className="flex justify-end">
                    <span className={`text-sm ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                      {charCount}/{charLimit}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Schedule for (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                {form.scheduledFor ? (
                  <Button
                    onClick={() => handleSubmit("scheduled")}
                    disabled={loading || isOverLimit}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubmit("published")}
                    disabled={loading || isOverLimit}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Post Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Tweets</CardTitle>
              <CardDescription>Tweets saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              {tweets.filter(t => t.status === "draft").length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No drafts yet.</p>
              ) : (
                <div className="space-y-4">
                  {tweets.filter(t => t.status === "draft").map((tweet) => (
                    <div key={tweet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{tweet.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{tweet.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tweets</CardTitle>
              <CardDescription>Upcoming posts in your queue</CardDescription>
            </CardHeader>
            <CardContent>
              {tweets.filter(t => t.status === "scheduled").length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No scheduled tweets.</p>
              ) : (
                <div className="space-y-4">
                  {tweets.filter(t => t.status === "scheduled").map((tweet) => (
                    <div key={tweet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{tweet.type}</Badge>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {tweet.scheduledFor ? new Date(tweet.scheduledFor).toLocaleString() : "Not scheduled"}
                        </span>
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
