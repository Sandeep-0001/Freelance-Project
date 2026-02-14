"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  Settings,
  List,
  Users,
  BarChart3,
  Mail,
  Image as ImageIcon,
  UserCheck,
  FolderOpen,
  CreditCard,
  FileCheck,
  ArrowLeft,
} from "lucide-react";

export default function AdminPage() {
  useAuth({ requireAdmin: true }); // Protect admin page

  const cards = [
    {
      href: "/admin/analytics",
      title: "Analytics Dashboard",
      desc: "View comprehensive platform analytics and insights",
      icon: BarChart3,
    },
    {
      href: "/admin/users",
      title: "User Management",
      desc: "Create, manage and monitor user accounts and roles",
      icon: Users,
    },
    {
      href: "/admin/service-approval",
      title: "Service Approval",
      desc: "Review and approve/reject service listings",
      icon: UserCheck,
    },
    {
      href: "/admin/categories",
      title: "Categories & Subcategories",
      desc: "Manage service categories and subcategories",
      icon: FolderOpen,
    },
    {
      href: "/admin/kyc",
      title: "KYC Management",
      desc: "Review and approve user KYC submissions",
      icon: FileCheck,
    },
    {
      href: "/admin/payment-settings",
      title: "Payment Settings",
      desc: "Configure payment links and UPI settings",
      icon: CreditCard,
    },
    {
      href: "/admin/contacts",
      title: "Contact Submissions",
      desc: "View and manage contact form submissions from users",
      icon: Mail,
    },
    {
      href: "/admin/services",
      title: "Services",
      desc: "Create and manage services, set pricing and business volume",
      icon: Settings,
    },
    {
      href: "/admin/slider",
      title: "Manage Sliders",
      desc: "Control home page slider images and content",
      icon: ImageIcon,
    },
    {
      href: "/admin/rules",
      title: "Distribution Rules",
      desc: "Configure commission rules and distribution percentages",
      icon: List,
    },
    {
      href: "/dashboard",
      title: "User Dashboard",
      desc: "View platform as a regular user",
      icon: BarChart3,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      {/* Brand top line */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                <Settings className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Admin</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage your platform settings and configurations.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-3">
                    <Icon className="h-6 w-6 text-emerald-700" />
                  </div>

                  <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-extrabold text-zinc-600 ring-1 ring-zinc-200 transition group-hover:bg-white">
                    Open →
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-zinc-900">{c.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{c.desc}</p>

                <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-emerald-200/70 via-teal-200/70 to-sky-200/70 opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>

        {/* Quick Overview */}
        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50">
              <BarChart3 className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-lg font-extrabold text-zinc-900">Quick Overview</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <Users className="mx-auto mb-2 h-9 w-9 text-emerald-700" />
              <p className="text-xs font-semibold text-zinc-600">Total Users</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900">-</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <Settings className="mx-auto mb-2 h-9 w-9 text-emerald-700" />
              <p className="text-xs font-semibold text-zinc-600">Active Services</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900">-</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-9 w-9 text-emerald-700" />
              <p className="text-xs font-semibold text-zinc-600">Total Revenue</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900">-</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Tip: When you connect real analytics data, we can replace “-” with live counts and revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
