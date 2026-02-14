import BusinessOpportunityForm from "./BusinessOpportunityForm";
import { TrendingUp, IndianRupee, Lock, Briefcase, Infinity, Zap } from "lucide-react";

export default function BusinessOpportunityPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Hero */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              {/* <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-1 text-xs font-bold text-[var(--gray-700)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Referral • BV • Commission
              </div> */}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
                Business Opportunity
              </h1>

              <p className="text-[var(--gray-700)] max-w-3xl">
                Build a sustainable income stream through our transparent{" "}
                <span className="font-bold text-[var(--gray-900)]">Business Volume (BV)</span>{" "}
                system—simple, trackable, and scalable.
              </p>
            </div>

            <div className="hidden md:block">
              <div
                className="rounded-2xl p-[1px] shadow-sm"
                style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }}
              >
                <div className="rounded-2xl bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
                    >
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-extrabold text-[var(--gray-900)]">Start earning</div>
                      <div className="text-xs text-[var(--gray-600)]">Track referrals & BV in dashboard</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* How it works */}
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }} />
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-[var(--gray-900)]">How it works</h2>
                  <p className="text-sm text-[var(--gray-700)] leading-relaxed">
                    Income is calculated from <span className="font-bold">Business Volume (BV)</span>. Every service has a BV
                    value—repurchases generate BV again, compounding your earnings over time.
                  </p>
                  <p className="text-sm text-[var(--gray-700)] leading-relaxed">
                    Our system tracks each transaction and distributes income fairly across your network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }} />
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--gray-900)]">Commission structure</h2>
                  <p className="mt-1 text-sm text-[var(--gray-700)]">
                    Level-wise commission distributed as a decreasing percentage of BV.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { level: "Level 1", value: "5% of BV" },
                  { level: "Level 2", value: "2.5% of BV" },
                  { level: "Level 3", value: "1.25% of BV" },
                  { level: "Level 4", value: "0.625% of BV" },
                  { level: "Level 5+", value: "50% of previous" },
                ].map((row) => (
                  <div
                    key={row.level}
                    className="flex items-center justify-between rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-4 py-3"
                  >
                    <span className="text-sm font-bold text-[var(--gray-900)]">{row.level}</span>
                    <span className="text-sm " style={{ color: "#0EA5E9" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-[var(--gray-600)]">
                Note: percentages shown are illustrative; update these anytime based on your business rules.
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
            <h2 className="text-xl font-extrabold text-[var(--gray-900)]">Request details</h2>
            <p className="mt-1 text-sm text-[var(--gray-700)]">
              Enter your email and we’ll send the complete plan, BV rules, and commission breakdown.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <BusinessOpportunityForm />
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Infinity,
              title: "Unlimited Depth",
              desc: "No limits on network growth potential.",
            },
            {
              icon: Lock,
              title: "100% Transparent",
              desc: "Every BV transaction is visible and verifiable.",
            },
            {
              icon: Zap,
              title: "Instant Distribution",
              desc: "Automated income calculation and distribution.",
              highlight: true,
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm p-6 hover:shadow-md transition"
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
              >
                <f.icon className="h-6 w-6" />
              </div>

              <h3 className={`mt-4 text-lg font-extrabold ${f.highlight ? "text-emerald-700" : "text-[var(--gray-900)]"}`}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
