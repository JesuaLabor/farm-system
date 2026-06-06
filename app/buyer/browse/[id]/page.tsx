"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/firestore/products";
import { createOrder } from "@/lib/firestore/orders";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import NavBar from "@/components/dashboard/NavBar";
import { formatPHP, formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => { setProduct(p); setLoading(false); });
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!user || !product) return;
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) { toast.error("Enter a valid quantity."); return; }
    if (quantity > product.quantity) { toast.error(`Only ${product.quantity} ${product.unit} available.`); return; }

    setPlacing(true);
    try {
      await createOrder({
        buyerId: user.uid,
        buyerName: profile?.name ?? "Buyer",
        farmerId: product.farmerId,
        farmerName: product.farmerName ?? "Farmer",
        productId: product.id,
        productName: product.cropName,
        quantity,
        unit: product.unit,
        totalPrice: quantity * product.price,
        deliveryNotes: notes,
      });
      toast.success("Order placed! 🎉 The farmer will confirm shortly.");
      setOrderOpen(false);
      router.push("/buyer/orders");
    } catch (err) {
      toast.error("Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="aspect-video w-full mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <NavBar />
        <main className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </main>
      </div>
    );
  }

  const estimatedTotal = (Number(qty) || 0) * product.price;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          ← Back to listings
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photos */}
          <div className="space-y-3">
            <div className="aspect-video rounded-2xl overflow-hidden bg-muted border">
              {product.photos?.[0] ? (
                <img src={product.photos[0]} alt={product.cropName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl bg-gradient-to-br from-green-50 to-green-100">🥦</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{product.cropName}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 ${product.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {product.status}
                </span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatPHP(product.price)} <span className="text-base font-normal text-muted-foreground">/{product.unit}</span>
              </div>
            </div>

            <Card className="bg-muted/50 border-0">
              <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Available</p><p className="font-semibold">{product.quantity} {product.unit}</p></div>
                <div><p className="text-muted-foreground">Location</p><p className="font-semibold">{product.location.barangay}</p></div>
                <div><p className="text-muted-foreground">Municipality</p><p className="font-semibold">{product.location.municipality}</p></div>
                <div><p className="text-muted-foreground">Listed</p><p className="font-semibold">{formatDate(product.createdAt, { month: "short", day: "numeric" })}</p></div>
              </CardContent>
            </Card>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {product.farmerName?.[0] ?? "F"}
                </div>
                <div>
                  <p className="font-semibold">{product.farmerName ?? "Local Farmer"}</p>
                  <p className="text-xs text-muted-foreground">Verified Farmer</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {product.pickupAvailable && <span className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium">✅ Pickup</span>}
              {product.deliveryAvailable && <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">🚚 Delivery</span>}
            </div>

            {product.status === "active" && profile?.role === "buyer" && (
              <Button className="w-full text-lg h-12" onClick={() => setOrderOpen(true)}>
                Place Order
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Order Modal */}
      <Modal isOpen={orderOpen} onClose={() => setOrderOpen(false)} title="Place an Order">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are ordering <strong>{product.cropName}</strong> at <strong>{formatPHP(product.price)}/{product.unit}</strong>
          </p>
          <Input label={`Quantity (max ${product.quantity} ${product.unit})`} type="number"
            min="1" max={product.quantity} value={qty}
            onChange={(e) => setQty(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Delivery / Pickup Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="e.g. Preferred pickup time, delivery address..."
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {estimatedTotal > 0 && (
            <div className="bg-muted rounded-xl p-4 flex justify-between items-center">
              <span className="font-medium">Estimated Total</span>
              <span className="text-xl font-bold text-primary">{formatPHP(estimatedTotal)}</span>
            </div>
          )}
          <Button className="w-full" isLoading={placing} onClick={handlePlaceOrder}>
            Confirm Order
          </Button>
        </div>
      </Modal>
    </div>
  );
}
