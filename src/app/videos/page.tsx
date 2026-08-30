"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Video, Plus, ExternalLink, BarChart3 } from "lucide-react";

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

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      const result = await response.json();
      if (result.success) {
        setDrafts(result.data.drafts);
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "scheduled":
        return "secondary";
      case "ready":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Manager</h1>
          <p className="text-muted-foreground">Manage all your video content</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4 mr-1" />
            New Video
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {["All", "Published", "Scheduled", "Drafts", "Failed"].map((tab) => (
          <Button key={tab} variant="ghost" size="sm">
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
      ) : drafts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
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
                  <Badge variant={getStatusColor(draft.status) as any}>
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
