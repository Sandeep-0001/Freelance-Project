"use client";

import Link from "next/link";
import { BadgeCheck, ListChecks, Wallet, Network, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <ListChecks className="h-5 w-5 text-sky-600" />,
    title: "List Services Like a Marketplace",
    desc: "Create service listings and reach more customers with better visibility.",
  },
  {
    icon: <Network className="h-5 w-5 text-emerald-600" />,
    title: "Referral Network That Scales",
    desc: "Invite, refer and grow your network with clean tracking.",
  },
  {
    icon: <Wallet className="h-5 w-5 text-sky-600" />,
    title: "Commission & Payout Tracking",
    desc: "See referral history, commissions and payouts in one dashboard.",
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    title: "Reliable & Secure",
    desc: "Role-based access, secure auth and controlled admin management.",
  },
];

export default function LandingContentSections() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Everything you need to grow with referrals
          </h2>
          <p className="mt-3 text-gray-700">
            A simple, professional platform for service providers, affiliates, and customers.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                {f.icon}
              </div>
              <div className="mt-4 text-base font-bold text-gray-900">{f.title}</div>
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-14 rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Start earning in 3 simple steps</h3>
              <p className="mt-2 text-sm text-gray-700">
                Register, share your referral code, and earn commission on every successful referral.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { n: "01", t: "Create account", d: "Register as affiliate or customer." },
                  { n: "02", t: "Share & refer", d: "Invite people to services." },
                  { n: "03", t: "Earn commission", d: "Track earnings in dashboard." },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl bg-white border border-gray-200 p-4">
                    <div className="text-xs font-bold text-gray-600">{s.n}</div>
                    <div className="mt-1 font-bold text-gray-900">{s.t}</div>
                    <div className="mt-1 text-sm text-gray-700">{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <Link
                prefetch={false}
                href="/register"
                className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-emerald-600 to-sky-600 hover:brightness-95 transition"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-2 text-xs text-gray-600">
                Already have an account?{" "}
                <Link prefetch={false} href="/login" className="font-semibold text-sky-700 hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
