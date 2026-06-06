import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, ProductStatus } from "@/types";

const COL = "products";

/** Add a new product listing */
export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "viewCount" | "inquiryCount">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    viewCount: 0,
    inquiryCount: 0,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Fetch all products by a farmer */
export async function getFarmerProducts(farmerId: string): Promise<Product[]> {
  const q = query(
    collection(db, COL),
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

/** Fetch active products for buyer browse (paginated) */
export async function getBrowseProducts(opts?: {
  cropName?: string;
  municipality?: string;
  maxPrice?: number;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot;
}): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { cropName, municipality, maxPrice, pageSize = 12, cursor } = opts ?? {};

  let q = query(
    collection(db, COL),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (cursor) q = query(q, startAfter(cursor));

  const snap = await getDocs(q);
  let products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));

  // Client-side filters for fields not easily composable with Firestore indexes
  if (cropName) {
    products = products.filter((p) =>
      p.cropName.toLowerCase().includes(cropName.toLowerCase())
    );
  }
  if (municipality) {
    products = products.filter(
      (p) => p.location.municipality.toLowerCase() === municipality.toLowerCase()
    );
  }
  if (maxPrice !== undefined) {
    products = products.filter((p) => p.price <= maxPrice);
  }

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { products, lastDoc };
}

/** Fetch a single product by ID */
export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  // Increment view count
  await updateDoc(doc(db, COL, id), { viewCount: increment(1) });
  return { id: snap.id, ...snap.data() } as Product;
}

/** Update a product */
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/** Update product status */
export async function setProductStatus(
  id: string,
  status: ProductStatus
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/** Delete a product */
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/** Get all active products for map view */
export async function getMapProducts(): Promise<Product[]> {
  const q = query(
    collection(db, COL),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}
