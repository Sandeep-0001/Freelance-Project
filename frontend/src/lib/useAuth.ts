"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, readApiBody } from "@/lib/apiClient";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserProfile } from "@/store/slices/userSlice";

export function useAuth(options?: { requireAdmin?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.user.profile);
  const [loading, setLoading] = useState(true);

  // Initial load from localStorage if no user in Redux state
  useEffect(() => {
    if (!currentUser) {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch(setUserProfile(user));
        } catch {
          console.warn("Failed to parse stored user");
          localStorage.removeItem('user');
        }
      }
    }
  }, [dispatch, currentUser]);

  // Sync with localStorage on user changes
  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Main authentication effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/me");
        const body = await readApiBody(res);
        
        if (!res.ok) {
          // Only redirect if we don't have a user in both localStorage and Redux state
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (!storedUser && !currentUser) {
            router.push("/login?redirect=" + window.location.pathname);
            return;
          }
        }
        
        let data: { user?: unknown; error?: string } | undefined;
        
        // Handle JSON response
        if (body.json) {
          data = body.json as { user?: unknown; error?: string };
        } else if (body.text) {
          // Handle non-JSON responses (like HTML error pages)
          try {
            const startIndex = body.text.indexOf('user:');
            if (startIndex !== -1) {
              const endIndex = body.text.indexOf('}', startIndex);
              if (endIndex !== -1) {
                const userInfo = JSON.parse(body.text.substring(startIndex + 5, endIndex + 1));
                data = { user: userInfo };
              }
            }
          } catch {
            console.warn("Could not parse user info from error response");
          }
        }
        
        // Update Redux state if we have valid user data
        if (data && data.user && typeof data.user === 'object' && data.user !== null) {
          // Only update if user is different from current Redux state
          if (!currentUser || JSON.stringify(currentUser) !== JSON.stringify(data.user)) {
            dispatch(setUserProfile(data.user as Record<string, unknown>));
            // Also update localStorage for persistence
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }
        }
        
        // Check if admin is required
        if (options?.requireAdmin && data?.user && typeof data.user === 'object' && 'role' in data.user && !["super_admin", "admin", "moderator"].includes(data.user.role as string)) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Don't automatically redirect on auth errors, let components handle it
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, options?.requireAdmin, dispatch, currentUser]);

  return { user: currentUser, loading };
}
