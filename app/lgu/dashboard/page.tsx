"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";

const COLORS = ["#2d5a27", "#81c784", "#ffb300", "#ef4444"];

export default function LGUDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeListings: 0,
    pendingApplications: 0,
    totalHarvest: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "lgu")) {
      router.push("/login");
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, profile, authLoading, router]);

  const fetchDashboardData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      // Mocking aggregate data fetch for MVP
      // In production, use Cloud Functions to aggregate these counts
      const farmersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "farmer")));
      const listingsSnap = await getDocs(query(collection(db, "products"), where("status", "==", "active")));
      const appsSnap = await getDocs(query(collection(db, "aid_applications"), where("status", "==", "submitted")));
      
      setStats({
        totalFarmers: farmersSnap.size,
        activeListings: listingsSnap.size,
        pendingApplications: appsSnap.size,
        totalHarvest: 1250 // Mocked kg
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Rice", value: 400 },
    { name: "Corn", value: 300 },
    { name: "Onion", value: 200 },
    { name: "Tomato", value: 100 },
  ];

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="glass sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏛️</span>
            <span className="font-bold text-primary">LGU Agricultural Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Municipality: {profile?.municipality || "Region VII"}</span>
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agricultural Monitoring</h1>
            <p className="text-muted-foreground">Real-time data on local production and farmer support.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Generate Report</Button>
            <Button size="sm" variant="accent">Post New Aid Program</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Registered Farmers" value={stats.totalFarmers.toString()} icon="👥" color="text-blue-600" />
          <StatCard title="Active Listings" value={stats.activeListings.toString()} icon="🛒" color="text-green-600" />
          <StatCard title="Pending Aid Apps" value={stats.pendingApplications.toString()} icon="📋" color="text-orange-600" />
          <StatCard title="Total Harvest (kg)" value={stats.totalHarvest.toLocaleString()} icon="🌾" color="text-primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Crop Production Volume</CardTitle>
                <CardDescription>Monthly harvest distribution across the municipality.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2d5a27" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Farmer Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  View all registered farmers in the directory.
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/lgu/farmers")}>Go to Directory</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Aid Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: 60 },
                        { name: "Pending", value: 30 },
                        { name: "Rejected", value: 10 },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-primary text-white">
              <CardHeader>
                <CardTitle>LGU Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="accent" className="w-full justify-start text-left">
                  <span className="mr-2">✔️</span> Review 12 New Applications
                </Button>
                <Button variant="accent" className="w-full justify-start text-left">
                  <span className="mr-2">📈</span> Update Market Prices
                </Button>
                <Button variant="accent" className="w-full justify-start text-left">
                  <span className="mr-2">📢</span> Broadcast Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center space-x-4">
        <div className="text-3xl bg-muted p-3 rounded-2xl">{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
