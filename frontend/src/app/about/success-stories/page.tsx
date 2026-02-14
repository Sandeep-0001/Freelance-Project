import Link from "next/link";
import { User, Star, ArrowLeft } from "lucide-react";

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

type Story = {
  name: string;
  roleLine: string;
  quote: string;
  earned: string;
  referrals: string;
  accent?: "blue" | "green" | "orange";
};

const stories: Story[] = [
  {
    name: "Sarah Johnson",
    roleLine: "Network Builder • Level 5",
    quote:
      "ReferGrow changed my approach. The BV system and automated distribution make it easy to track growth and earnings.",
    earned: "₹5,240 earned",
    referrals: "50+ referrals",
    accent: "blue",
  },
  {
    name: "Michael Chen",
    roleLine: "Early Adopter • Level 7",
    quote:
      "The level-wise income structure ensures fair benefit across the network. I built a sustainable income stream while helping others succeed.",
    earned: "₹12,580 earned",
    referrals: "120+ referrals",
    accent: "blue",
  },
  {
    name: "Emma Rodriguez",
    roleLine: "Top Performer • Level 6",
    quote:
      "Transparency is my favorite part—BV calculations and income entries are clear and verifiable. It builds trust with my network.",
    earned: "₹8,920 earned",
    referrals: "75+ referrals",
    accent: "green",
  },
  {
    name: "David Kumar",
    roleLine: "Rising Star • Level 4",
    quote:
      "As a newcomer, the dashboard made it easy to get started. Automated income distribution means I focus on growth, not manual calculations.",
    earned: "₹3,450 earned",
    referrals: "35+ referrals",
    accent: "orange",
  },
];

function accentBg(accent?: Story["accent"]) {
  if (accent === "green") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (accent === "orange") return "bg-orange-50 border-orange-200 text-orange-900";
  return "bg-[var(--gray-50)] border-[var(--gray-200)] text-[var(--gray-900)]";
}

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
              <Star className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
                Success Stories
              </h1>
              <p className="text-sm text-[var(--gray-700)] max-w-2xl">
                Inspiring journeys from our community members—focused on clarity, trust, and sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {stories.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="h-1 w-full" style={{ background: brandGradient }} />
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
                  >
                    <User className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-[var(--gray-900)]">{s.name}</h3>
                    <p className="text-sm text-[var(--gray-600)]">{s.roleLine}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--gray-700)] leading-relaxed">
                  “{s.quote}”
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <div className={`rounded-xl border px-3 py-1 text-xs font-extrabold ${accentBg(s.accent)}`}>
                    {s.earned}
                  </div>
                  <div className="rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-1 text-xs font-extrabold text-[var(--gray-900)]">
                    {s.referrals}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gray-900)]">
              Ready to write your success story?
            </h2>
            <p className="mt-2 text-sm text-[var(--gray-700)]">
              Join members building networks and earning through a clear BV model.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                prefetch={false}
                className="inline-flex items-center justify-center h-12 rounded-xl px-7 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
                style={{ background: brandGradient }}
              >
                Get Started
              </Link>

              <Link
                href="/services"
                prefetch={false}
                className="inline-flex items-center justify-center h-12 rounded-xl px-7 text-sm font-extrabold border border-[var(--gray-200)] bg-[var(--gray-50)] text-[var(--gray-900)] hover:bg-white transition"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
