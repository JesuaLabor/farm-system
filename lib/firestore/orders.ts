import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Order, OrderStatus, OrderMessage } from "@/types";

const COL = "orders";

/** Place a new order */
export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "messages" | "status">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COL), {
    ...data,
    status: "pending" as OrderStatus,
    messages: [],
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get all orders for a buyer */
export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(getDb(), COL),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

/** Get all orders for a farmer */
export async function getFarmerOrders(farmerId: string): Promise<Order[]> {
  const q = query(
    collection(getDb(), COL),
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

/** Get a single order by ID */
export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(getDb(), COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

/** Update order status */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(getDb(), COL, id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/** Add a message to an order thread */
export async function sendOrderMessage(
  orderId: string,
  message: Omit<OrderMessage, "createdAt">
): Promise<void> {
  const msg: OrderMessage = {
    ...message,
    createdAt: new Date().toISOString(),
  };
  await updateDoc(doc(getDb(), COL, orderId), {
    messages: arrayUnion(msg),
    updatedAt: new Date().toISOString(),
  });
}

/** Get all orders for a specific product */
export async function getProductOrders(productId: string): Promise<Order[]> {
  const q = query(
    collection(getDb(), COL),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}
