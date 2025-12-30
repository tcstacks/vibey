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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, MessageSquare, Heart, Mail, Trash2, Edit, Plus } from "lucide-react";
import type { TwitterRelationship, TwitterInteraction } from "@/types";

interface RelationshipWithInteractions extends TwitterRelationship {
  interactions?: TwitterInteraction[];
}

interface Props {
  params: Promise<{ id: string }>;
}

const tierOptions = [
  { value: "whale", label: "Whale" },
  { value: "peer", label: "Peer" },
  { value: "fan", label: "Fan" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const interactionTypeOptions = [
  { value: "reply", label: "Reply" },
  { value: "like", label: "Like" },
  { value: "retweet", label: "Retweet" },
  { value: "quote", label: "Quote Tweet" },
  { value: "dm", label: "DM" },
  { value: "mention", label: "Mention" },
];

const directionOptions = [
  { value: "sent", label: "You to them" },
  { value: "received", label: "Them to you" },
];

export default function RelationshipDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [relationship, setRelationship] = useState<RelationshipWithInteractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingInteraction, setAddingInteraction] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    tier: "peer" as "whale" | "peer" | "fan",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    niche: "",
    notes: "",
    followsYou: false,
    youFollow: false,
  });

  const [interactionForm, setInteractionForm] = useState({
    type: "reply" as "reply" | "like" | "retweet" | "quote" | "dm" | "mention",
    direction: "sent" as "sent" | "received",
    content: "",
    tweetId: "",
  });

  useEffect(() => {
    fetch(`/api/twitter/relationships/${id}`)
      .then(r => r.json())
      .then(data => {
        setRelationship(data);
        setForm({
          displayName: data.displayName || "",
          tier: data.tier,
          priority: data.priority,
          niche: (data.niche || []).join(", "),
          notes: data.notes || "",
          followsYou: data.followsYou,
          youFollow: data.youFollow,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/twitter/relationships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          niche: form.niche.split(",").map(n => n.trim()).filter(Boolean),
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setRelationship({ ...relationship, ...updated });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    await fetch(`/api/twitter/relationships/${id}`, { method: "DELETE" });
    router.push("/twitter/relationships");
  };

  const handleAddInteraction = async () => {
    setAddingInteraction(true);
    try {
      await fetch("/api/twitter/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipId: id,
          ...interactionForm,
        }),
      });

      const response = await fetch(`/api/twitter/relationships/${id}`);
      const data = await response.json();
      setRelationship(data);
      setInteractionForm({ type: "reply", direction: "sent", content: "", tweetId: "" });
      setShowInteractionModal(false);
    } finally {
      setAddingInteraction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Relationship not found</p>
        <Link href="/twitter/relationships">
          <Button variant="link">Back to relationships</Button>
        </Link>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    whale: "bg-purple-100 text-purple-800",
    peer: "bg-blue-100 text-blue-800",
    fan: "bg-green-100 text-green-800",
  };

  const interactionIcon = (type: string) => {
    switch (type) {
      case "reply": return <MessageSquare className="h-4 w-4" />;
      case "like": return <Heart className="h-4 w-4" />;
      case "dm": return <Mail className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/twitter/relationships">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              {relationship.avatarUrl ? (
                <img src={relationship.avatarUrl} alt={relationship.handle} className="w-12 h-12 rounded-full" />
              ) : (
                <span className="text-xl font-medium">{relationship.handle[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {relationship.displayName || `@${relationship.handle}`}
              </h1>
              <p className="text-muted-foreground">@{relationship.handle}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{relationship.totalReplies || 0}</p>
            <p className="text-sm text-muted-foreground">Replies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{relationship.totalLikes || 0}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{relationship.totalDMs || 0}</p>
            <p className="text-sm text-muted-foreground">DMs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="interactions">Interactions ({relationship.interactions?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {editing ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tier</Label>
                      <Select
                        value={form.tier}
                        onChange={(e) => setForm({ ...form, tier: e.target.value as any })}
                        options={tierOptions}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                        options={priorityOptions}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Niches (comma-separated)</Label>
                      <Input
                        value={form.niche}
                        onChange={(e) => setForm({ ...form, niche: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={tierColors[relationship.tier]}>{relationship.tier}</Badge>
                    <Badge variant="outline">{relationship.priority} priority</Badge>
                    {relationship.followsYou && <Badge variant="secondary">Follows you</Badge>}
                    {relationship.youFollow && <Badge variant="secondary">You follow</Badge>}
                  </div>
                  {relationship.niche && relationship.niche.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Niches</p>
                      <div className="flex flex-wrap gap-2">
                        {relationship.niche.map((n, i) => (
                          <Badge key={i} variant="outline">{n}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {relationship.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Notes</p>
                      <p>{relationship.notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Added</p>
                      <p>{new Date(relationship.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Interaction</p>
                      <p>{relationship.lastInteraction ? new Date(relationship.lastInteraction).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interaction History</CardTitle>
                <CardDescription>Track your engagement with this contact</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowInteractionModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            </CardHeader>
            <CardContent>
              {!relationship.interactions || relationship.interactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No interactions logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relationship.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-muted rounded-lg">
                        {interactionIcon(interaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {interaction.direction === "sent" ? "You → Them" : "Them → You"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(interaction.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {interaction.content && (
                          <p className="text-sm text-muted-foreground">{interaction.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interaction Modal */}
      <Dialog open={showInteractionModal} onOpenChange={setShowInteractionModal}>
        <DialogContent onClose={() => setShowInteractionModal(false)}>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={interactionForm.type}
                  onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as any })}
                  options={interactionTypeOptions}
                />
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={interactionForm.direction}
                  onChange={(e) => setInteractionForm({ ...interactionForm, direction: e.target.value as any })}
                  options={directionOptions}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content (optional)</Label>
              <Textarea
                value={interactionForm.content}
                onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                placeholder="What was said..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInteractionModal(false)}>Cancel</Button>
            <Button onClick={handleAddInteraction} disabled={addingInteraction}>
              {addingInteraction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Interaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
