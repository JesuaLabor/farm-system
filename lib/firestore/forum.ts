import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { ForumPost, ForumAnswer } from "@/types";

const COL = "forum_posts";

export async function createForumPost(
  data: Omit<ForumPost, "id" | "createdAt" | "answers" | "answerCount" | "views" | "isResolved">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COL), {
    ...data,
    answers: [],
    answerCount: 0,
    views: 0,
    isResolved: false,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getForumPosts(opts?: { tag?: string; pageSize?: number }): Promise<ForumPost[]> {
  const { pageSize = 20 } = opts ?? {};
  const q = query(collection(getDb(), COL), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  let posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
  if (opts?.tag) posts = posts.filter((p) => p.tags.includes(opts.tag!));
  return posts;
}

export async function getForumPost(id: string): Promise<ForumPost | null> {
  const snap = await getDoc(doc(getDb(), COL, id));
  if (!snap.exists()) return null;
  await updateDoc(doc(getDb(), COL, id), { views: increment(1) });
  return { id: snap.id, ...snap.data() } as ForumPost;
}

export async function addForumAnswer(
  postId: string,
  answer: Omit<ForumAnswer, "createdAt" | "upvotes" | "isBestAnswer">
): Promise<void> {
  const fullAnswer: ForumAnswer = { ...answer, upvotes: 0, isBestAnswer: false, createdAt: new Date().toISOString() };
  await updateDoc(doc(getDb(), COL, postId), {
    answers: arrayUnion(fullAnswer),
    answerCount: increment(1),
  });
}

export async function markForumResolved(postId: string): Promise<void> {
  await updateDoc(doc(getDb(), COL, postId), { isResolved: true });
}

export async function getUnansweredPosts(pageSize = 20): Promise<ForumPost[]> {
  const q = query(collection(getDb(), COL), where("answerCount", "==", 0), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
}
