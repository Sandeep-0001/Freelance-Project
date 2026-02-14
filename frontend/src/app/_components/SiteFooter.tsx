"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function SiteFooter() {
  const iconBtn =
    "inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:text-sky-700 hover:border-sky-200 hover:bg-sky-50 transition";

  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative h-30 w-[220px]">
                <Image
                  src="/brand/logo.png"
                  alt="Sambhariya Marketing"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700 max-w-sm">
              Referral • Growth • Services Marketplace — list services, build your referral network,
              and earn commission on each successful referral.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <Link href="#" className={iconBtn} aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className={iconBtn} aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className={iconBtn} aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" className={iconBtn} aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link prefetch={false} href="/services" className="text-gray-700 hover:text-sky-700 transition-colors">Services</Link></li>
                <li><Link prefetch={false} href="/business-opportunity" className="text-gray-700 hover:text-sky-700 transition-colors">Opportunity</Link></li>
                <li><Link prefetch={false} href="/referrals" className="text-gray-700 hover:text-sky-700 transition-colors">Referrals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-700 hover:text-sky-700 transition-colors">About</Link></li>
                <li><Link prefetch={false} href="/about/vision" className="text-gray-700 hover:text-sky-700 transition-colors">Vision</Link></li>
                <li><Link prefetch={false} href="/contact" className="text-gray-700 hover:text-sky-700 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link prefetch={false} href="/login" className="text-gray-700 hover:text-sky-700 transition-colors">Sign In</Link></li>
                <li><Link prefetch={false} href="/register" className="text-gray-700 hover:text-sky-700 transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link prefetch={false} href="/contact" className="text-gray-700 hover:text-sky-700 transition-colors">Help Center</Link></li>
                <li><Link prefetch={false} href="/privacy" className="text-gray-700 hover:text-sky-700 transition-colors">Privacy Policy</Link></li>
                <li><Link prefetch={false} href="/terms" className="text-gray-700 hover:text-sky-700 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-gray-600">© 2026 Sambhariya Marketing. All rights reserved.</p>
          <p className="text-xs text-gray-500">Built for referrals, growth & marketplace success.</p>
        </div>
      </div>
    </footer>
  );
}
