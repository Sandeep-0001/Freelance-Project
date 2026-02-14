"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, readApiBody } from "@/lib/apiClient";
import { useAuth } from "@/lib/useAuth";
import {
  IndianRupee,
  BarChart3,
  TrendingUp,
  Link as LinkIcon,
  ShoppingCart,
  Copy,
  Check,
  LogOut,
  Settings2,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type MeResponse = {
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
    referralCode: string;
    parent: string | null;
  };
};

type Service = {
  _id: string;
  name: string;
  price: number;
  businessVolume: number;
  status: "active" | "inactive";
};

type Income = {
  _id: string;
  level: number;
  bv: number;
  amount: number;
  fromUser?: { email: string; referralCode: string };
  createdAt: string;
};

export default function DashboardPage() {
  useAuth(); // Protect this page - require authentication
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, inc) => sum + (inc.amount ?? 0), 0),
    [incomes]
  );

  async function loadAll() {
    setError(null);

    const [meRes, servicesRes, incomeRes] = await Promise.all([
      apiFetch("/api/me"),
      apiFetch("/api/services"),
      apiFetch("/api/income"),
    ]);

    const meBody = await readApiBody(meRes);
    const meJson = meBody.json as any;
    if (!meRes.ok) throw new Error(meJson?.error ?? meBody.text ?? "Not logged in");

    const servicesBody = await readApiBody(servicesRes);
    const servicesJson = servicesBody.json as any;
    if (!servicesJson) throw new Error(servicesBody.text ?? "Invalid services response");

    const incomeBody = await readApiBody(incomeRes);
    const incomeJson = incomeBody.json as any;
    if (!incomeJson) throw new Error(incomeBody.text ?? "Invalid income response");

    setMe(meJson.user);
    setServices(servicesJson.services ?? []);
    setIncomes(incomeJson.incomes ?? []);

    const firstServiceId = (servicesJson.services?.[0]?._id as string | undefined) ?? "";
    setSelectedServiceId((prev) => prev || firstServiceId);
  }

  useEffect(() => {
    loadAll().catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  async function logout() {
    setBusy(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      showSuccessToast("Logged out successfully");
      window.location.href = "/login";
    } catch (error) {
      showErrorToast("Failed to logout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function buyService() {
    if (!selectedServiceId) return;
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: selectedServiceId }),
      });
      const body = await readApiBody(res);
      const json = body.json as any;
      if (!res.ok) throw new Error(json?.error ?? body.text ?? "Purchase failed");

      showSuccessToast("Service purchased successfully!");
      await loadAll();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  function addSelectedToCart() {
    if (!selectedServiceId) return;
    const service = services.find((s) => s._id === selectedServiceId);
    if (!service) return;

    dispatch(
      addItem({
        id: service._id,
        name: service.name,
        price: service.price,
        businessVolume: service.businessVolume,
        quantity: 1,
      })
    );

    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1500);
  }

  function copyReferralCode() {
    if (me?.referralCode) {
      navigator.clipboard.writeText(me.referralCode);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    }
  }

  if (error && !me) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />
        <div className="mx-auto max-w-2xl px-6 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
          <div className="mt-5 rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm">
            {error} —{" "}
            <Link prefetch={false} className="font-semibold underline hover:text-red-800" href="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      {/* top brand line */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Admin / User Dashboard</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Dashboard
            </h1>
            {me ? (
              <p className="mt-2 text-sm text-zinc-700">
                Welcome back,{" "}
                <span className="font-semibold bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent">
                  {me.email}
                </span>{" "}
                <span className="text-zinc-500">({me.role})</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {me?.role === "admin" ? (
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                prefetch={false}
                href="/admin/services"
              >
                <Settings2 className="h-4 w-4" />
                Manage Services
              </Link>
            ) : null}

            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              prefetch={false}
              href="/cart"
            >
              <ShoppingCart className="h-4 w-4 text-emerald-700" />
              Cart <span className="text-zinc-500">({cart.totalQuantity})</span>
            </Link>

            <button
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
              onClick={logout}
              disabled={busy}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Top Cards */}
        {me ? (
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Referral Code */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-zinc-900">Referral Code</h2>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-3">
                <code className="text-lg font-extrabold text-emerald-700">{me.referralCode}</code>

                <button
                  onClick={copyReferralCode}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-white shadow-sm transition hover:bg-emerald-50"
                  title={copiedCode ? "Copied!" : "Copy code"}
                  type="button"
                >
                  {copiedCode ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-emerald-700" />
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-zinc-600">
                Share this code to invite new users to your network.
              </p>
            </div>

            {/* Total Income */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-sm">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <h2 className="text-lg text-zinc-900">Total Income</h2>
              </div>

              <p className="mt-2 text-4xl bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent">
                {formatINR(totalIncome)}
              </p>

              <p className="mt-3 text-xs text-zinc-600">Cumulative income from your network.</p>
            </div>

            {/* Quick Stats */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-sky-600 text-white shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-zinc-900">Quick Stats</h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Income Entries</span>
                  <span className="font-extrabold text-zinc-900">{incomes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Available Services</span>
                  <span className="font-extrabold text-zinc-900">{services.length}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Purchase Service */}
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900">Purchase Service</h2>
              <p className="text-xs text-zinc-600">Choose a service and add it to cart or buy instantly.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {formatINR(s.price)} — BV {s.businessVolume}
                </option>
              ))}
            </select>

            <div className="flex gap-2 sm:flex-col">
              <button
                className="rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-extrabold text-emerald-800 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60"
                onClick={addSelectedToCart}
                disabled={busy || !selectedServiceId}
                type="button"
              >
                {addedToCart ? "Added" : "Add to Cart"}
              </button>

              <button
                className="rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-60"
                onClick={buyService}
                disabled={busy || !selectedServiceId}
                type="button"
              >
                {busy ? "Processing…" : "Buy Now"}
              </button>
            </div>
          </div>

          {services.length === 0 ? (
            <p className="mt-3 text-xs text-zinc-600">
              No services available. Admin needs to create services first.
            </p>
          ) : null}
        </div>

        {/* Income History */}
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900">Income History</h2>
                <p className="text-xs text-zinc-600">Track your referral earnings over time.</p>
              </div>
            </div>

            <Link
              className="text-sm font-semibold bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent hover:underline"
              prefetch={false}
              href="/referrals"
            >
              View Referral Tree →
            </Link>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-emerald-50 to-sky-50 text-left text-zinc-700">
                <tr>
                  <th className="py-3 px-4 font-extrabold">Date</th>
                  <th className="py-3 px-4 font-extrabold">From</th>
                  <th className="py-3 px-4 font-extrabold">Level</th>
                  <th className="py-3 px-4 font-extrabold">BV</th>
                  <th className="py-3 px-4 font-extrabold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc) => (
                  <tr
                    key={inc._id}
                    className="border-t border-zinc-200 hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="py-3 px-4">{new Date(inc.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{inc.fromUser?.email ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                        L{inc.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{inc.bv}</td>
                    <td className="py-3 px-4 text-emerald-700">{formatINR(inc.amount)}</td>
                  </tr>
                ))}

                {incomes.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-zinc-600" colSpan={5}>
                      No income entries yet. Purchase services to start earning!
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
