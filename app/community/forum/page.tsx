"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getForumPosts, createForumPost } from "@/lib/firestore/forum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import NavBar from "@/components/dashboard/NavBar";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { ForumPost } from "@/types";
import Link from "next/link";

const TAGS = ["All", "Pest Control", "Soil Health", "Irrigation", "Harvesting", "Market", "Seeds", "Weather"];
const ROLE_BADGE: Record<string, string> = {
  expert: "bg-purple-100 text-purple-700",
  lgu: "bg-blue-100 text-blue-700",
  farmer: "bg-green-100 text-green-700",
};

export default function ForumPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ title: "", body: "", tag: "Pest Control" });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  useEffect(() => {
    getForumPosts({ pageSize: 30 })
      .then(setPosts)
      .catch(() => toast.error("Failed to load forum posts."))
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) { toast.error("Please login to post."); return; }
    if (!form.title.trim() || !form.body.trim()) { toast.error("Please fill in all fields."); return; }

    setSubmitting(true);
    try {
      await createForumPost({
        authorId: user.uid,
        authorName: profile.name,
        authorRole: profile.role,
        title: form.title,
        body: form.body,
        tags: [form.tag],
      });
      toast.success("Question posted! 🌱");
      setForm({ title: "", body: "", tag: "Pest Control" });
      setShowForm(false);
      // Refresh posts
      const refreshed = await getForumPosts({ pageSize: 30 });
      setPosts(refreshed);
    } catch {
      toast.error("Failed to post question.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = activeTag === "All"
    ? posts
    : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Farmer Forum & Q&A</h1>
            <p className="text-muted-foreground">Share knowledge and get advice from agricultural experts.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "primary"}>
            {showForm ? "Cancel" : "Ask a Question"}
          </Button>
        </div>

        {/* Tag Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border hover:bg-muted text-foreground"
              }`}>
              {tag}
            </button>
          ))}
        </div>

        {/* Post Question Form */}
        {showForm && (
          <Card className="mb-6 border-primary/20 bg-primary/5 animate-in">
            <CardHeader><CardTitle>Ask the Community</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePost} className="space-y-4">
                <Input label="Question Title" placeholder="e.g. How do I deal with brown planthopper in rice?"
                  value={form.title} onChange={(e) => set("title", e.target.value)} required />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tag</label>
                  <select value={form.tag} onChange={(e) => set("tag", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {TAGS.filter((t) => t !== "All").map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Describe your problem in detail</label>
                  <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={4} required
                    placeholder="Provide details — what crop, what symptoms, what you've tried..."
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button type="submit" className="w-full" isLoading={submitting}>Post Question</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💬" title={activeTag === "All" ? "The forum is quiet" : `No posts tagged "${activeTag}"`}
            description="Be the first to ask a question!"
            actionLabel="Ask a Question" onAction={() => setShowForm(true)} />
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <Link key={post.id} href={`/community/forum/${post.id}`}>
                <Card className="hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Answer count badge */}
                      <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-2xl flex-shrink-0 border-2 transition-colors ${
                        post.answerCount > 0 ? "border-primary/20 bg-primary/5 text-primary" : "border-muted bg-muted text-muted-foreground"
                      } group-hover:border-primary/30`}>
                        <span className="text-lg font-bold">{post.answerCount}</span>
                        <span className="text-[9px] font-medium uppercase tracking-wide">ans</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {post.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                              {tag}
                            </span>
                          ))}
                          {post.isResolved && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">✓ Resolved</span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{post.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[post.authorRole] ?? "bg-muted text-muted-foreground"}`}>
                            {post.authorRole}
                          </span>
                          <span className="text-xs text-muted-foreground">{post.authorName}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">· {post.views} views</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
