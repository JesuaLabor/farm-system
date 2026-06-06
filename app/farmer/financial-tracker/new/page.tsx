"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addFinancialRecord } from "@/lib/firestore/financial";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import NavBar from "@/components/dashboard/NavBar";
import type { FinancialType, IncomeCategory, ExpenseCategory } from "@/types";

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "crop_sale", label: "Crop Sale" },
  { value: "aid_received", label: "Aid / Subsidy Received" },
  { value: "other_income", label: "Other Income" },
];

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "seeds", label: "Seeds" },
  { value: "fertilizer", label: "Fertilizer / Pesticide" },
  { value: "labor", label: "Labor / Workers" },
  { value: "equipment", label: "Equipment / Tools" },
  { value: "transport", label: "Transport / Logistics" },
  { value: "other_expense", label: "Other Expense" },
];

export default function AddFinancialRecordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<FinancialType>("income");
  const [form, setForm] = useState({ amount: "", category: "", date: new Date().toISOString().split("T")[0], notes: "" });
  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    if (!form.amount || isNaN(Number(form.amount))) { toast.error("Enter a valid amount."); return; }
    if (!form.category) { toast.error("Select a category."); return; }

    setLoading(true);
    try {
      await addFinancialRecord({
        farmerId: user.uid,
        type,
        amount: Number(form.amount),
        category: form.category as IncomeCategory | ExpenseCategory,
        date: form.date,
        notes: form.notes,
      });
      toast.success(`${type === "income" ? "Income" : "Expense"} record saved! ✅`);
      router.push("/farmer/financial-tracker");
    } catch {
      toast.error("Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add Financial Record</h1>
          <p className="text-muted-foreground">Track your farm income and expenses.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type toggle */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Record Type</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {(["income", "expense"] as FinancialType[]).map((t) => (
                  <button key={t} type="button" onClick={() => { setType(t); set("category", ""); }}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                      type === t
                        ? t === "income" ? "bg-green-500 text-white shadow-md" : "bg-red-500 text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>
                    {t === "income" ? "💰 Income" : "📉 Expense"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Amount (₱)" type="number" min="0" step="0.01" placeholder="e.g. 1500.00"
                value={form.amount} onChange={(e) => set("amount", e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} required
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select a category...</option>
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <Input label="Date" type="date" value={form.date}
                onChange={(e) => set("date", e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                  placeholder="e.g. Sold 50kg palay to Juan dela Cruz..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={loading}>Save Record</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
