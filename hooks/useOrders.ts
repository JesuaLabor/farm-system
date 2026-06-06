"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getBuyerOrders, getFarmerOrders, updateOrderStatus } from "@/lib/firestore/orders";
import type { Order, OrderStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useBuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setOrders(await getBuyerOrders(user.uid));
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refetch: fetch };
}

export function useFarmerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setOrders(await getFarmerOrders(user.uid));
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return { orders, loading, refetch: fetch, changeStatus };
}
