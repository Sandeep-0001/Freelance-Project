"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  Users,
  Settings,
  Mail,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ---------------- Types ---------------- */

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    providers: {
      total: number;
      active: number;
      new: number;
    };
    buyers: {
      total: number;
      active: number;
      new: number;
    };
    newRegistrations: number;
  };
  services: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
  };
  inquiries: {
    total: number;
    pending: number;
  };
}

/* ---------------- Helper UI Component ---------------- */

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (
    <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-zinc-900">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-sky-600 text-white shadow">
        <Icon className="h-5 w-5" />
      </span>
      {title}
    </h2>
  );
}

/* ---------------- Main Page ---------------- */

export default function AnalyticsPage() {
  useAuth({ requireAdmin: true });
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch Analytics ---------------- */

  useEffect(() => {
    fetchAnalytics();

    // Auto refresh every 30 sec
    const interval = setInterval(fetchAnalytics, 30000);

    // Cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-action-updated") {
        fetchAnalytics();
      }
    };

    globalThis.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      globalThis.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Navigation ---------------- */

  const handleCardClick = (filters: { role?: string; status?: string }) => {
    const params = new URLSearchParams();

    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);

    const url = `/admin/users${params.toString() ? `?${params}` : ""}`;
    router.push(url);
  };

  /* ---------------- Loading UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-1/3 rounded-xl bg-zinc-200" />
            <div className="h-4 w-1/2 rounded-xl bg-zinc-200" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-zinc-200" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-zinc-200" />
                  <div className="h-8 w-1/3 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Error UI ---------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-red-800 mb-2">
              Error loading analytics
            </h2>
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchAnalytics}
              className="mt-5 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  /* ---------------- Main UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50">
      {/* Top Brand Strip */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Premium overview of your platform performance
          </p>
        </div>

        {/* User Analytics */}
        <div className="mb-14">
          <SectionTitle icon={Users} title="User Analytics" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Users",
                value: analytics.users.total,
                icon: Users,
                gradient: "from-sky-600 to-emerald-600",
                click: {},
              },
              {
                label: "Active Users",
                value: analytics.users.active,
                icon: UserCheck,
                gradient: "from-emerald-600 to-green-500",
                click: { status: "active" },
              },
              {
                label: "New This Month",
                value: analytics.users.newRegistrations,
                icon: TrendingUp,
                gradient: "from-purple-600 to-sky-600",
                click: { status: "new" },
              },
              {
                label: "Inactive Users",
                value: analytics.users.total - analytics.users.active,
                icon: UserX,
                gradient: "from-red-600 to-orange-500",
                click: { status: "suspended" },
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleCardClick(card.click)}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-xl transition text-left"
                >
                  <span
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow`}
                  >
                    <Icon className="w-6 h-6" />
                  </span>

                  <p className="text-3xl font-extrabold text-zinc-900">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600">{card.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Analytics */}
        <div className="mb-14">
          <SectionTitle icon={Settings} title="Service Analytics" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total", value: analytics.services.total, icon: Settings },
              { label: "Pending", value: analytics.services.pending, icon: Clock },
              { label: "Approved", value: analytics.services.approved, icon: CheckCircle },
              { label: "Rejected", value: analytics.services.rejected, icon: XCircle },
              { label: "Active", value: analytics.services.active, icon: UserCheck },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg transition"
                >
                  <Icon className="w-7 h-7 text-sky-600 mb-4" />
                  <p className="text-2xl font-extrabold text-zinc-900">
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inquiry Analytics */}
        <div className="mb-14">
          <SectionTitle icon={Mail} title="Inquiry Analytics" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Total Inquiries", value: analytics.inquiries.total, icon: Mail },
              { label: "Pending Response", value: analytics.inquiries.pending, icon: Clock },
            ].map((q, i) => {
              const Icon = q.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg transition"
                >
                  <Icon className="w-7 h-7 text-emerald-600 mb-4" />
                  <p className="text-2xl font-extrabold text-zinc-900">
                    {q.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600">{q.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-10 shadow-sm">
          <h2 className="text-2xl font-extrabold text-zinc-900 mb-8">
            Platform Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { label: "Total Users", value: analytics.users.total, icon: Users },
              { label: "Active Services", value: analytics.services.active, icon: Settings },
              { label: "New Users", value: analytics.users.newRegistrations, icon: TrendingUp },
            ].map((x, i) => {
              const Icon = x.icon;
              return (
                <div key={i}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
                    <Icon className="w-8 h-8 text-sky-600" />
                  </div>

                  <p className="text-3xl font-extrabold text-zinc-900">
                    {x.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600">{x.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
