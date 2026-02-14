"use client";

import { useEffect } from "react";
import { Package, Star, TrendingUp } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setServices, type Service } from "@/store/slices/serviceSlice";
import ServicesGrid from "@/app/services/components/ServicesGrid";

export default function ServicesClient({ services }: { services: Service[] }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setServices(services));
  }, [dispatch, services]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-1 text-xs font-bold text-[var(--gray-700)]">
              <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
              Premium Services
            </div>

            <h2 className="text-3xl font-extrabold text-[var(--gray-900)]">Services Marketplace</h2>
            <p className="text-[var(--gray-700)]">
              Choose services to generate <span className="font-bold">Business Volume (BV)</span> and grow your referral income.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2 text-sm font-semibold text-[var(--gray-800)]">
              <Star className="h-4 w-4 text-[#0EA5E9]" />
              Quality Assured
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2 text-sm font-semibold text-[var(--gray-800)]">
              <TrendingUp className="h-4 w-4 text-[#0EA5E9]" />
              Instant BV
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <ServicesGrid services={services} />
    </div>
  );
}
