"use client";

import { useState, useEffect } from "react";
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/firestore/notifications";
import type { Notification } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const markAllRead = async () => {
    if (!user?.uid) return;
    await markAllNotificationsRead(user.uid);
  };

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
