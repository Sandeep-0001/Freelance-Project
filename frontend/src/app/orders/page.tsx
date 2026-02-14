"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "completed" | "cancelled" | "processing";
  items: number;
  shippingAddress: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "cancelled" | "processing">("all");

  useEffect(() => {
    // Sample orders data
    const sampleOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        date: "2024-01-20",
        total: 2999,
        status: "completed",
        items: 3,
        shippingAddress: "123 Main Street, Mumbai, MH 400001",
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        date: "2024-01-18",
        total: 1599,
        status: "processing",
        items: 1,
        shippingAddress: "456 Oak Avenue, Bangalore, KA 560001",
      },
      {
        id: "3",
        orderNumber: "ORD-2024-003",
        date: "2024-01-15",
        total: 4499,
        status: "completed",
        items: 5,
        shippingAddress: "789 Pine Road, Delhi, DL 110001",
      },
      {
        id: "4",
        orderNumber: "ORD-2024-004",
        date: "2024-01-12",
        total: 899,
        status: "pending",
        items: 2,
        shippingAddress: "321 Elm Street, Hyderabad, TG 500001",
      },
    ];

    setOrders(sampleOrders);
    setLoading(false);
  }, []);

  const getStatusPill = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return {
          cls: "border-emerald-200 bg-emerald-50 text-emerald-800",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Completed",
        };
      case "processing":
        return {
          cls: "border-sky-200 bg-sky-50 text-sky-800",
          icon: <Clock className="h-4 w-4" />,
          label: "Processing",
        };
      case "pending":
        return {
          cls: "border-amber-200 bg-amber-50 text-amber-800",
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Pending",
        };
      case "cancelled":
        return {
          cls: "border-red-200 bg-red-50 text-red-800",
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Cancelled",
        };
      default:
        return {
          cls: "border-zinc-200 bg-zinc-50 text-zinc-800",
          icon: <AlertCircle className="h-4 w-4" />,
          label: status,
        };
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      {/* Brand top line */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Orders</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Your Orders
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              View and manage all your orders.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {(["all", "pending", "processing", "completed", "cancelled"] as const).map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={[
                  "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-extrabold transition",
                  active
                    ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                ].join(" ")}
                type="button"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-sm font-semibold text-zinc-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50">
              <ShoppingBag className="h-8 w-8 text-emerald-700" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 mb-2">No orders found</h3>
            <p className="text-sm text-zinc-600 mb-6">
              You don't have any {filter !== "all" ? filter : ""} orders yet.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const pill = getStatusPill(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="p-6 md:flex md:items-center md:justify-between md:gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-3 border border-emerald-100">
                          <ShoppingBag className="h-6 w-6 text-emerald-700" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-extrabold text-zinc-900">
                            {order.orderNumber}
                          </h3>

                          <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-zinc-600 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              <span>
                                {order.items} item{order.items !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-start gap-2 text-sm text-zinc-600">
                            <MapPin className="mt-0.5 h-4 w-4" />
                            <span>{order.shippingAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 md:mt-0">
                      <div
                        className={[
                          "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-extrabold",
                          pill.cls,
                        ].join(" ")}
                      >
                        {pill.icon}
                        <span>{pill.label}</span>
                      </div>

                      <button
                        className="rounded-2xl border border-emerald-200 bg-white px-5 py-2 text-sm font-extrabold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
