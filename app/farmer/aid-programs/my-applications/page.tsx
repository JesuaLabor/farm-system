"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";

interface Application {
  id: string;
  programTitle: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  submittedAt: any;
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const q = query(
        collection(db, "aid_applications"), 
        where("farmerId", "==", user?.uid),
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your applications.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "submitted": return { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: "📩" };
      case "under_review": return { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: "🔍" };
      case "approved": return { label: "Approved", color: "bg-green-100 text-green-800", icon: "✅" };
      case "rejected": return { label: "Rejected", color: "bg-red-100 text-red-800", icon: "❌" };
      default: return { label: status, color: "bg-muted text-muted-foreground", icon: "📋" };
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="glass sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/farmer/aid-programs" className="text-xl">📋</Link>
            <span className="font-bold text-primary">Application Tracking</span>
          </div>
          <Link href="/farmer/aid-programs">
            <Button size="sm" variant="outline">Browse Programs</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Aid Applications</h1>

        {applications.length === 0 ? (
          <Card className="py-20 text-center">
            <div className="text-6xl mb-4">📄</div>
            <CardTitle>No applications found</CardTitle>
            <p className="text-muted-foreground mt-2">You haven&apos;t applied for any aid programs yet.</p>
            <Link href="/farmer/aid-programs" className="mt-6 inline-block">
              <Button>View Available Programs</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = getStatusInfo(app.status);
              return (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{status.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{app.programTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied on: {app.submittedAt?.toDate().toLocaleDateString() || "Recently"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${status.color}`}>
                          {status.label}
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>

                    {/* Simple Progress Bar */}
                    <div className="mt-8 relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                          app.status === "rejected" ? "bg-red-500" : "bg-primary"
                        }`}
                        style={{ width: app.status === "submitted" ? "25%" : app.status === "under_review" ? "60%" : "100%" }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Submitted</span>
                      <span>Review</span>
                      <span>Outcome</span>
                    </div>
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
