"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export default function NotificationList() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        🔔 No notifications yet
      </div>
    );
  }

  const visible = expanded ? notifications : notifications.slice(0, 4);

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <button
          onClick={markAllRead}
          className="text-xs text-primary hover:underline w-full text-right"
        >
          Mark all as read
        </button>
      )}
      {visible.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.isRead && markRead(n.id)}
          className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
            n.isRead ? "opacity-60" : "bg-primary/5 border border-primary/10"
          }`}
        >
          <div className="text-xl">{getNotifIcon(n.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{n.title}</p>
            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(n.createdAt)}</p>
          </div>
          {!n.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
      ))}
      {notifications.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline w-full text-center pt-1"
        >
          {expanded ? "Show less" : `Show ${notifications.length - 4} more`}
        </button>
      )}
    </div>
  );
}

function getNotifIcon(type: string): string {
  const map: Record<string, string> = {
    order_placed: "🛒", order_confirmed: "✅", order_cancelled: "❌",
    order_completed: "🎉", aid_status_changed: "📋", new_message: "💬",
    price_alert: "📈", forum_answer: "💡",
  };
  return map[type] ?? "🔔";
}
