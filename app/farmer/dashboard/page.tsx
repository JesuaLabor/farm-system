"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { auth } from "@/lib/firebase";
import NotificationList from "@/components/dashboard/NotificationList";

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user || profile?.role !== "farmer") {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Dashboard Header */}
      <header className="glass sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👨‍🌾</span>
            <span className="font-bold text-primary">Farmer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:inline-block">Welcome, {profile?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Manage your harvest, sales, and marketplace listings.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Listings" value="5" icon="📦" />
          <StatCard title="Pending Orders" value="2" icon="⏳" />
          <StatCard title="Monthly Income" value="₱24,500" icon="💰" />
          <StatCard title="Total Harvest" value="1.2 Tons" icon="🌾" />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weather Widget */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative border-none">
              <div className="absolute top-0 right-0 p-8 opacity-20 text-8xl">☀️</div>
              <CardContent className="p-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 font-medium">Local Weather — Cebu City</p>
                    <h2 className="text-5xl font-bold mt-1">32°C</h2>
                    <p className="text-blue-50 mt-2">Partly Cloudy • Humidity: 65%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 font-medium uppercase tracking-widest text-xs">May 16, 2026</p>
                    <p className="text-xl font-bold mt-1">00:15 AM</p>
                  </div>
                </div>
                <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
                  <WeatherForecast day="Sat" temp="31" icon="🌦️" />
                  <WeatherForecast day="Sun" temp="33" icon="☀️" />
                  <WeatherForecast day="Mon" temp="32" icon="☀️" />
                  <WeatherForecast day="Tue" temp="29" icon="⛈️" />
                  <WeatherForecast day="Wed" temp="30" icon="🌦️" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/farmer/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet. Start by listing your produce!
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-primary text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/farmer/marketplace/new" className="block w-full">
                  <Button variant="accent" className="w-full justify-start">
                    <span className="mr-2">➕</span> List New Product
                  </Button>
                </Link>
                <Link href="/farmer/harvest-log" className="block w-full">
                  <Button variant="accent" className="w-full justify-start">
                    <span className="mr-2">📝</span> Log Harvest
                  </Button>
                </Link>
                <Link href="/farmer/aid-programs" className="block w-full">
                  <Button variant="accent" className="w-full justify-start">
                    <span className="mr-2">📋</span> Apply for Aid
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PriceItem name="Rice (Palay)" price="₱18.50/kg" trend="up" />
                  <PriceItem name="Corn" price="₱14.20/kg" trend="down" />
                  <PriceItem name="Onion (Red)" price="₱120.00/kg" trend="up" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationList />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className="text-3xl bg-secondary p-3 rounded-xl">{icon}</div>
      </CardContent>
    </Card>
  );
}

function PriceItem({ name, price, trend }: { name: string; price: string; trend: "up" | "down" | "neutral" }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="font-medium">{name}</span>
      <div className="text-right">
        <div className="font-bold">{price}</div>
        <div className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? "▲ +2%" : "▼ -1%"}
        </div>
      </div>
    </div>
  );
}

function WeatherForecast({ day, temp, icon }: { day: string; temp: string; icon: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-xl p-3 min-w-[70px] backdrop-blur-sm border border-white/10">
      <span className="text-xs font-medium text-blue-100 uppercase">{day}</span>
      <span className="text-2xl my-1">{icon}</span>
      <span className="font-bold">{temp}°</span>
    </div>
  );
}
