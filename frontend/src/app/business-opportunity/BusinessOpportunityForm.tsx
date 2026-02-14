"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { CheckCircle2, AlertTriangle, Mail, Send } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function BusinessOpportunityForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await apiFetch("/api/business-opportunity/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");

      const successMsg = json.emailed
        ? "Sent! Please check your inbox."
        : "Saved! Email sending is not configured yet on this server.";
      
      showSuccessToast(successMsg);
      setEmail("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
        >
          <Mail className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-[var(--gray-900)]">Get more information</h3>
          <p className="mt-1 text-sm text-[var(--gray-700)]">
            We’ll email you complete details about BV rules, earnings, and how to start.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--gray-500)]" />
            <input
              className="w-full rounded-xl border border-[var(--gray-200)] bg-white pl-12 pr-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }}
            disabled={busy}
            type="submit"
          >
            <Send className="h-4 w-4" />
            {busy ? "Sending..." : "Send Details"}
          </button>
        </div>

        <p className="text-xs text-[var(--gray-600)]">
          We respect your privacy. You can unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
