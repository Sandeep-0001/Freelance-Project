"use client";

import Link from "next/link";
import { Package, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";

import { formatINR } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart, removeItem, updateQty } from "@/store/slices/cartSlice";
import { showInfoToast } from "@/lib/toast";
const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);
  const items = Object.values(cart.items);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      {/* Top accent band */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Shopping Cart</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Your Cart{" "}
              <span className="text-zinc-500">
                ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-base text-zinc-600 sm:text-lg">
              Review your selected services and proceed when you’re ready.
            </p>

            {/* Mini trust row (matches home vibe) */}
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Reliable & Secure
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-teal-600" />
                Fast checkout flow
              </div>
            </div>
          </div>

          <Link
            prefetch={false}
            href="/services"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow">
              <ShoppingCart className="h-10 w-10"  />
            </div>

            <h3 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">Your Cart is Empty</h3>
            <p className="mx-auto mt-3 max-w-md text-base text-zinc-600 sm:text-lg">
              Browse services and start earning through referrals and trusted providers.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                prefetch={false}
                href="/services"
                className="mt-2 inline-flex px-6 items-center justify-center gap-2 h-12 rounded-xl text-sm font-extrabold text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: brandGradient }}
              >
                <Package className="h-5 w-5" />
                Explore Services
              </Link>

              <span className="text-sm text-zinc-500">or</span>

              <Link
                prefetch={false}
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
                        <Package className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-md text-zinc-900 sm:text-lg">
                          {item.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-zinc-900">
                            {formatINR(item.price)}
                          </span>

                          {typeof item.businessVolume === "number" && (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                              {item.businessVolume} BV
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
                      onClick={() => dispatch(removeItem({ id: item.id }))}
                      type="button"
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Qty control */}
                    <div className="inline-flex w-fit items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                      <button
                        className="px-4 py-3 text-zinc-700 transition hover:bg-zinc-50"
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQty({
                              id: item.id,
                              quantity: Math.max(0, item.quantity - 1),
                            })
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <div className="min-w-16 border-x border-zinc-200 bg-zinc-50 px-5 py-3 text-center">
                        <span className="text-base font-extrabold text-zinc-900">{item.quantity}</span>
                      </div>

                      <button
                        className="px-4 py-3 text-zinc-700 transition hover:bg-zinc-50"
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQty({
                              id: item.id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-right">
                      <div className="text-xs font-semibold text-zinc-600">Subtotal</div>
                      <div className="text-xl font-extrabold text-zinc-900">
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm lg:sticky lg:top-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="text-lg font-extrabold text-zinc-900">Order Summary</div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {cart.totalQuantity} items
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="text-sm font-semibold text-zinc-600">Items</span>
                  <span className="text-sm font-extrabold text-zinc-900">{cart.totalQuantity}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="text-sm font-semibold text-zinc-600">Subtotal</span>
                  <span className="text-sm font-extrabold text-zinc-900">{formatINR(cart.totalAmount)}</span>
                </div>

                <div className="mt-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-700">
                    Tip: Checkout will be enabled once payment integration is live.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  type="button"
                  onClick={() => {
                    // Placeholder: integrate checkout / payment later
                    showInfoToast("Checkout coming soon! We'll notify you when payment processing is live.");
                  }}
                >
                  Proceed to Checkout
                </button>

                <button
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                  type="button"
                  onClick={() => dispatch(clearCart())}
                >
                  Clear Cart
                </button>

                <Link
                  prefetch={false}
                  href="/services"
                  className="block text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Add more services →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
