"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getLguAidPrograms, getProgramApplications,
  createAidProgram, reviewApplication, setAidProgramPublished,
} from "@/lib/firestore/aid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import NavBar from "@/components/dashboard/NavBar";
import { getApplicationStatusMeta, formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { AidProgram, AidApplication, AidType, ApplicationStatus } from "@/types";

const AID_TYPES: AidType[] = ["subsidy", "loan", "seed", "training", "other"];

export default function LGUAidManagementPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<AidProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AidProgram | null>(null);
  const [applications, setApplications] = useState<AidApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    title: "", description: "", type: "subsidy" as AidType,
    eligibility: "", requiredDocuments: "", deadline: "",
    slotsAvailable: "", contactPerson: "",
  });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  useEffect(() => {
    if (!user?.uid) return;
    getLguAidPrograms(user.uid)
      .then(setPrograms)
      .catch(() => toast.error("Failed to load programs."))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const loadApplications = async (program: AidProgram) => {
    setSelectedProgram(program);
    setAppsLoading(true);
    try {
      setApplications(await getProgramApplications(program.id));
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const docs = form.requiredDocuments.split("\n").map((d) => d.trim()).filter(Boolean);
      await createAidProgram({
        title: form.title, description: form.description, type: form.type,
        eligibility: form.eligibility, requiredDocuments: docs,
        deadline: form.deadline, slotsAvailable: Number(form.slotsAvailable),
        contactPerson: form.contactPerson, managedBy: user.uid, isPublished: false,
      });
      toast.success("Program created! It will be published after review.");
      setCreateOpen(false);
      setForm({ title: "", description: "", type: "subsidy", eligibility: "", requiredDocuments: "", deadline: "", slotsAvailable: "", contactPerson: "" });
      setPrograms(await getLguAidPrograms(user.uid));
    } catch {
      toast.error("Failed to create program.");
    } finally {
      setCreating(false);
    }
  };

  const handlePublishToggle = async (p: AidProgram) => {
    await setAidProgramPublished(p.id, !p.isPublished);
    setPrograms((prev) => prev.map((x) => x.id === p.id ? { ...x, isPublished: !x.isPublished } : x));
    toast.success(p.isPublished ? "Program unpublished." : "Program published! ✅");
  };

  const handleReview = async (app: AidApplication, status: ApplicationStatus, notes?: string) => {
    await reviewApplication(app.id, status, notes, user?.uid);
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status } : a));
    toast.success(`Application ${status}.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Aid Program Management</h1>
            <p className="text-muted-foreground">Create programs and review farmer applications.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>+ Create Program</Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Programs */}
          <div>
            <h2 className="text-xl font-bold mb-4">My Programs <span className="text-muted-foreground text-base font-normal">({programs.length})</span></h2>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : programs.length === 0 ? (
              <EmptyState icon="📋" title="No programs yet" description="Create your first aid program to support local farmers."
                actionLabel="Create Program" onAction={() => setCreateOpen(true)} />
            ) : (
              <div className="space-y-3">
                {programs.map((p) => (
                  <Card key={p.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedProgram?.id === p.id ? "border-primary ring-1 ring-primary/20" : ""}`}
                    onClick={() => loadApplications(p)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{p.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">{p.type} · Deadline: {formatDate(p.deadline, { month: "short", day: "numeric" })}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.isPublished ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                            {p.isPublished ? "Published" : "Draft"}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handlePublishToggle(p); }}
                            className="text-xs text-primary hover:underline">
                            {p.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Applications */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {selectedProgram ? `Applications: ${selectedProgram.title}` : "Select a program"}
              <span className="text-muted-foreground text-base font-normal ml-2">
                {selectedProgram ? `(${applications.length})` : ""}
              </span>
            </h2>
            {!selectedProgram ? (
              <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground text-sm">
                Click a program on the left to view its applications
              </div>
            ) : appsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            ) : applications.length === 0 ? (
              <EmptyState icon="📬" title="No applications yet" description="Farmers haven't applied to this program yet." />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const meta = getApplicationStatusMeta(app.status);
                  return (
                    <Card key={app.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-bold">{app.farmerName}</p>
                            <p className="text-xs text-muted-foreground">Ref: {app.referenceNumber}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(app.createdAt, { month: "short", day: "numeric", year: "numeric" })}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        {(app.status === "submitted" || app.status === "under_review") && (
                          <div className="flex gap-2">
                            {app.status === "submitted" && (
                              <Button size="sm" variant="outline" onClick={() => handleReview(app, "under_review")}>
                                Start Review
                              </Button>
                            )}
                            {app.status === "under_review" && (
                              <>
                                <Button size="sm" variant="accent" onClick={() => handleReview(app, "approved")}>Approve ✅</Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200"
                                  onClick={() => handleReview(app, "rejected")}>Reject ❌</Button>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Program Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Aid Program" className="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Program Title" placeholder="e.g. Rice Seed Subsidy 2026" value={form.title}
            onChange={(e) => set("title", e.target.value)} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} required
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {AID_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <Input label="Slots Available" type="number" min="1" placeholder="e.g. 50"
              value={form.slotsAvailable} onChange={(e) => set("slotsAvailable", e.target.value)} required />
          </div>
          <Input label="Application Deadline" type="date" value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Eligibility Criteria</label>
            <textarea value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} rows={2} required
              placeholder="e.g. Must be a registered farmer in the municipality..."
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Required Documents (one per line)</label>
            <textarea value={form.requiredDocuments} onChange={(e) => set("requiredDocuments", e.target.value)} rows={3}
              placeholder={"Barangay Certificate\nFarm Registration\nValid ID"}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Input label="Contact Person" placeholder="e.g. Maria Santos, MARO" value={form.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)} required />
          <Button type="submit" className="w-full" isLoading={creating}>Create Program (as Draft)</Button>
        </form>
      </Modal>
    </div>
  );
}
