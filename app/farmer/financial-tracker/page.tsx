"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getFinancialRecords, deleteFinancialRecord,
  computeFinancialSummary, groupByMonth, groupExpensesByCategory,
} from "@/lib/firestore/financial";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import NavBar from "@/components/dashboard/NavBar";
import { toast } from "react-hot-toast";
import { formatPHP, formatDate } from "@/lib/utils";
import type { FinancialRecord } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#2d5a27", "#ffb300", "#5d4037", "#81c784", "#1b5e20", "#ef4444"];

export default function FinancialTrackerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setRecords(await getFinancialRecords(user.uid));
    } catch {
      toast.error("Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteFinancialRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("Record deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const summary = computeFinancialSummary(records);
  const monthlyData = groupByMonth(records);
  const expenseData = groupExpensesByCategory(records);

  const CATEGORY_LABELS: Record<string, string> = {
    crop_sale: "Crop Sale", aid_received: "Aid Received", other_income: "Other",
    seeds: "Seeds", fertilizer: "Fertilizer", labor: "Labor",
    equipment: "Equipment", transport: "Transport", other_expense: "Other Expense",
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">Monitor your farm's profitability and cash flow.</p>
          </div>
          <Link href="/farmer/financial-tracker/new">
            <Button>+ Add Entry</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState icon="💰" title="No financial records yet"
            description="Start tracking your income and expenses to see your farm's financial health."
            actionLabel="Add First Record" actionHref="/farmer/financial-tracker/new" />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <h3 className="text-3xl font-bold text-green-600">{formatPHP(summary.totalIncome)}</h3>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <h3 className="text-3xl font-bold text-red-500">{formatPHP(summary.totalExpense)}</h3>
                </CardContent>
              </Card>
              <Card className={`border-l-4 ${summary.netProfit >= 0 ? "border-l-primary" : "border-l-orange-500"}`}>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Net Profit / Loss</p>
                  <h3 className={`text-3xl font-bold ${summary.netProfit >= 0 ? "text-primary" : "text-orange-500"}`}>
                    {summary.netProfit >= 0 ? "+" : ""}{formatPHP(summary.netProfit)}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            {monthlyData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader><CardTitle>Monthly Income vs Expenses</CardTitle></CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(v) => formatPHP(Number(v ?? 0))}
                        />
                        <Bar dataKey="income" name="Income" fill="#2d5a27" radius={[6,6,0,0]} />
                        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6,6,0,0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {expenseData.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseData} cx="50%" cy="45%" innerRadius={60} outerRadius={90}
                            paddingAngle={4} dataKey="amount" nameKey="category">
                            {expenseData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: any) => formatPHP(Number(v ?? 0))}
                            contentStyle={{ borderRadius: "12px", border: "none" }} />
                          <Legend formatter={(v) => CATEGORY_LABELS[v] ?? v} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Records Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Transactions</CardTitle>
                <span className="text-sm text-muted-foreground">{records.length} records</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-6 py-3 text-sm font-semibold">Type</th>
                        <th className="px-6 py-3 text-sm font-semibold">Category</th>
                        <th className="px-6 py-3 text-sm font-semibold">Amount</th>
                        <th className="px-6 py-3 text-sm font-semibold">Date</th>
                        <th className="px-6 py-3 text-sm font-semibold">Notes</th>
                        <th className="px-6 py-3 text-sm font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3">
                            <span className={`flex items-center gap-1.5 font-medium ${r.type === "income" ? "text-green-600" : "text-red-500"}`}>
                              {r.type === "income" ? "📈 Income" : "📉 Expense"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">{CATEGORY_LABELS[r.category] ?? r.category}</td>
                          <td className="px-6 py-3 font-bold">
                            <span className={r.type === "income" ? "text-green-600" : "text-red-500"}>
                              {r.type === "income" ? "+" : "-"}{formatPHP(r.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-muted-foreground">{formatDate(r.date, { month: "short", day: "numeric" })}</td>
                          <td className="px-6 py-3 text-sm text-muted-foreground italic max-w-[200px] truncate">{r.notes || "—"}</td>
                          <td className="px-6 py-3">
                            <button onClick={() => handleDelete(r.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
