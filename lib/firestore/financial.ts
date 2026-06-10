import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { FinancialRecord, HarvestLog } from "@/types";

const FIN_COL = "financial_records";
const HARVEST_COL = "harvest_logs";

// ─── Financial Records ────────────────────────────────────────────────────────

/** Add a new financial record (income or expense) */
export async function addFinancialRecord(
  data: Omit<FinancialRecord, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), FIN_COL), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get all financial records for a farmer, optionally filtered by date range */
export async function getFinancialRecords(
  farmerId: string,
  opts?: { fromDate?: string; toDate?: string }
): Promise<FinancialRecord[]> {
  const q = query(
    collection(getDb(), FIN_COL),
    where("farmerId", "==", farmerId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  let records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinancialRecord));

  if (opts?.fromDate) {
    records = records.filter((r) => r.date >= opts.fromDate!);
  }
  if (opts?.toDate) {
    records = records.filter((r) => r.date <= opts.toDate!);
  }
  return records;
}

/** Delete a financial record */
export async function deleteFinancialRecord(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), FIN_COL, id));
}

/** Compute totals: income, expense, and net profit */
export function computeFinancialSummary(records: FinancialRecord[]): {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
} {
  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);
  return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

/** Group monthly income/expense for Recharts bar chart */
export function groupByMonth(records: FinancialRecord[]): {
  month: string;
  income: number;
  expense: number;
}[] {
  const map: Record<string, { income: number; expense: number }> = {};
  for (const r of records) {
    const month = r.date.substring(0, 7); // "YYYY-MM"
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    if (r.type === "income") map[month].income += r.amount;
    else map[month].expense += r.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }));
}

/** Group expenses by category for pie chart */
export function groupExpensesByCategory(
  records: FinancialRecord[]
): { category: string; amount: number }[] {
  const map: Record<string, number> = {};
  for (const r of records.filter((r) => r.type === "expense")) {
    map[r.category] = (map[r.category] ?? 0) + r.amount;
  }
  return Object.entries(map).map(([category, amount]) => ({ category, amount }));
}

// ─── Harvest Logs ─────────────────────────────────────────────────────────────

/** Add a new harvest log entry */
export async function addHarvestLog(
  data: Omit<HarvestLog, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), HARVEST_COL), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get harvest logs for a farmer */
export async function getHarvestLogs(
  farmerId: string,
  maxCount = 50
): Promise<HarvestLog[]> {
  const q = query(
    collection(getDb(), HARVEST_COL),
    where("farmerId", "==", farmerId),
    orderBy("harvestDate", "desc"),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HarvestLog));
}

/** Delete a harvest log entry */
export async function deleteHarvestLog(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), HARVEST_COL, id));
}
