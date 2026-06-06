"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getFarmerProducts, getBrowseProducts, deleteProduct, setProductStatus } from "@/lib/firestore/products";
import type { Product, ProductStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

/** Hook for a farmer's own listings */
export function useFarmerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getFarmerProducts(user.uid);
      setProducts(data);
    } catch {
      toast.error("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const changeStatus = async (id: string, status: ProductStatus) => {
    await setProductStatus(id, status);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  };

  return { products, loading, refetch: fetch, remove, changeStatus };
}

/** Hook for buyer browse with filters */
export function useBrowseProducts(filters?: {
  cropName?: string;
  municipality?: string;
  maxPrice?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBrowseProducts(filters)
      .then((res) => { if (!cancelled) setProducts(res.products); })
      .catch(() => toast.error("Failed to load products."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.cropName, filters?.municipality, filters?.maxPrice]);

  return { products, loading };
}
