import {
  collection, doc, addDoc, getDocs, updateDoc,
  query, orderBy, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MarketPrice, PriceTrendEntry } from "@/types";

const PRICE_COL = "market_prices";
const TREND_COL = "price_trends";

/** Get all current market prices */
export async function getMarketPrices(): Promise<MarketPrice[]> {
  const q = query(collection(db, PRICE_COL), orderBy("cropName", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MarketPrice));
}

/** Create or update a market price entry */
export async function upsertMarketPrice(
  data: Omit<MarketPrice, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, PRICE_COL), { ...data });
  return ref.id;
}

/** Update an existing market price */
export async function updateMarketPrice(
  id: string,
  data: Partial<Omit<MarketPrice, "id">>
): Promise<void> {
  await updateDoc(doc(db, PRICE_COL, id), data);
}

/** Get price trend entries for a specific crop */
export async function getPriceTrend(cropName: string): Promise<PriceTrendEntry[]> {
  const trendDocId = cropName.toLowerCase().replace(/\s+/g, "_");
  const snap = await getDoc(doc(db, TREND_COL, trendDocId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return (data.entries ?? []) as PriceTrendEntry[];
}
