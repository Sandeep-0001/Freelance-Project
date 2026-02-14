import Link from "next/link";
import { KeyRound, Sparkles } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            Your Account
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Access your dashboard or create a new account to get started
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link 
            className="glass-panel animate-fade-in rounded-2xl border border-blue-200 p-8 transition-all hover:scale-105 hover:shadow-2xl group" 
            prefetch={false}
            href="/login"
            style={{animationDelay: '0.1s'}}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                🔐
              </div>
              <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Sign In
              </div>
            </div>
            <p className="text-zinc-600">
              Already have an account? Access your dashboard, view earnings, and manage your referral network.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <span>Continue to Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link 
            className="glass-panel animate-fade-in rounded-2xl border border-blue-200 p-8 transition-all hover:scale-105 hover:shadow-2xl group" 
            prefetch={false}
            href="/register"
            style={{animationDelay: '0.2s'}}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-gray-500 flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-gray-600 bg-clip-text text-transparent">
                Join Us
              </div>
            </div>
            <p className="text-zinc-600">
              New to ReferGrow? Create your account and start building your network. Terms acceptance required.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <span>Get Started Now</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 glass-panel animate-fade-in rounded-2xl border border-blue-200 p-6 text-center" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>All systems operational • Secure authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
