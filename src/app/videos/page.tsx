"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Video, Plus, RefreshCw } from "lucide-react";

interface VideoDraft {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function VideosPage() {
  const [drafts, setDrafts] = useState<VideoDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setError("");
    try {
      const response = await fetch("/api/drafts");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Failed to load drafts");
      setDrafts(result.data.drafts);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "published":
        return "default";
      case "scheduled":
        return "secondary";
      case "ready":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };
  const statusFilter: Record<string, string> = { Published: "published", Scheduled: "scheduled", Drafts: "draft", Failed: "failed" };
  const filteredDrafts = drafts.filter((draft) => activeTab === "All" || draft.status === statusFilter[activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Your library</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Video manager</h1>
          <p className="mt-2 text-muted-foreground">Keep every upload moving toward publish.</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4 mr-1" />
            New Video
          </Link>
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-2">
        {["All", "Published", "Scheduled", "Drafts", "Failed"].map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
            {tab}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center"><RefreshCw className="mx-auto mb-4 h-10 w-10 text-primary" /><h3 className="font-display text-2xl">Could not load your library</h3><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => { setLoading(true); fetchDrafts(); }}>Try again</Button></Card>
      ) : filteredDrafts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium line-clamp-1">
                      {draft.title || "Untitled Video"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(draft.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                   <Badge variant={getStatusColor(draft.status)}>
                    {draft.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-4">Create your first video to get started</p>
          <Button asChild>
            <Link href="/create">Create Video</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
