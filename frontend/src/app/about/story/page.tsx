import { Gem, Sprout, BookOpen, ArrowLeft, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
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
              <BookOpen className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
                Our Story
              </h1>
              <p className="text-sm text-[var(--gray-700)] max-w-3xl">
                ReferGrow is built around one idea: make referral rewards transparent and predictable through BV.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          <div className="h-1 w-full" style={{ background: brandGradient }} />
          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-[var(--gray-800)] leading-relaxed">
              <span className="font-extrabold" style={{ color: "#0EA5E9" }}>
                ReferGrow
              </span>{" "}
              is built around a simple yet powerful idea: reward community growth using{" "}
              <span className="font-extrabold text-[var(--gray-900)]">Business Volume (BV)</span> so every purchase can
              contribute to structured, level-wise income.
            </p>

            <p className="text-[var(--gray-700)] leading-relaxed">
              Anyone can join, purchase services, and build a network while the system automatically tracks BV and
              distributes income along the upline.
            </p>

            <p className="text-[var(--gray-700)] leading-relaxed">
              Our goal is to create a sustainable referral ecosystem where trust comes from clarity: users should be
              able to understand how income is calculated and where it is distributed.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              {[
                { icon: ShieldCheck, title: "Trust", desc: "Clear, verifiable income entries" },
                { icon: TrendingUp, title: "Growth", desc: "BV compounding via repurchases" },
                { icon: Gem, title: "Value", desc: "Fair, level-wise distribution" },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-5"
                >
                  <b.icon className="h-5 w-5 text-[var(--primary)]" />
                  <div className="mt-3 text-sm font-extrabold text-[var(--gray-900)]">{b.title}</div>
                  <div className="mt-1 text-xs text-[var(--gray-600)]">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm p-6 sm:p-7 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
              >
                <Sprout className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[var(--gray-900)]">Community first</h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">
                  We empower every member to grow through collaboration and a clear earning structure.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm p-6 sm:p-7 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
              >
                <Gem className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[var(--gray-900)]">Transparency</h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">
                  Every BV distribution and income calculation is designed to be clear and verifiable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-[var(--gray-900)]">Want to explore services?</h3>
              <p className="mt-1 text-sm text-[var(--gray-700)]">Browse our services and start generating BV.</p>
            </div>

            <Link
              href="/services"
              prefetch={false}
              className="inline-flex items-center justify-center h-12 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
              style={{ background: brandGradient }}
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
