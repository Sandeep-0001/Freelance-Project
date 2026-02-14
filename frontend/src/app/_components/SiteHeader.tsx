"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import ProfileSection from "./ProfileSection";

export default function SiteHeader() {
  const cartCount = useAppSelector((s) => s.cart.totalQuantity);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/business-opportunity", label: "Opportunity" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl">
        <div className=" flex items-center justify-between px-4 lg:px-6 h-16 bg-red">
          {/* Logo */}
          <Link className="items-left gap-3 group" href="/">
            <div className="relative text-left h-16 w-[125px] sm:w-[125px] bg-red">
              <Image
                 src="/brand/logo.png"
                alt="Sambhariya Marketing"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-sky-600 hover:bg-gray-50 rounded-md transition-colors"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              prefetch={false}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
              href="/cart"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              prefetch={false}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white text-sm font-semibold shadow-sm bg-gradient-to-r from-emerald-600 to-sky-600 hover:brightness-95 transition"
              href="/dashboard"
            >
              Dashboard
            </Link>

            <ProfileSection />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              prefetch={false}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
              href="/cart"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-fade-in">
          <nav className="px-4 py-4 space-y-1 max-w-7xl mx-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                className="block px-4 py-3 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="px-4 py-2">
                <ProfileSection />
              </div>

              <Link
                prefetch={false}
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-sky-600 hover:brightness-95 transition-colors"
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}