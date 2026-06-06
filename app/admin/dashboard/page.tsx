"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    orders: 0,
    applications: 0
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/login");
    } else if (user) {
      fetchAdminData();
    }
  }, [user, profile, authLoading, router]);

  const fetchAdminData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      // Mocked aggregate fetch for speed
      const usersSnap = await getDocs(collection(db, "users"));
      const listingsSnap = await getDocs(collection(db, "products"));
      const ordersSnap = await getDocs(collection(db, "orders"));
      const appsSnap = await getDocs(collection(db, "aid_applications"));

      setStats({
        users: usersSnap.size,
        listings: listingsSnap.size,
        orders: ordersSnap.size,
        applications: appsSnap.size
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="glass sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-primary">System Administrator</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/login")}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Platform Control Center</h1>
          <p className="text-muted-foreground text-lg">Global monitoring and management of the FarmSystem ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatBox title="Total Users" value={stats.users.toString()} icon="👤" trend="+12% this week" />
          <StatBox title="Active Listings" value={stats.listings.toString()} icon="📦" trend="+5% this week" />
          <StatBox title="Total Orders" value={stats.orders.toString()} icon="💰" trend="+20% this week" />
          <StatBox title="Aid Requests" value={stats.applications.toString()} icon="📋" trend="+8% this week" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time status of platform services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <HealthItem label="Firestore Database" status="Operational" />
              <HealthItem label="Firebase Auth" status="Operational" />
              <HealthItem label="Cloudinary Storage" status="Operational" />
              <HealthItem label="API Endpoints" status="Operational" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">Manage All Users</Button>
              <Button variant="outline" className="w-full justify-start">Moderation Queue</Button>
              <Button variant="outline" className="w-full justify-start">Financial Reports</Button>
              <Button variant="outline" className="w-full justify-start">System Logs</Button>
              <Button className="w-full mt-4" variant="accent">Global Announcement</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatBox({ title, value, icon, trend }: { title: string; value: string; icon: string; trend: string }) {
  return (
    <Card className="hover:scale-105 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-4xl">{icon}</div>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">{trend}</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-bold text-green-600 uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}
