"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Search, Users, ArrowLeft } from "lucide-react";
import type { TwitterRelationship } from "@/types";

const filterOptions = [
  { value: "all", label: "All tiers" },
  { value: "whale", label: "Whales" },
  { value: "peer", label: "Peers" },
  { value: "fan", label: "Fans" },
];

export default function RelationshipsPage() {
  const [relationships, setRelationships] = useState<TwitterRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const url = filter === "all"
      ? "/api/twitter/relationships"
      : `/api/twitter/relationships?tier=${filter}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setRelationships(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const filteredRelationships = relationships.filter(rel =>
    rel.handle.toLowerCase().includes(search.toLowerCase()) ||
    rel.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const tierColors: Record<string, string> = {
    whale: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    peer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    fan: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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
          <h1 className="text-3xl font-bold">Relationships</h1>
          <p className="text-muted-foreground">
            Manage your Twitter network
          </p>
        </div>
        <Link href="/twitter/relationships/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by handle or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={filterOptions}
          className="w-40"
        />
      </div>

      {filteredRelationships.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground mb-4">
              {search ? "No relationships match your search." : "No relationships added yet."}
            </p>
            {!search && (
              <Link href="/twitter/relationships/new">
                <Button>Add your first contact</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRelationships.map((rel) => (
            <Link key={rel.id} href={`/twitter/relationships/${rel.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      {rel.avatarUrl ? (
                        <img src={rel.avatarUrl} alt={rel.handle} className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-xl font-medium">{rel.handle[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">
                          {rel.displayName || `@${rel.handle}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">@{rel.handle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={tierColors[rel.tier] || ""}>
                          {rel.tier}
                        </Badge>
                        <Badge variant="outline">{rel.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="font-medium">{rel.totalReplies || 0}</p>
                      <p className="text-muted-foreground text-xs">Replies</p>
                    </div>
                    <div>
                      <p className="font-medium">{rel.totalLikes || 0}</p>
                      <p className="text-muted-foreground text-xs">Likes</p>
                    </div>
                    <div>
                      <p className="font-medium">{rel.totalDMs || 0}</p>
                      <p className="text-muted-foreground text-xs">DMs</p>
                    </div>
                  </div>
                  {rel.niche && rel.niche.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {rel.niche.slice(0, 3).map((n, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
