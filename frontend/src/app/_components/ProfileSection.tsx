"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  User,
  ChevronDown,
  LogOut,
  Settings,
  Link as LinkIcon,
  UserCircle,
  ShoppingBag,
  Home,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUserProfile } from "@/store/slices/userSlice";
import { apiFetch } from "@/lib/apiClient";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type AnyUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  profileImage?: string | null;
};

const brandGradient = "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)";

export default function ProfileSection() {
  const user = useAppSelector((s) => s.user.profile) as AnyUser | null;
  const dispatch = useAppDispatch();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const profileImageSrc = useMemo(() => {
    if (!user?.profileImage || typeof user.profileImage !== "string") return null;

    if (user.profileImage.startsWith("http")) return user.profileImage;

    // If backend serves uploads, prefer API base if available, fallback to localhost
    if (user.profileImage.startsWith("/uploads")) {
      const apiBase =
        (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
        "http://localhost:4000";
      return `${apiBase}${user.profileImage}`;
    }

    return user.profileImage;
  }, [user?.profileImage]);

  const refreshUserData = async () => {
    try {
      const res = await apiFetch("/api/me");
      if (res.ok) {
        const body = await res.json();
        if (body.user) {
          dispatch({ type: "user/setUserProfile", payload: body.user });
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(body.user));
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Check authentication state on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch({ type: "user/setUserProfile", payload: parsedUser });
          } catch {
            console.warn("Failed to parse stored user");
            localStorage.removeItem("user");
          }
        }

        await refreshUserData();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      refreshUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      showSuccessToast("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to logout. Please try again.");
    } finally {
      dispatch(clearUserProfile());
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      window.location.href = "/login";
    }
  };

  const closeMenu = () => setIsProfileDropdownOpen(false);

  // Theme helpers (uses your globals.css variables)
  const BRAND_BG = "bg-[var(--primary)]";
  const BRAND_TEXT = "text-[var(--primary)]";
  const BRAND_HOVER_TEXT = "hover:text-[var(--primary)]";
  const BRAND_RING = "focus-visible:ring-[var(--primary)]";

  const menuItemBase =
    "mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";
  const menuItemHover =
    "hover:bg-[var(--gray-50)] hover:text-[var(--gray-900)] active:bg-[var(--gray-100)]";

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={profileDropdownRef}>
      <button
        onClick={() => setIsProfileDropdownOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors hover:bg-[var(--gray-50)] ${BRAND_HOVER_TEXT} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${BRAND_RING}`}
        aria-haspopup="menu"
        aria-expanded={isProfileDropdownOpen}
      >
        <div
          className={`w-7 h-7 rounded-full ${BRAND_BG} flex items-center justify-center overflow-hidden shadow-sm`}
          aria-hidden="true"
        >
          {user ? (
            profileImageSrc ? (
              <img
                src={profileImageSrc}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  console.error("Failed to load profile image:", user?.profileImage);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )
          ) : (
            <UserCircle className="w-4 h-4 text-white" />
          )}
        </div>

        <span className="hidden md:block truncate max-w-[160px]">
          {user ? user.name || user.email || "User" : "Hello, Guest"}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isProfileDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isProfileDropdownOpen && (
        <div
          className="absolute right-0 mt-3 w-[320px] origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden"
          role="menu"
        >
          {/* caret */}
          <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 bg-white ring-1 ring-black/5" />

          {/* Header */}
          <div className="px-4 py-4 bg-[var(--gray-50)] border-b border-[var(--gray-200)]">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full ${BRAND_BG} flex items-center justify-center overflow-hidden shadow-sm`}
              >
                {user ? (
                  profileImageSrc ? (
                    <img
                      src={profileImageSrc}
                      alt="Profile"
                      className="h-10 w-10 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )
                ) : (
                  <UserCircle className="h-5 w-5 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">Signed in as</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user ? user.name || user.email || "User" : "Guest"}
                </div>

                {/* <div className="mt-1 inline-flex items-center rounded-full border border-[var(--gray-200)] bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {user ? (user.role === "admin" ? "Admin" : "Member") : "Visitor"}
                </div> */}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="py-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <Home className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Dashboard
                </Link>

                <Link
                  href="/profile"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <UserCircle className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Profile
                </Link>

                <Link
                  href="/orders"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <ShoppingBag className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Orders
                </Link>

                <Link
                  href="/referrals"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <LinkIcon className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Referrals
                </Link>

                {user.role === "admin" && (
                  <>
                    <div className="my-2 border-t border-[var(--gray-200)]" />

                    <Link
                      href="/admin"
                      className={`${menuItemBase} ${menuItemHover}`}
                      onClick={closeMenu}
                    >
                      <Settings className={`w-4 h-4 ${BRAND_TEXT}`} />
                      Admin Panel
                    </Link>

                    <Link
                      href="/admin/users"
                      className={`${menuItemBase} ${menuItemHover}`}
                      onClick={closeMenu}
                    >
                      <Users className={`w-4 h-4 ${BRAND_TEXT}`} />
                      Manage Users
                    </Link>

                    <Link
                      href="/admin/slider"
                      className={`${menuItemBase} ${menuItemHover}`}
                      onClick={closeMenu}
                    >
                      <ImageIcon className={`w-4 h-4 ${BRAND_TEXT}`} />
                      Manage Sliders
                    </Link>
                  </>
                )}

                <div className="my-2 border-t border-[var(--gray-200)]" />

                <Link
                  href="/settings"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <Settings className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className={`${menuItemBase} ${menuItemHover} w-full text-left`}
                  role="menuitem"
                >
                  <LogOut className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <User className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className={`${menuItemBase} ${menuItemHover}`}
                  onClick={closeMenu}
                >
                  <UserCircle className={`w-4 h-4 ${BRAND_TEXT}`} />
                  Sign Up
                </Link>

                <div className="mt-2 px-4 pb-4">
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:shadow-md transition"
                    style={{ background: brandGradient }}
                  >
                    Create Account
                  </Link>

                  <p className="mt-2 text-center text-[11px] text-gray-500">
                    Create an account to track orders & referrals.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
