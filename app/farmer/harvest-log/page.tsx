"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getHarvestLogs, addHarvestLog, deleteHarvestLog } from "@/lib/firestore/financial";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import NavBar from "@/components/dashboard/NavBar";
import { toast } from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { HarvestLog, ProductUnit } from "@/types";
import { useEffect } from "react";

const UNITS: ProductUnit[] = ["kg", "sack", "piece", "bundle", "tray", "liter"];

export default function HarvestLogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<HarvestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cropName: "", quantity: "", unit: "kg" as ProductUnit,
    harvestDate: new Date().toISOString().split("T")[0], notes: "",
  });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const fetchLogs = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setLogs(await getHarvestLogs(user.uid));
    } catch {
      toast.error("Failed to load harvest logs.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    if (!form.cropName || !form.quantity) return;
    setSubmitting(true);
    try {
      const id = await addHarvestLog({
        farmerId: user.uid,
        cropName: form.cropName,
        quantity: Number(form.quantity),
        unit: form.unit,
        harvestDate: form.harvestDate,
        notes: form.notes,
      });
      const newLog: HarvestLog = {
        id, farmerId: user.uid, cropName: form.cropName,
        quantity: Number(form.quantity), unit: form.unit,
        harvestDate: form.harvestDate, notes: form.notes,
        createdAt: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
      setForm({ cropName: "", quantity: "", unit: "kg", harvestDate: new Date().toISOString().split("T")[0], notes: "" });
      setShowForm(false);
      toast.success("Harvest logged! 🌾");
    } catch {
      toast.error("Failed to save harvest log.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this harvest record?")) return;
    try {
      await deleteHarvestLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Record deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  // Monthly summary
  const totalByMonth = logs.reduce<Record<string, number>>((acc, l) => {
    const m = l.harvestDate.substring(0, 7);
    acc[m] = (acc[m] ?? 0) + l.quantity;
    return acc;
  }, {});
  const latestMonth = Object.keys(totalByMonth).sort().at(-1);
  const latestTotal = latestMonth ? totalByMonth[latestMonth] : 0;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Harvest Log</h1>
            <p className="text-muted-foreground">Track your farm yield over time.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "primary"}>
            {showForm ? "Cancel" : "+ New Entry"}
          </Button>
        </div>

        {/* Summary Card */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-3xl font-bold">{logs.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Unique Crops</p>
                <p className="text-3xl font-bold">{new Set(logs.map(l => l.cropName)).size}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">This Month's Yield</p>
                <p className="text-3xl font-bold">{latestTotal.toLocaleString()} <span className="text-base font-normal text-muted-foreground">units</span></p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inline Add Form */}
        {showForm && (
          <Card className="mb-8 border-primary/20 bg-primary/5 animate-in">
            <CardHeader><CardTitle>Log New Harvest</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <Input label="Crop Name" placeholder="e.g. Tomato" value={form.cropName}
                  onChange={(e) => set("cropName", e.target.value)} required />
                <Input label="Quantity" type="number" min="0" step="0.1" placeholder="0.0"
                  value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Unit</label>
                  <select value={form.unit} onChange={(e) => set("unit", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <Input label="Harvest Date" type="date" value={form.harvestDate}
                  onChange={(e) => set("harvestDate", e.target.value)} required />
                <Button type="submit" isLoading={submitting}>Save Record</Button>
              </form>
              <div className="mt-4">
                <Input label="Notes (optional)" placeholder="e.g. Field A, second batch..." value={form.notes}
                  onChange={(e) => set("notes", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records Table */}
        <Card>
          <CardHeader><CardTitle>Harvest History</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : logs.length === 0 ? (
              <EmptyState icon="🌾" title="No harvest records yet"
                description="Start logging your yield to track production over time."
                actionLabel="Log First Harvest" onAction={() => setShowForm(true)} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-6 py-3 text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-sm font-semibold">Crop</th>
                      <th className="px-6 py-3 text-sm font-semibold">Yield</th>
                      <th className="px-6 py-3 text-sm font-semibold">Notes</th>
                      <th className="px-6 py-3 text-sm font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm">{formatDate(log.harvestDate, { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-6 py-4 font-semibold">{log.cropName}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                            {log.quantity} {log.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground italic">{log.notes || "—"}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDelete(log.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
