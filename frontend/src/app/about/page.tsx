import Link from "next/link";
import { ArrowRight, BookOpen, Target, Star } from "lucide-react";

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

const cards = [
  {
    href: "/about/story",
    title: "Our Story",
    desc: "Learn how ReferGrow was built to empower communities through transparent reward systems.",
    Icon: BookOpen,
  },
  {
    href: "/about/vision",
    title: "Vision",
    desc: "Explore our vision for a transparent, scalable platform that rewards network growth.",
    Icon: Target,
  },
  {
    href: "/about/success-stories",
    title: "Success Stories",
    desc: "Read inspiring stories from our thriving community members.",
    Icon: Star,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-3">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-1 text-xs font-extrabold text-[var(--gray-700)]">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              Learn more about ReferGrow
            </div> */}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
              About <span className="text-[var(--primary)]">Sambhariya</span>
            </h1>

            <p className="text-[var(--gray-700)] max-w-3xl">
              Discover our mission, vision, and the success stories that define our community.
            </p>
          </div>

          {/* Quick stats row (optional but nice) */}
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { k: "Transparent BV", v: "Clear income distribution" },
              { k: "Community Growth", v: "Referral-first platform" },
              { k: "Scalable System", v: "Built for long-term use" },
            ].map((i) => (
              <div
                key={i.k}
                className="rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-5 py-4"
              >
                <div className="text-sm font-extrabold text-[var(--gray-900)]">{i.k}</div>
                <div className="mt-1 text-xs text-[var(--gray-600)]">{i.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          {/* Brand strip */}
          <div className="h-1 w-full" style={{ background: brandGradient }} />

          <div className="p-6 sm:p-10">
            <div className="grid gap-6 md:grid-cols-3">
              {cards.map(({ href, title, desc, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className="group rounded-2xl border border-[var(--gray-200)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="h-10 w-10 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center text-[var(--gray-600)] group-hover:text-[var(--gray-900)] transition">
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <h2 className="text-lg font-extrabold text-[var(--gray-900)]">
                      {title}
                    </h2>
                    <p className="text-sm text-[var(--gray-700)] leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-6 text-xs font-bold text-[var(--primary)]">
                    Explore {title} →
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-6 sm:p-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--gray-900)]">
                  Ready to get started?
                </h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">
                  Join the platform and explore services that generate BV and growth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  prefetch={false}
                  className="inline-flex items-center justify-center h-12 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
                  style={{ background: brandGradient }}
                >
                  Create Account
                </Link>

                <Link
                  href="/services"
                  prefetch={false}
                  className="inline-flex items-center justify-center h-12 rounded-xl px-6 text-sm font-extrabold border border-[var(--gray-200)] bg-white text-[var(--gray-800)] hover:bg-[var(--gray-50)] transition"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
