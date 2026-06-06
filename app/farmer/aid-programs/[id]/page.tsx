"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAidProgram } from "@/lib/firestore/aid";
import { submitAidApplication } from "@/lib/firestore/aid";
import { getFarmerApplications } from "@/lib/firestore/aid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import NavBar from "@/components/dashboard/NavBar";
import { formatDate, getApplicationStatusMeta } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { AidProgram, AidApplication } from "@/types";

export default function AidProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState<AidProgram | null>(null);
  const [existingApp, setExistingApp] = useState<AidApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [prog, apps] = await Promise.all([
          getAidProgram(id),
          user?.uid ? getFarmerApplications(user.uid) : Promise.resolve([]),
        ]);
        setProgram(prog);
        setExistingApp(apps.find((a) => a.programId === id) ?? null);
      } catch {
        toast.error("Failed to load program details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.uid]);

  const handleApply = async () => {
    if (!user || !program || !profile) { router.push("/login"); return; }
    if (!agreed) { toast.error("Please agree to the declaration."); return; }

    setSubmitting(true);
    try {
      await submitAidApplication({
        farmerId: user.uid,
        farmerName: profile.name,
        programId: program.id,
        programTitle: program.title,
        submittedDocs: [],
        reviewedBy: "",
        reviewerNotes: "",
      });
      toast.success("Application submitted! 🎉 Reference number sent.");
      router.push("/farmer/aid-programs/my-applications");
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <NavBar />
        <main className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Program not found.</p>
          <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </main>
      </div>
    );
  }

  const isExpired = new Date(program.deadline) < new Date();
  const appMeta = existingApp ? getApplicationStatusMeta(existingApp.status) : null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
          ← Back to Programs
        </button>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase mb-2 inline-block">
                  {program.type}
                </span>
                <CardTitle className="text-2xl mt-1">{program.title}</CardTitle>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                {isExpired ? "● CLOSED" : "● OPEN"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{program.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-xl">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold text-sm">{formatDate(program.deadline, { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-xl">
                <p className="text-xs text-muted-foreground">Slots Available</p>
                <p className="font-semibold text-sm">{program.slotsAvailable}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-xl">
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="font-semibold text-sm">{program.contactPerson}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Eligibility</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{program.eligibility}</p>
          </CardContent>
        </Card>

        {/* Required Documents */}
        {program.requiredDocuments.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">Required Documents</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {program.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Application Section */}
        {existingApp ? (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-2xl">📋</p>
              <p className="font-bold text-lg">You have already applied</p>
              <p className="text-sm text-muted-foreground">Reference: <span className="font-mono font-bold">{existingApp.referenceNumber}</span></p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${appMeta?.color}`}>
                {appMeta?.label}
              </span>
            </CardContent>
          </Card>
        ) : !isExpired ? (
          <Card>
            <CardHeader><CardTitle className="text-lg">Apply for this Program</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">📋 Auto-filled from your profile:</p>
                <p>Name: <strong>{profile?.name}</strong></p>
                <p>Municipality: <strong>{profile?.municipality}</strong></p>
                <p>Barangay: <strong>{profile?.barangay}</strong></p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  I hereby certify that all information I have provided is true and correct, and I meet the eligibility requirements for this program.
                </span>
              </label>
              <Button className="w-full h-12 text-base" isLoading={submitting} onClick={handleApply} disabled={!agreed}>
                Submit Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">This program's application period has ended.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
