"use client";

import React from "react";
import Link from "next/link";
import { useFarmerProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import NavBar from "@/components/dashboard/NavBar";
import { toast } from "react-hot-toast";

export default function FarmerMarketplacePage() {
  const { products, loading, remove } = useFarmerProducts();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await remove(id);
      toast.success("Listing deleted.");
    } catch {
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage the produce you have listed for sale.</p>
          </div>
          <Link href="/farmer/marketplace/new">
            <Button>+ Add Product</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No listings yet"
            description="Start selling your produce to local buyers today."
            actionLabel="Create Your First Listing"
            actionHref="/farmer/marketplace/new"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showFarmerActions
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
