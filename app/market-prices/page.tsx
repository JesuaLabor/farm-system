"use client";

import React, { useState, useEffect } from "react";
import { getMarketPrices } from "@/lib/firestore/market-prices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import NavBar from "@/components/dashboard/NavBar";
import { formatPHP, formatDate, getPriceTrend, getTrendColor } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { MarketPrice } from "@/types";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

// Fallback seed prices for empty Firestore (demo mode)
const SEED_PRICES: Omit<MarketPrice, "id" | "updatedBy">[] = [
  { cropName: "Rice (Palay)", pricePerKg: 18.50, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 17.80 },
  { cropName: "Corn (Yellow)", pricePerKg: 14.20, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 15.00 },
  { cropName: "Tomato", pricePerKg: 45.00, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 42.00 },
  { cropName: "Red Onion", pricePerKg: 125.00, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 130.00 },
  { cropName: "Garlic", pricePerKg: 180.00, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 175.00 },
  { cropName: "Eggplant", pricePerKg: 30.00, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 30.00 },
  { cropName: "Bitter Gourd", pricePerKg: 55.00, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 50.00 },
  { cropName: "Cassava", pricePerKg: 8.50, source: "DA Region VII", date: new Date().toISOString(), previousPrice: 9.00 },
];

function mockTrend(current: number): { price: number }[] {
  return Array.from({ length: 8 }, (_, i) => ({
    price: +(current * (0.9 + Math.random() * 0.2)).toFixed(2),
  }));
}

export default function MarketPricesPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMarketPrices()
      .then((data) => setPrices(data.length > 0 ? data : SEED_PRICES.map((p, i) => ({ ...p, id: String(i), updatedBy: "system" }))))
      .catch(() => toast.error("Could not load prices."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prices.filter((p) =>
    p.cropName.toLowerCase().includes(search.toLowerCase())
  );

  const lastUpdated = prices[0]?.date ? formatDate(prices[0].date, { month: "long", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Market Price Monitor</h1>
            <p className="text-muted-foreground">Fair market prices for agricultural produce · Last updated: {lastUpdated}</p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crop..."
              className="h-10 pl-9 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
            />
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">🔍</span>
          </div>
        </div>

        {/* Source badge */}
        <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-xs font-bold text-secondary-foreground mb-6">
          📊 Source: Department of Agriculture Region VII
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No crops match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => {
              const trend = getPriceTrend(p.pricePerKg, p.previousPrice);
              const trendColor = getTrendColor(trend);
              const sparkData = mockTrend(p.pricePerKg);
              const lineColor = trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#64748b";
              const pctChange = p.previousPrice
                ? (((p.pricePerKg - p.previousPrice) / p.previousPrice) * 100).toFixed(1)
                : null;

              return (
                <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-bold leading-snug">{p.cropName}</CardTitle>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        trend === "up" ? "bg-green-100 text-green-700" :
                        trend === "down" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {trend === "up" ? "▲ Rising" : trend === "down" ? "▼ Falling" : "● Stable"}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-primary">{formatPHP(p.pricePerKg)}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ kg</span>
                    </div>
                    {pctChange && (
                      <p className={`text-xs font-semibold ${trendColor}`}>
                        {Number(pctChange) > 0 ? "+" : ""}{pctChange}% from last update
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="h-[80px] pt-0 px-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} dot={false} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }}
                          formatter={(v) => formatPHP(Number(v ?? 0))} labelStyle={{ display: "none" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info section */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Why follow market prices?</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🤝", text: "Negotiate better prices with buyers by knowing the current national average." },
              { icon: "📅", text: "Plan your planting cycle based on seasonal price peaks and trends." },
              { icon: "💡", text: "Identify which crops are most profitable to grow this season." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
