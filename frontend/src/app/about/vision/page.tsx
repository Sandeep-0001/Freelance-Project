import Link from "next/link";
import { ArrowLeft, BarChart3, Lock, Infinity, Target } from "lucide-react";

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Top header strip */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/about"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--gray-700)] hover:text-[var(--gray-900)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to About
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
            >
              <Target className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
                Our Vision
              </h1>
              <p className="text-sm text-[var(--gray-700)] max-w-3xl">
                Transparent, scalable referral growth — with BV-based income that stays consistent and predictable.
              </p>
            </div>
          </div>

          {/* Quick highlight row */}
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Unlimited Depth", value: "Network growth without arbitrary limits" },
              { label: "Real-time Updates", value: "Admin changes reflect instantly" },
              { label: "Secure & Fair", value: "Trustworthy, transparent distribution" },
            ].map((i) => (
              <div
                key={i.label}
                className="rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-5 py-4"
              >
                <div className="text-sm font-extrabold text-[var(--gray-900)]">{i.label}</div>
                <div className="mt-1 text-xs text-[var(--gray-600)]">{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          {/* Brand strip */}
          <div className="h-1 w-full" style={{ background: brandGradient }} />

          <div className="p-6 sm:p-10 space-y-10">
            {/* Text */}
            <div className="space-y-6 text-[var(--gray-800)] leading-relaxed">
              <p className="text-lg font-semibold text-[var(--primary)]">
                Our vision is a transparent and scalable platform where income calculation is clear, BV-based,
                and consistent across unlimited depth.
              </p>

              <p>
                Admin controls service pricing and BV values, and all pages and calculations reflect those
                updates consistently. This ensures fairness and predictability for every network member.
              </p>

              <p>
                We envision a future where referral marketing is synonymous with trust, transparency, and mutual growth.
                Where every participant can see exactly how their efforts contribute to their income and the success of their network.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center">
                  <Infinity className="h-7 w-7 text-[var(--primary)]" />
                </div>
                <h3 className="font-extrabold text-lg text-[var(--gray-900)]">Unlimited Depth</h3>
                <p className="mt-2 text-sm text-[var(--gray-700)]">
                  No arbitrary limits on network growth
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-[var(--primary)]" />
                </div>
                <h3 className="font-extrabold text-lg text-[var(--gray-900)]">Real-Time Updates</h3>
                <p className="mt-2 text-sm text-[var(--gray-700)]">
                  Instant reflection of all changes
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center">
                  <Lock className="h-7 w-7 text-[var(--primary)]" />
                </div>
                <h3 className="font-extrabold text-lg text-[var(--gray-900)]">Secure & Fair</h3>
                <p className="mt-2 text-sm text-[var(--gray-700)]">
                  Built with security and fairness at core
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-6 sm:p-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--gray-900)]">
                  Want to see BV in action?
                </h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">
                  Browse services and understand how purchases generate BV and growth.
                </p>
              </div>

              <Link
                href="/services"
                prefetch={false}
                className="inline-flex items-center justify-center h-12 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
                style={{ background: brandGradient }}
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
