"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  fullName: string;
  email: string;
  mobile: string;
  role: "super_admin" | "admin" | "moderator" | "user";
  status: "active" | "suspended" | "deleted";
  activityStatus: "active" | "inactive";
  kycStatus: "pending" | "submitted" | "verified" | "rejected";
  createdAt: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  parent?: {
    name: string;
    email: string;
    mobile: string;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function UsersPage() {
  useAuth({ requireAdmin: true });
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    if (role) setRoleFilter(role);
    if (status) setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (
    userId: string,
    status: "active" | "suspended" | "deleted"
  ) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update user status");

      // Trigger real-time update across all tabs
      globalThis.localStorage.setItem(
        "admin-action-updated",
        Date.now().toString()
      );

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "border-sky-200 bg-sky-50 text-sky-800";
      case "admin":
        return "border-sky-200 bg-sky-50 text-sky-800";
      case "moderator":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-800";
    }
  };

  const getActivityStatusBadgeColor = (activityStatus: string) => {
    switch (activityStatus) {
      case "active":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      case "inactive":
        return "border-amber-200 bg-amber-50 text-amber-800";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-800";
    }
  };

  const getAccountStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-sky-200 bg-sky-50 text-sky-800";
      case "suspended":
        return "border-red-200 bg-red-50 text-red-800";
      case "deleted":
        return "border-zinc-200 bg-zinc-50 text-zinc-800";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-800";
    }
  };

  const getKycBadgeColor = (status: string) => {
    switch (status) {
      case "verified":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      case "submitted":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "rejected":
        return "border-red-200 bg-red-50 text-red-800";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-800";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 rounded bg-zinc-200 mb-4" />
            <div className="h-4 w-1/2 rounded bg-zinc-200 mb-8" />
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-zinc-100 last:border-b-0">
                  <div className="h-10 w-10 rounded-2xl bg-zinc-200" />
                  <div className="flex-1">
                    <div className="h-4 w-1/4 rounded bg-zinc-200 mb-2" />
                    <div className="h-3 w-1/3 rounded bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                <Users className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Admin</span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              User Management
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage user accounts, roles, and permissions.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 !pl-12 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
            >
              <option value="">All Status</option>
              <option value="active">Currently Active</option>
              <option value="inactive">Currently Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="new">New This Month</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm font-semibold text-red-700 shadow-sm">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Table */}
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-sky-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Activity / Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    KYC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div>
                        <div className="text-sm font-bold text-zinc-900">{user.fullName}</div>
                        <div className="text-sm text-zinc-500">{user.name}</div>
                        {user.parent ? (
                          <div className="mt-1 text-xs text-zinc-400">
                            Referred by: {user.parent.name}
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-zinc-900">{user.email}</div>
                      <div className="text-sm text-zinc-500">{user.mobile}</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
                          getRoleBadgeColor(user.role),
                        ].join(" ")}
                      >
                        {user.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
                          getActivityStatusBadgeColor(user.activityStatus),
                        ].join(" ")}
                      >
                        {user.activityStatus.toUpperCase()}
                      </span>
                      <span
                        className={[
                          "ml-2 inline-flex items-center rounded-xl border px-2 py-0.5 text-xs",
                          getAccountStatusBadgeColor(user.status),
                        ].join(" ")}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
                          getKycBadgeColor(user.kycStatus),
                        ].join(" ")}
                      >
                        {user.kycStatus.replace("_", " ").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        {user.status === "active" ? (
                          <button
                            onClick={() => updateUserStatus(user._id, "suspended")}
                            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                            title="Suspend User"
                            type="button"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user._id, "active")}
                            className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                            title="Activate User"
                            type="button"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50"
                          type="button"
                          title="More"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-zinc-700">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span> results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                  type="button"
                >
                  Previous
                </button>

                <span className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">
                  Page <span className="font-bold">{currentPage}</span> of{" "}
                  <span className="font-bold">{pagination.pages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Mobile pagination */}
            <div className="mt-3 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                type="button"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Create User Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">Create New User</h2>
              </div>

              <p className="text-sm text-zinc-600 mb-5">
                User creation form will be implemented here.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
                  type="button"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700"
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersPage />
    </Suspense>
  );
}

export default UsersPageWrapper;
