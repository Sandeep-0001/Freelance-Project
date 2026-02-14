"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Search, SlidersHorizontal, Star, TrendingUp } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setServices, type Service } from "@/store/slices/serviceSlice";
import { setCategories, type Category } from "@/store/slices/categorySlice";
import ServicesGrid from "@/app/services/components/ServicesGrid";

export default function ServicesCategoryClient({
  services,
  categories,
}: {
  services: Service[];
  categories: Category[];
}) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");

  useEffect(() => {
    dispatch(setServices(services));
    dispatch(setCategories(categories));
  }, [dispatch, services, categories]);

  const filteredServices = useMemo(() => {
    let result = services;

    // search
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          ((s as any).shortDescription ? String((s as any).shortDescription).toLowerCase().includes(q) : false)
      );
    }

    // category
    if (selectedCategory) {
      result = result.filter((s) => (s as any).categoryId === selectedCategory);
    }

    // sort
    switch (sortBy) {
      case "price-low":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...result].sort((a, b) => b.price - a.price);
      case "rating":
        return [...result].sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
      case "featured":
      default:
        return [...result].sort((a, b) => (Boolean((b as any).isFeatured) ? 1 : 0) - (Boolean((a as any).isFeatured) ? 1 : 0));
    }
  }, [services, searchTerm, selectedCategory, sortBy]);

  const activeCategory = useMemo(() => categories.find((c) => c._id === selectedCategory), [categories, selectedCategory]);

  const servicesByCategory = useMemo(() => {
    if (selectedCategory) {
      return activeCategory ? [{ category: activeCategory, services: filteredServices }] : [];
    }

    const uncategorized = filteredServices.filter((s) => !(s as any).categoryId);
    const categorized = categories.map((category) => ({
      category,
      services: filteredServices.filter((s) => (s as any).categoryId === category._id),
    }));

    return [
      { category: { _id: "uncategorized", name: "Other Services", code: "OTHER" } as any, services: uncategorized },
      ...categorized,
    ];
  }, [selectedCategory, activeCategory, categories, filteredServices]);

  return (
    <div className="space-y-8">
      {/* Page heading (match home style) */}
      <div className="space-y-3">
        {/* <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gray-200)] bg-white px-3 py-1 text-xs font-bold text-[var(--gray-700)]">
          <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
          Premium Services
        </div> */}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)]">Services Marketplace</h1>

        <p className="text-[var(--gray-700)] max-w-3xl">
          Choose services to generate <span className="font-bold">Business Volume (BV)</span> and grow your referral income.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-3 py-2 text-sm font-semibold text-[var(--gray-800)]">
            <Star className="h-4 w-4 text-[#0EA5E9]" />
            Quality Assured
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-3 py-2 text-sm font-semibold text-[var(--gray-800)]">
            <TrendingUp className="h-4 w-4 text-[#0EA5E9]" />
            Instant BV
          </div>
        </div>
      </div>

      {/* Filter Card (clean + consistent with theme) */}
      <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#22C55E] to-[#0EA5E9]" />

        <div className="p-5 sm:p-6 space-y-5 pt-0">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--gray-900)]">
            <SlidersHorizontal className="h-4 w-4 text-[#0EA5E9]" />
            Search & Filter
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative w-full">
                {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}

                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search services..."
                  className="
      w-full
      rounded-xl
      border border-[var(--gray-200)]
      bg-[var(--gray-50)]
      py-2.5
      pl-12
      pr-4
      text-sm
      text-[var(--gray-900)]
      placeholder:text-[var(--gray-500)]
      focus:outline-none
      focus:bg-white
      focus:border-[#0EA5E9]
      focus:ring-2
      focus:ring-[#0EA5E9]/20
    "
                />
              </div>

            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2.5 text-sm font-semibold text-[var(--gray-900)] focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition ${selectedCategory === null
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[var(--gray-800)] border-[var(--gray-200)] hover:bg-[var(--gray-50)]"
                }`}
              style={
                selectedCategory === null
                  ? { background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }
                  : undefined
              }
            >
              All Categories
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-extrabold ${selectedCategory === null ? "bg-white/25 text-white" : "bg-[var(--gray-100)] text-[var(--gray-700)]"
                  }`}
              >
                {services.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = services.filter((s) => (s as any).categoryId === cat._id).length;
              const active = selectedCategory === cat._id;

              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition ${active
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-[var(--gray-800)] border-[var(--gray-200)] hover:bg-[var(--gray-50)]"
                    }`}
                  style={active ? { background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" } : undefined}
                >
                  {cat.name}
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-extrabold ${active ? "bg-white/25 text-white" : "bg-[var(--gray-100)] text-[var(--gray-700)]"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results line */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--gray-200)] pt-4">
            <div className="text-sm font-semibold text-[var(--gray-700)]">
              <span className="font-extrabold text-[var(--gray-900)]">{filteredServices.length}</span> of{" "}
              <span className="font-extrabold text-[var(--gray-900)]">{services.length}</span> services found
            </div>

            {searchTerm.trim() && (
              <span className="text-xs font-bold rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/10 text-[#0B5F7A] px-3 py-1">
                Search: “{searchTerm.trim()}”
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {servicesByCategory.map(({ category, services: categoryServices }) => {
          if (!selectedCategory && categoryServices.length === 0) return null;

          return (
            <section key={category._id} className="space-y-5">
              {/* Category title */}
              {!selectedCategory ? (
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-[var(--gray-900)]">{category.name}</p>
                    {/* <p className="text-sm text-[var(--gray-600)]">{category.code}</p> */}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#0EA5E9]">{categoryServices.length} <span className="text-sm text-[var(--gray-600)]">Services</span></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[var(--gray-900)]">{category.name}</h2>
                    <p className="text-sm text-[var(--gray-600)]">{category.code}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-[#0EA5E9]">{categoryServices.length}</div>
                    <p className="text-sm text-[var(--gray-600)]">Services</p>
                  </div>
                </div>
              )}

              {/* Grid */}
              {categoryServices.length > 0 ? (
                <ServicesGrid services={categoryServices} />
              ) : (
                <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gray-50)] border border-[var(--gray-200)]">
                    <Package className="h-8 w-8 text-[var(--gray-600)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--gray-900)]">No services found</h3>
                  <p className="mt-2 text-[var(--gray-700)]">Try another category or clear filters.</p>
                </div>
              )}
            </section>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gray-50)] border border-[var(--gray-200)]">
              <Package className="h-8 w-8 text-[var(--gray-600)]" />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--gray-900)]">No Services Found</h3>
            <p className="mt-2 text-[var(--gray-700)] max-w-md mx-auto">
              {searchTerm.trim() ? "Try adjusting your search terms." : "Check back soon for new services!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
