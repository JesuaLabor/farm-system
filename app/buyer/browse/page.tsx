"use client";

import React, { useState } from "react";
import { useBrowseProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import NavBar from "@/components/dashboard/NavBar";

export default function BuyerBrowsePage() {
  const [cropSearch, setCropSearch] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    cropName?: string; municipality?: string; maxPrice?: number;
  }>({});

  const { products, loading } = useBrowseProducts(activeFilters);

  const applyFilters = () => {
    setActiveFilters({
      cropName: cropSearch || undefined,
      municipality: municipality || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setCropSearch(""); setMunicipality(""); setMaxPrice("");
    setActiveFilters({});
  };

  const hasFilters = !!activeFilters.cropName || !!activeFilters.municipality || !!activeFilters.maxPrice;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Produce</h1>
          <p className="text-muted-foreground">Find fresh produce directly from local farmers.</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Search crop" placeholder="e.g. Tomato, Rice..." value={cropSearch}
              onChange={(e) => setCropSearch(e.target.value)} />
            <Input label="Municipality" placeholder="e.g. Cebu City" value={municipality}
              onChange={(e) => setMunicipality(e.target.value)} />
            <Input label="Max price (₱/unit)" type="number" placeholder="e.g. 50" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} size="sm">Apply Filters</Button>
            {hasFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">Clear</Button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="🌾"
            title="No products found"
            description={hasFilters ? "Try adjusting your filters." : "No listings available yet. Check back soon!"}
            actionLabel={hasFilters ? "Clear Filters" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{products.length} listing{products.length !== 1 ? "s" : ""} found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
