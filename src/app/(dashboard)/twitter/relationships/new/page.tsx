"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

const tierOptions = [
  { value: "whale", label: "Whale (10k+ followers)" },
  { value: "peer", label: "Peer (similar audience)" },
  { value: "fan", label: "Fan (engaged follower)" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function NewRelationshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    handle: "",
    displayName: "",
    tier: "peer" as "whale" | "peer" | "fan",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    niche: "",
    followsYou: false,
    youFollow: false,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/twitter/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          handle: form.handle.replace("@", ""),
          niche: form.niche.split(",").map(n => n.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create relationship");
      }

      router.push("/twitter/relationships");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/twitter/relationships">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Contact</h1>
          <p className="text-muted-foreground">
            Add a new Twitter relationship to track
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>
            Enter the details of the Twitter account you want to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="handle">Twitter Handle *</Label>
                <Input
                  id="handle"
                  placeholder="@username"
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tier">Tier *</Label>
                <Select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value as any })}
                  options={tierOptions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  options={priorityOptions}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Niches (comma-separated)</Label>
              <Input
                id="niche"
                placeholder="SaaS, AI, Indie Hackers"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="followsYou"
                  checked={form.followsYou}
                  onChange={(e) => setForm({ ...form, followsYou: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="followsYou">Follows you</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="youFollow"
                  checked={form.youFollow}
                  onChange={(e) => setForm({ ...form, youFollow: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="youFollow">You follow them</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes about this contact..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/twitter/relationships">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Contact
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
