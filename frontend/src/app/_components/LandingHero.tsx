"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, TrendingUp } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* soft background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Referral • Growth • Services Marketplace
            </span> */}

            <h1 className="mt-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Grow your business with{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                referrals & trusted services
              </span>
              .
            </h1>

            <p className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
              Sambhariya Marketing helps you list services, build a referral network,
              and earn commission on every successful referral—simple, transparent, and scalable.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                prefetch={false}
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-emerald-600 to-sky-600 hover:brightness-95 transition"
              >
                Become an Affiliate <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                prefetch={false}
                href="/services"
                className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-gray-800 border border-gray-200 hover:bg-gray-50 transition"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Trusted</div>
                  <div className="text-gray-600">Verified listings</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <Users className="h-5 w-5 text-sky-600" />
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Community</div>
                  <div className="text-gray-600">Referral network</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Earnings</div>
                  <div className="text-gray-600">Track commissions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Marketplace Snapshot</div>
                <div className="text-xs font-semibold text-gray-600">Live</div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {[
                  { title: "Home Services", value: "1,250+ providers" },
                  { title: "Education & Coaching", value: "480+ providers" },
                  { title: "Business Solutions", value: "760+ providers" },
                ].map((x) => (
                  <div key={x.title} className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                    <div className="text-sm font-semibold text-gray-900">{x.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{x.value}</div>
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm font-semibold text-gray-900">Referral Earnings</div>
                <div className="mt-1 text-sm text-gray-600">Earn commission on every successful referral.</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-600 to-sky-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">Affiliate Dashboard</div>
                    <div className="text-gray-600">Track referrals & payouts</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -z-10 -bottom-6 -left-6 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="absolute -z-10 -top-6 -right-6 h-32 w-32 rounded-full bg-sky-200/40 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
