import {
  collection, doc, addDoc, getDocs, updateDoc,
  query, where, orderBy, onSnapshot, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification, NotificationType } from "@/types";

const COL = "notifications";

/** Create a notification for a user */
export async function createNotification(data: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get all notifications for a user */
export async function getUserNotifications(userId: string, maxCount = 30): Promise<Notification[]> {
  const q = query(
    collection(db, COL),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

/** Mark a single notification as read */
export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { isRead: true });
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(collection(db, COL), where("userId", "==", userId), where("isRead", "==", false));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
}

/** Subscribe to real-time notifications for a user — returns unsubscribe fn */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  const q = query(
    collection(db, COL),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
  });
}
