"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { Bell, Check } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setError("");
    try {
      const response = await fetch("/api/notifications");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Failed to load notifications");
      setNotifications(result.data.notifications);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Inbox</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Notifications</h1>
        <p className="mt-2 text-muted-foreground">Useful nudges, nothing noisy.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center"><Bell className="mx-auto mb-4 h-10 w-10 text-primary" /><h3 className="font-display text-2xl">Your inbox is out of reach</h3><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => { setLoading(true); fetchNotifications(); }}>Try again</Button></Card>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${
                !notification.read ? "border-primary/20 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className={`h-5 w-5 ${notification.read ? "text-muted-foreground" : "text-primary"}`} />
                  <div>
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">You are all caught up!</p>
        </Card>
      )}
    </div>
  );
}
