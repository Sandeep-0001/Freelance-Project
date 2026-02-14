import { apiUrl } from "@/lib/apiClient";
import ServicesCategoryClient from "@/app/services/ServicesCategoryClient";
import { headers } from "next/headers";
import type { Service } from "@/store/slices/serviceSlice";
import type { Category } from "@/store/slices/categorySlice";

// import sampleData from "./sample.json";

export const runtime = "nodejs";

async function toAbsolute(url: string) {
  if (!url.startsWith("/")) return url;

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  return origin ? `${origin}${url}` : url;
}

async function getServices() {
  try {
    const url = apiUrl("/api/services");
    const absoluteUrl = await toAbsolute(url);

    const res = await fetch(absoluteUrl, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.services as Service[]) || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const url = apiUrl("/api/categories");
    const absoluteUrl = await toAbsolute(url);

    const res = await fetch(absoluteUrl, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.categories as Category[]) || [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getCategories()]);

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ServicesCategoryClient services={services} categories={categories} />
      </div>
    </div>
  );
}
