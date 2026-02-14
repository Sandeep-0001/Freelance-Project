"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/lib/useAuth";
import { AlertCircle, RefreshCw, Settings, Plus, List, Check, X, Edit, ClipboardList, Upload } from "lucide-react";
import { formatINR } from "@/lib/format";
import AdminServiceUpload from "./AdminServiceUpload";

type Service = {
  _id: string;
  name: string;
  price: number;
  businessVolume: number;
  status: "active" | "inactive";
  createdAt: string;
};

export default function AdminServicesPage() {
  useAuth({ requireAdmin: true }); // Protect admin page
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<"manage" | "upload">("manage");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [businessVolume, setBusinessVolume] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editBusinessVolume, setEditBusinessVolume] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    const res = await apiFetch("/api/admin/services");
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Failed to load");
    setServices(json.services ?? []);
  }

  useEffect(() => {
    load().catch((e) => setError(String(e?.message ?? e)));
  }, []);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      // Auto-generate slug if not provided
      const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const res = await apiFetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          slug: finalSlug,
          price, 
          businessVolume, 
          image: image || undefined,
          shortDescription: shortDescription || undefined,
          categoryId: categoryId || undefined,
          isFeatured,
          status: "active" 
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Create failed");
      setName("");
      setSlug("");
      setPrice("");
      setBusinessVolume("");
      setImage("");
      setShortDescription("");
      setCategoryId("");
      setIsFeatured(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  async function toggleActive(service: Service) {
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/admin/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: service.status === "active" ? "inactive" : "active" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(service: Service) {
    setEditingId(service._id);
    setEditName(service.name);
    setEditPrice(service.price);
    setEditBusinessVolume(service.businessVolume);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/admin/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, price: editPrice, businessVolume: editBusinessVolume }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
      setEditingId(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-gray-500 flex items-center justify-center text-white">
                <Settings className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-gray-600 bg-clip-text text-transparent">Manage Services</h1>
            </div>
            <p className="text-sm text-zinc-600 ml-15">Manage services and their Business Volume</p>
          </div>
          <div className="flex gap-3 animate-slide-in">
            <Link 
              className="glass-panel rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg border border-blue-200" 
              prefetch={false}
              href="/admin/rules"
            >
              Rules
            </Link>
            <Link 
              className="glass-panel rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg border border-blue-200" 
              prefetch={false}
              href="/dashboard"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 glass-panel animate-shake rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-blue-200">
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "manage"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Service
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "upload" && (
          <AdminServiceUpload />
        )}

        {activeTab === "manage" && (
          <>
            {error ? (
              <div className="mb-6 glass-panel animate-shake rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
                ⚠️ {error}
              </div>
            ) : null}

            <form className="glass-panel animate-fade-in rounded-2xl border border-blue-200 p-6 mb-6" onSubmit={createService} style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-bold text-xl">Create New Service</h2>
              </div>
              
              {/* Service Name & Slug */}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter service name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) setSlug(generateSlug(e.target.value));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL-friendly)</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="auto-generated from name"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated: {generateSlug(name || 'service')}</p>
                </div>
              </div>

              {/* Price & BV */}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Volume (BV) *</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    type="number"
                    value={businessVolume}
                    onChange={(e) => setBusinessVolume(e.target.value === "" ? "" : Number(e.target.value))}
                    min={0}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Image & Category */}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for default image</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="Category ID (optional)"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                <textarea
                  className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description (max 200 chars)"
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{shortDescription.length}/200</p>
              </div>

              {/* Featured Checkbox */}
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-200"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                  Featured Service
                </label>
              </div>

              <button
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100"
                disabled={busy || !name || price === "" || businessVolume === ""}
                type="submit"
              >
                {busy ? "Creating..." : "Create Service"}
              </button>
            </form>

            <div className="glass-panel animate-fade-in rounded-2xl border border-blue-200 p-6" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-bold text-xl">All Services</h2>
              </div>
              <div className="overflow-auto rounded-xl border border-blue-200">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 text-left text-zinc-700">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Price</th>
                      <th className="py-3 px-4 font-semibold">BV</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr className="border-t border-blue-200 hover:bg-blue-500/5 transition-colors" key={s._id}>
                        <td className="py-3 px-4">
                          {editingId === s._id ? (
                            <input
                              className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span className="font-medium">{s.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === s._id ? (
                            <input
                              className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium"
                              type="number"
                              step="0.01"
                              min={0}
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))}
                              placeholder="Price"
                            />
                          ) : (
                            <span className="font-bold text-green-600">{formatINR(s.price)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === s._id ? (
                            <input
                              className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium"
                              type="number"
                              min={0}
                              value={editBusinessVolume}
                              onChange={(e) => setEditBusinessVolume(e.target.value === "" ? "" : Number(e.target.value))}
                              placeholder="Business Volume"
                            />
                          ) : (
                            <span className="font-bold text-blue-600">{s.businessVolume}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {s.status === "active" ? (
                            <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-700 text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-700 text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === s._id ? (
                              <>
                                <button
                                  className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 border border-green-200 hover:bg-green-500/10 transition-colors"
                                  onClick={saveEdit}
                                  disabled={busy}
                                >
                                  ✓ Save
                                </button>
                                <button
                                  className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 border border-red-200 hover:bg-red-500/10 transition-colors"
                                  onClick={cancelEdit}
                                  disabled={busy}
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 border border-blue-200 hover:bg-blue-500/10 transition-colors"
                                  onClick={() => startEdit(s)}
                                  disabled={busy}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 border border-blue-200 hover:bg-blue-500/10 transition-colors"
                                  onClick={() => toggleActive(s)}
                                  disabled={busy}
                                >
                                  🔄 Toggle
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 ? (
                      <tr>
                        <td className="py-8 text-center text-zinc-600" colSpan={5}>
                          No services yet. Create your first service above!
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
