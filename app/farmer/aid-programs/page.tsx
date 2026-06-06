"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPublishedAidPrograms } from "@/lib/firestore/aid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import NavBar from "@/components/dashboard/NavBar";
import { formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { AidProgram } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  subsidy: "💰", loan: "🏦", seed: "🌱", training: "📚", other: "📋",
};

export default function AidProgramsPage() {
  const [programs, setPrograms] = useState<AidProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedAidPrograms()
      .then(setPrograms)
      .catch(() => toast.error("Failed to load programs."))
      .finally(() => setLoading(false));
  }, []);

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Agricultural Aid & Programs</h1>
            <p className="text-muted-foreground">Available subsidies, loans, and support from your local LGU.</p>
          </div>
          <Link href="/farmer/aid-programs/my-applications">
            <Button variant="outline" size="sm">My Applications →</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : programs.length === 0 ? (
          <EmptyState icon="📋" title="No active programs at the moment"
            description="Check back later for new agricultural support announcements from your local government." />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program) => {
              const expired = isExpired(program.deadline);
              return (
                <Card key={program.id} className={`group hover:shadow-lg transition-all hover:-translate-y-0.5 ${expired ? "opacity-70" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{TYPE_ICONS[program.type] ?? "📋"}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase">
                          {program.type}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        expired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                        {expired ? "● CLOSED" : "● OPEN"}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-snug">{program.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-xl p-3 space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className={`font-semibold ${expired ? "text-red-500" : ""}`}>
                          {formatDate(program.deadline, { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slots Available</span>
                        <span className="font-semibold">{program.slotsAvailable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact</span>
                        <span className="font-semibold truncate max-w-[150px]">{program.contactPerson}</span>
                      </div>
                    </div>
                    <Link href={`/farmer/aid-programs/${program.id}`}>
                      <Button className="w-full" variant={expired ? "outline" : "primary"} disabled={expired}>
                        {expired ? "Application Closed" : "View & Apply →"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
