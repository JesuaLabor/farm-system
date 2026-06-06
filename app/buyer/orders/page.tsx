"use client";

import React from "react";
import { useBuyerOrders } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPHP, formatDate, getOrderStatusMeta } from "@/lib/utils";
import NavBar from "@/components/dashboard/NavBar";

export default function BuyerOrdersPage() {
  const { orders, loading } = useBuyerOrders();

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track your purchases from local farmers.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon="🛒" title="No orders yet" description="Browse the marketplace and place your first order!"
            actionLabel="Browse Produce" actionHref="/buyer/browse" />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{order.productName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Farmer: <span className="font-medium text-foreground">{order.farmerName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {order.quantity} {order.unit} · Ordered {formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{formatPHP(order.totalPrice)}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                    {order.messages.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Latest message</p>
                        <p className="text-sm italic text-foreground/80">
                          "{order.messages[order.messages.length - 1].text}"
                        </p>
                      </div>
                    )}
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
