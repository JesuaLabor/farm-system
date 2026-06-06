import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPHP, getProductStatusMeta } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showFarmerActions?: boolean;
  onDelete?: () => void;
  onStatusChange?: (status: Product["status"]) => void;
}

export function ProductCard({ product, showFarmerActions, onDelete, onStatusChange }: ProductCardProps) {
  const statusMeta = getProductStatusMeta(product.status);

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {product.photos?.[0] ? (
          <img
            src={product.photos[0]}
            alt={product.cropName}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl bg-gradient-to-br from-green-50 to-green-100">
            🥦
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${statusMeta.color}`}>
          {statusMeta.label}
        </span>
        {product.deliveryAvailable && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-sm">
            🚚 Delivery
          </span>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{product.cropName}</CardTitle>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-primary">{formatPHP(product.price)}</div>
            <div className="text-xs text-muted-foreground">/{product.unit}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>📦 {product.quantity} {product.unit} available</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>📍</span>
          <span>{product.location.barangay}, {product.location.municipality}</span>
        </div>
        {product.farmerName && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>👨‍🌾</span>
            <span>{product.farmerName}</span>
          </div>
        )}

        {showFarmerActions ? (
          <div className="flex gap-2 pt-1">
            <Link href={`/farmer/marketplace/${product.id}/edit`} className="flex-1">
              <button className="w-full h-8 px-3 text-xs rounded-xl border border-input bg-background hover:bg-muted transition-colors font-medium">
                Edit
              </button>
            </Link>
            <button
              onClick={onDelete}
              className="flex-1 h-8 px-3 text-xs rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        ) : (
          <Link href={`/buyer/browse/${product.id}`} className="block">
            <button className="w-full h-9 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
              View Details
            </button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
