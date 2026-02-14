"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  businessVolume: number;
  status:
    | "pending_approval"
    | "approved"
    | "rejected"
    | "active"
    | "inactive"
    | "out_of_stock";
  image: string;
  gallery: string[];
  categoryId?: {
    _id: string;
    name: string;
    code: string;
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface ServicesResponse {
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-zinc-900">{value}</div>
      <div className="mt-1 text-sm text-zinc-600">{label}</div>
    </div>
  );
}

export default function ServiceApprovalPage() {
  useAuth({ requireAdmin: true });

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const pendingCount = pagination.total;

  useEffect(() => {
    fetchPendingServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  // cross-tab refresh (same pattern you used elsewhere)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin-action-updated") fetchPendingServices();
    };
    globalThis.addEventListener("storage", onStorage);
    return () => globalThis.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingServices = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });

      const response = await fetch(`/api/admin/services/pending?${params}`);
      if (!response.ok) throw new Error("Failed to fetch pending services");

      const data: ServicesResponse = await response.json();
      setServices(data.services);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const pingAdminUpdate = () => {
    globalThis.localStorage.setItem("admin-action-updated", Date.now().toString());
  };

  const approveService = async (serviceId: string) => {
    try {
      setError(null);
      setBusyId(serviceId);

      const response = await fetch(`/api/admin/services/${serviceId}/approve`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to approve service");

      pingAdminUpdate();
      await fetchPendingServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  const rejectService = async (serviceId: string, reason: string) => {
    try {
      setError(null);
      setBusyId(serviceId);

      const response = await fetch(`/api/admin/services/${serviceId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error("Failed to reject service");

      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedService(null);

      pingAdminUpdate();
      await fetchPendingServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      setError(null);
      setBusyId(serviceId);

      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete service");

      showSuccessToast("Service deleted successfully");
      pingAdminUpdate();
      await fetchPendingServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  const skeleton = useMemo(
    () => (
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 rounded-xl bg-zinc-200" />
          <div className="h-4 w-1/2 rounded-xl bg-zinc-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-36 rounded-2xl bg-zinc-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-zinc-200" />
                <div className="mb-4 h-3 w-1/2 rounded bg-zinc-200" />
                <div className="h-10 w-full rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    []
  );

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />
        {skeleton}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 mb-2">Service Approval</h1>
            <p className="text-sm text-zinc-600">
              Review and approve or reject pending service listings
            </p>
          </div>

          <button
            onClick={fetchPendingServices}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-800 shadow-sm hover:shadow-md transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div>{error}</div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search pending services by name, slug, category..."
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 !pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard icon={Clock} label="Pending" value={pendingCount} gradient="from-yellow-500 to-orange-500" />
          <StatCard icon={CheckCircle} label="Approved This Week" value="-" gradient="from-emerald-600 to-green-500" />
          <StatCard icon={XCircle} label="Rejected This Week" value="-" gradient="from-red-600 to-orange-500" />
        </div>

        {/* Services */}
        {services.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-sky-100">
              <Clock className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-900 mb-1">No Pending Services</h3>
            <p className="text-sm text-zinc-600">All services have been reviewed. Great job!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
              {services.map((service) => {
                const isBusy = busyId === service._id;

                return (
                  <div
                    key={service._id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-xl transition"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-zinc-100">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='800' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Settings className="h-12 w-12 text-zinc-300" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-extrabold text-zinc-900 mb-1 line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xl font-extrabold text-zinc-900">
                            ₹{service.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-zinc-500">BV: {service.businessVolume}</div>
                        </div>

                        {service.categoryId?.name ? (
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                            {service.categoryId.name}
                          </span>
                        ) : null}
                      </div>

                      {/* Tags */}
                      {service.tags?.length > 0 ? (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {service.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={`${service._id}-tag-${idx}`}
                              className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {service.tags.length > 3 ? (
                            <span className="text-xs text-zinc-500">+{service.tags.length - 3}</span>
                          ) : null}
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveService(service._id)}
                          disabled={isBusy}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isBusy ? "Working..." : "Approve"}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedService(service);
                            setShowRejectModal(true);
                          }}
                          disabled={isBusy}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>

                        <button
                          onClick={() => deleteService(service._id)}
                          disabled={isBusy}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 hover:text-red-600 hover:shadow-md transition disabled:opacity-60"
                          title="Delete Service"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-700">
                    Showing{" "}
                    <span className="font-bold">
                      {(currentPage - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold">
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-bold">{pagination.total}</span> results
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:shadow-md transition disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 text-sm font-semibold text-zinc-700">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:shadow-md transition disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-extrabold text-zinc-900 mb-2">Reject Service</h2>
              <p className="text-sm text-zinc-600 mb-4">
                Please provide a reason for rejecting{" "}
                <span className="font-bold text-zinc-900">“{selectedService.name}”</span>
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => rejectService(selectedService._id, rejectionReason.trim())}
                  disabled={!rejectionReason.trim() || busyId === selectedService._id}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {busyId === selectedService._id ? "Rejecting..." : "Reject"}
                </button>

                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedService(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-extrabold text-zinc-800 hover:shadow-md transition"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Tip: Use clear reasons like “Invalid documents”, “Wrong category”, “Pricing mismatch”, etc.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
