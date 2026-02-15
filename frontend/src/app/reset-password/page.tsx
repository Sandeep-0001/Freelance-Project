"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, readApiBody } from "@/lib/apiClient";
import { ArrowLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!email.trim()) {
        showErrorToast("Please enter your email address");
        return;
      }

      if (!otp.trim() || otp.length !== 6) {
        showErrorToast("Please enter the 6-digit OTP sent to your email");
        return;
      }

      if (newPassword.length < 8) {
        showErrorToast("Password must be at least 8 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        showErrorToast("Passwords do not match");
        return;
      }

      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim(),
          newPassword 
        }),
      });

      const body = await readApiBody(res);
      const data = body.json as { error?: string; message?: string } | null;

      if (!res.ok) {
        const errorMsg = data?.error || data?.message || body.text || "Failed to reset password. Please try again.";
        showErrorToast(errorMsg);
        return;
      }

      showSuccessToast("Password reset successful! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link
            prefetch={false}
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--gray-700)] hover:text-[var(--gray-900)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm">
            {/* Brand strip */}
            <div className="h-1 w-full" style={{ background: brandGradient }} />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)" }}
                >
                  <KeyRound className="h-7 w-7" />
                </div>

                <h1 className="text-2xl font-extrabold text-[var(--gray-900)]">
                  Reset Password
                </h1>
                <p className="text-sm text-[var(--gray-700)]">
                  Enter the OTP sent to your email and create a new password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[var(--gray-800)]">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gray-500)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] !pl-12 pr-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition"
                      required
                    />
                  </div>
                </div>

                {/* OTP */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-bold text-[var(--gray-800)]">
                    OTP Code
                  </label>
                  <div className="relative mt-2">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gray-500)]" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] !pl-12 pr-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition tracking-widest font-mono"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--gray-500)]">
                    Check your email for the 6-digit OTP code
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-[var(--gray-800)]">
                    New Password
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gray-500)]" />
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] !pl-12 pr-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--gray-500)]">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-[var(--gray-800)]">
                    Confirm New Password
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gray-500)]" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] !pl-12 pr-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl font-extrabold text-white shadow-sm py-3 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: loading ? "var(--gray-400)" : brandGradient,
                  }}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-[var(--gray-700)]">
                  Didn't receive OTP?{" "}
                  <Link prefetch={false} href="/forgot-password" className="font-extrabold text-[var(--primary)] hover:underline">
                    Resend
                  </Link>
                </p>
                <p className="text-sm text-[var(--gray-700)]">
                  Remember your password?{" "}
                  <Link prefetch={false} href="/login" className="font-extrabold text-[var(--primary)] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
