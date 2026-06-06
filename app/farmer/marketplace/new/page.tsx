"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createProduct } from "@/lib/firestore/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import NavBar from "@/components/dashboard/NavBar";
import type { ProductUnit } from "@/types";

const CROP_OPTIONS = ["Rice (Palay)", "Corn", "Tomato", "Eggplant", "Bitter Gourd", "Squash",
  "Cassava", "Sweet Potato", "Banana", "Mango", "Coconut", "Onion (Red)", "Garlic", "Ginger", "Other"];

const UNIT_OPTIONS: ProductUnit[] = ["kg", "sack", "piece", "bundle", "tray", "liter"];

export default function AddProductPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cropName: "", customCrop: "", quantity: "", unit: "kg" as ProductUnit,
    price: "", description: "", pickupAvailable: true, deliveryAvailable: false,
    availableDates: "", barangay: profile?.barangay ?? "", municipality: profile?.municipality ?? "",
  });

  const set = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== "farmer") { router.push("/login"); return; }

    const cropName = form.cropName === "Other" ? form.customCrop : form.cropName;
    if (!cropName) { toast.error("Please enter a crop name."); return; }
    if (!form.quantity || isNaN(Number(form.quantity))) { toast.error("Enter a valid quantity."); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Enter a valid price."); return; }

    setLoading(true);
    try {
      await createProduct({
        farmerId: user.uid,
        farmerName: profile.name,
        cropName,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
        description: form.description,
        photos: [],
        status: "active",
        pickupAvailable: form.pickupAvailable,
        deliveryAvailable: form.deliveryAvailable,
        availableDates: form.availableDates,
        location: {
          barangay: form.barangay,
          municipality: form.municipality,
          lat: profile.farmLocation?.lat,
          lng: profile.farmLocation?.lng,
        },
      });
      toast.success("Product listed successfully! 🎉");
      router.push("/farmer/marketplace");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">List a New Product</h1>
          <p className="text-muted-foreground">Fill in your produce details to start selling.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Name */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Crop Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Crop Name</label>
                <select
                  value={form.cropName}
                  onChange={(e) => set("cropName", e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a crop...</option>
                  {CROP_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {form.cropName === "Other" && (
                <Input label="Custom Crop Name" placeholder="e.g. Pechay, Kangkong" value={form.customCrop}
                  onChange={(e) => set("customCrop", e.target.value)} required />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Quantity" type="number" min="0" step="0.1" placeholder="e.g. 50"
                  value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Unit</label>
                  <select value={form.unit} onChange={(e) => set("unit", e.target.value as ProductUnit)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <Input label="Price per unit (₱)" type="number" min="0" step="0.01" placeholder="e.g. 25.00"
                value={form.price} onChange={(e) => set("price", e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description (optional)</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="Describe your produce — variety, quality, growing method..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </CardContent>
          </Card>

          {/* Location & Delivery */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Location & Delivery</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Barangay" placeholder="e.g. Barangay Lahug" value={form.barangay}
                  onChange={(e) => set("barangay", e.target.value)} required />
                <Input label="Municipality / City" placeholder="e.g. Cebu City" value={form.municipality}
                  onChange={(e) => set("municipality", e.target.value)} required />
              </div>
              <Input label="Available Dates (optional)" placeholder="e.g. June 15–20, 2026"
                value={form.availableDates} onChange={(e) => set("availableDates", e.target.value)} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.pickupAvailable}
                    onChange={(e) => set("pickupAvailable", e.target.checked)}
                    className="h-4 w-4 rounded accent-primary" />
                  <span className="text-sm font-medium">Pickup available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.deliveryAvailable}
                    onChange={(e) => set("deliveryAvailable", e.target.checked)}
                    className="h-4 w-4 rounded accent-primary" />
                  <span className="text-sm font-medium">Delivery available</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1"
              onClick={() => router.push("/farmer/marketplace")}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={loading}>
              Publish Listing
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
