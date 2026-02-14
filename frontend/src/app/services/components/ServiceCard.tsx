"use client";

import { useMemo, useState } from "react";
import { Package, ShoppingCart, Heart, Plus, Minus, BadgePercent, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, removeItem, updateQty } from "@/store/slices/cartSlice";
import type { Service } from "@/store/slices/serviceSlice";
import {NoImage} from "./NoImage";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isInCart = service._id in cart.items;
  const quantity = cart.items[service._id]?.quantity || 0;

  const hasDiscount = useMemo(() => {
    const op = (service as any).originalPrice as number | undefined;
    return typeof op === "number" && op > service.price;
  }, [service]);

  const discountPercent = useMemo(() => {
    const op = (service as any).originalPrice as number | undefined;
    if (!hasDiscount || !op) return 0;
    return Math.round(((op - service.price) / op) * 100);
  }, [hasDiscount, service]);

  const isFeatured = Boolean((service as any).isFeatured);

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: service._id,
        name: service.name,
        price: service.price,
        businessVolume: service.businessVolume,
        quantity: 1,
      })
    );
  };

  const handleIncreaseQty = () => {
    dispatch(updateQty({ id: service._id, quantity: quantity + 1 }));
  };

  const handleDecreaseQty = () => {
    if (quantity <= 1) dispatch(removeItem({ id: service._id }));
    else dispatch(updateQty({ id: service._id, quantity: quantity - 1 }));
  };

  const status = service.status || "active";
  const isActive = status === "active";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#22C55E] to-[#0EA5E9]" />

      {/* Badges */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        {isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Featured
          </span>
        )}
      </div>

      {hasDiscount && (
        <div className="absolute right-4 top-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <BadgePercent className="h-3.5 w-3.5" />
            {discountPercent}% OFF
          </span>
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={() => setIsWishlisted((v) => !v)}
        className="absolute right-4 bottom-[130px] z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gray-200)] bg-white/95 backdrop-blur shadow-sm transition hover:shadow-md"
        aria-label="Toggle wishlist"
      >
        <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-[var(--gray-500)] group-hover:text-red-500"}`} />
      </button>

      {/* Media */}
      <div className="relative p-1 flex items-center justify-center">
        {/* <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#0EA5E9] p-[2px] shadow-sm">
          <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
            <div className="h-14 w-14 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-sm">
              <Package className="h-7 w-7" />              
            </div>
          </div>
        </div> */}
        {<NoImage />}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 space-y-4 py-0">
        <div className="space-y-2">
          <p className="text-[12px] sm:text-base text-[var(--gray-900)] tracking-wide line-clamp-2">
            {service.name}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 border border-emerald-100">
              {service.businessVolume} BV
            </span>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs border ${
                isActive
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-[var(--gray-50)] text-[var(--gray-700)] border-[var(--gray-200)]"
              }`}
            >
              {isActive ? "In Stock" : status}
            </span>
          </div>

          {/* {(service as any).shortDescription && (
            <p className="text-sm text-[var(--gray-700)] line-clamp-2">{(service as any).shortDescription}</p>
          )} */}
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-end gap-2">
            <div className="text-lg font-bold text-[var(--gray-900)]">{formatINR(service.price)}</div>
            {hasDiscount && (service as any).originalPrice && (
              <div className="text-sm text-[var(--gray-400)] line-through pb-0.5">{formatINR((service as any).originalPrice)}</div>
            )}
          </div>
        </div>

        {/* Cart controls */}
        <div className="pt-1 text-center">
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              className="px-6 cursor-pointer inline-flex items-center justify-center gap-2 h-8 rounded-xl text-white shadow-sm transition hover:shadow-md"
              style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-1">
              <button
                onClick={handleDecreaseQty}
                className="h-5 w-10 rounded-lg border border-[var(--gray-200)] bg-white text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-5 w-5 mx-auto cursor-pointer" />
              </button>

              <div className="flex-1 text-center font-bold text-[var(--gray-900)]">{quantity}</div>

              <button
                onClick={handleIncreaseQty}
                className="h-5 w-5 rounded-lg border border-[var(--gray-200)] bg-white text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4 mx-auto cursor-pointer" />
              </button>
            </div>
          )}
        </div>

        {/* <div className="text-[11px] text-[var(--gray-600)] text-center">Secure checkout • Fast delivery</div> */}
      </div>
    </div>
  );
}
