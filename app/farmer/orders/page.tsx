"use client";

import React from "react";
import { useFarmerOrders } from "@/hooks/useOrders";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPHP, formatDate, getOrderStatusMeta } from "@/lib/utils";
import NavBar from "@/components/dashboard/NavBar";
import { toast } from "react-hot-toast";
import type { OrderStatus } from "@/types";

const STATUS_ACTIONS: Record<string, { label: string; next: OrderStatus }> = {
  pending:   { label: "Confirm Order",    next: "confirmed" },
  confirmed: { label: "Mark Ready",       next: "ready" },
  ready:     { label: "Mark Completed",   next: "completed" },
};

export default function FarmerOrdersPage() {
  const { orders, loading, changeStatus } = useFarmerOrders();

  const handleStatusChange = async (id: string, next: OrderStatus) => {
    try {
      await changeStatus(id, next);
      toast.success("Order updated.");
    } catch {
      toast.error("Failed to update order.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await changeStatus(id, "cancelled");
      toast.success("Order cancelled.");
    } catch {
      toast.error("Failed to cancel order.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Incoming Orders</h1>
          <p className="text-muted-foreground">Manage orders placed by buyers for your products.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon="📬" title="No orders yet" description="Once buyers place orders, they'll appear here."
            actionLabel="View My Listings" actionHref="/farmer/marketplace" />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const action = STATUS_ACTIONS[order.status];
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg">{order.productName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Buyer: <span className="font-medium text-foreground">{order.buyerName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} {order.unit} · {formatDate(order.createdAt, { month: "short", day: "numeric" })}
                        </p>
                        {order.deliveryNotes && (
                          <p className="text-sm text-muted-foreground italic">Note: {order.deliveryNotes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-bold text-primary">{formatPHP(order.totalPrice)}</div>
                        {action && order.status !== "cancelled" && order.status !== "completed" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleStatusChange(order.id, action.next)}>
                              {action.label}
                            </Button>
                            <Button size="sm" variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleCancel(order.id)}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
