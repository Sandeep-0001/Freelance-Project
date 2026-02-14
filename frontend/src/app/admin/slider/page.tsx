"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, readApiBody } from "@/lib/apiClient";
import { useAuth } from "@/lib/useAuth";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import ImageUpload from "@/app/_components/ImageUpload";
import SliderInlineEdit from "@/app/_components/SliderInlineEdit";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type Slider = {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminSliderPage() {
  useAuth({ requireAdmin: true });

  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [imageUploadKey, setImageUploadKey] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    order: 0,
    isActive: true,
  });

  async function loadSliders() {
    try {
      setError(null);
      const res = await apiFetch("/api/admin/sliders");
      const body = await readApiBody(res);
      if (!res.ok) throw new Error((body.json as any)?.error ?? "Failed to load sliders");
      setSliders((body.json as any)?.sliders || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sliders");
    } finally {
      setLoading(false);
    }
  }

  async function refreshSliders() {
    setIsRefreshing(true);
    setSuccess(null);
    setError(null);
    await loadSliders();
    showSuccessToast("Sliders refreshed successfully!");
    setSuccess("Sliders refreshed successfully!");
    setTimeout(() => setSuccess(null), 3000);
    setIsRefreshing(false);
  }

  useEffect(() => {
    loadSliders();
  }, []);

  async function createSlider(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch("/api/admin/sliders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: sliders.length,
        }),
      });
      const body = await readApiBody(res);
      if (!res.ok) throw new Error((body.json as any)?.error ?? "Failed to create slider");

      showSuccessToast("Slider created successfully!");
      setSuccess("Slider created successfully!");
      setFormData({ title: "", description: "", imageUrl: "", order: 0, isActive: true });

      // Force ImageUpload component to reset by changing its key
      setImageUploadKey((prev) => prev + 1);

      await loadSliders();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create slider";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  async function updateSlider(id: string, updates: Partial<Slider>) {
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch(`/api/admin/sliders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const body = await readApiBody(res);
      if (!res.ok) throw new Error((body.json as any)?.error ?? "Failed to update slider");

      showSuccessToast("Slider updated successfully!");
      setSuccess("Slider updated successfully!");
      setEditingId(null);
      await loadSliders();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update slider";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSlider(id: string) {
    if (!confirm("Are you sure you want to delete this slider?")) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch(`/api/admin/sliders/${id}`, { method: "DELETE" });
      const body = await readApiBody(res);
      if (!res.ok) throw new Error((body.json as any)?.error ?? "Failed to delete slider");

      showSuccessToast("Slider deleted successfully!");
      setSuccess("Slider deleted successfully!");
      await loadSliders();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete slider";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(slider: Slider) {
    await updateSlider(slider._id, { isActive: !slider.isActive });
  }

  async function reorderSliders(reorderedSliders: { id: string; order: number }[]) {
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Sending reorder data:", { sliders: reorderedSliders });
      const res = await apiFetch("/api/admin/sliders/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sliders: reorderedSliders }),
      });
      const body = await readApiBody(res);
      console.log("Response:", res.status, body);
      if (!res.ok) throw new Error((body.json as any)?.error ?? "Failed to reorder sliders");

      showSuccessToast("Sliders reordered successfully!");
      setSuccess("Sliders reordered successfully!");
      await loadSliders();
    } catch (err: unknown) {
      console.error("Reorder error:", err);
      setError(err instanceof Error ? err.message : "Failed to reorder sliders");
    } finally {
      setBusy(false);
    }
  }

  function moveSliderUp(index: number) {
    if (index === 0) return;
    const newSliders = [...sliders];
    [newSliders[index], newSliders[index - 1]] = [newSliders[index - 1], newSliders[index]];
    const reordered = newSliders.map((slider, idx) => ({ id: slider._id.toString(), order: idx }));
    reorderSliders(reordered);
  }

  function moveSliderDown(index: number) {
    if (index === sliders.length - 1) return;
    const newSliders = [...sliders];
    [newSliders[index], newSliders[index + 1]] = [newSliders[index + 1], newSliders[index]];
    const reordered = newSliders.map((slider, idx) => ({ id: slider._id.toString(), order: idx }));
    reorderSliders(reordered);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600" />
            <p className="mt-4 text-zinc-600">Loading sliders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                <ImageIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Admin</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Slider Management
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage home page slider images and content
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              prefetch={false}
              href="/admin"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              prefetch={false}
              href="/admin/services"
            >
              Services
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              prefetch={false}
              href="/dashboard"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm font-semibold text-red-700 shadow-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Create New Slider */}
        <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-sky-600 text-white shadow">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900">Create New Slider</h2>
          </div>

          <form onSubmit={createSlider} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">Title *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
                placeholder="Enter slider title"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">Image *</label>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <ImageUpload
                  key={imageUploadKey}
                  onImageSelect={(imageUrl) => setFormData({ ...formData, imageUrl })}
                  currentImage={formData.imageUrl}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800">Description</label>
              <textarea
                maxLength={500}
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
                placeholder="Enter slider description (optional)"
              />
              <div className="mt-1 text-xs text-zinc-500">
                {formData.description.length}/500
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-60"
              >
                {busy ? "Creating..." : "Create Slider"}
              </button>
            </div>
          </form>
        </div>

        {/* Sliders List */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-600 text-white shadow">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900">All Sliders</h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {success && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              <button
                onClick={refreshSliders}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                title="Refresh all sliders"
                type="button"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Image Tabs */}
          {sliders.length > 0 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {sliders.map((slider, index) => (
                <button
                  key={slider._id}
                  onClick={() => setActiveImageId(slider._id)}
                  className={[
                    "relative flex-shrink-0 rounded-2xl border px-4 py-2 text-left transition",
                    activeImageId === slider._id
                      ? "border-sky-300 bg-gradient-to-r from-emerald-50 to-sky-50 shadow"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-8 overflow-hidden rounded-lg bg-zinc-100">
                      <img
                        src={slider.imageUrl}
                        alt={slider.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='24' viewBox='0 0 32 24'%3E%3Crect width='32' height='24' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    <span className="max-w-28 truncate text-xs font-extrabold text-zinc-800">
                      {slider.title || `Slider ${index + 1}`}
                    </span>

                    {slider.isActive && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </div>

                  {activeImageId === slider._id && (
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-sky-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          {sliders.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
              <p className="text-zinc-600">No sliders created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sliders.map((slider, index) => (
                <div
                  key={slider._id}
                  className={[
                    "rounded-3xl border p-4 transition",
                    activeImageId === slider._id
                      ? "border-sky-300 bg-gradient-to-r from-emerald-50/60 to-sky-50/60 shadow"
                      : "border-zinc-200 hover:bg-zinc-50/60",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Image Preview */}
                    <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-zinc-100 sm:h-16 sm:w-28 flex-shrink-0">
                      <img
                        src={slider.imageUrl}
                        alt={slider.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='64' viewBox='0 0 112 64'%3E%3Crect width='112' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      {activeImageId === slider._id && (
                        <div className="absolute right-2 top-2 h-3 w-3 animate-pulse rounded-full bg-sky-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {editingId === slider._id ? (
                        <SliderInlineEdit
                          slider={slider}
                          onSave={(updatedSlider) => updateSlider(slider._id, updatedSlider)}
                          onCancel={() => {
                            setEditingId(null);
                            loadSliders();
                          }}
                          busy={busy}
                        />
                      ) : (
                        <div>
                          <h3 className="mb-1 text-lg font-extrabold text-zinc-900">{slider.title}</h3>
                          {slider.description ? (
                            <p className="mb-2 text-sm text-zinc-600">{slider.description}</p>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-700">
                              Order: {slider.order}
                            </span>
                            <span
                              className={[
                                "rounded-full border px-2.5 py-1 font-semibold",
                                slider.isActive
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-700",
                              ].join(" ")}
                            >
                              {slider.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-700">
                              Created: {new Date(slider.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveSliderUp(index)}
                          disabled={index === 0}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                          title="Move up"
                          type="button"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSliderDown(index)}
                          disabled={index === sliders.length - 1}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                          title="Move down"
                          type="button"
                        >
                          ↓
                        </button>
                      </div>

                      {editingId === slider._id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateSlider(slider._id, slider)}
                            disabled={busy}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                            title="Save"
                            type="button"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              loadSliders();
                            }}
                            className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                            title="Cancel"
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingId(slider._id)}
                            disabled={busy}
                            className="rounded-xl border border-sky-200 bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
                            title="Edit"
                            type="button"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(slider)}
                            disabled={busy}
                            className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                            title={slider.isActive ? "Deactivate" : "Activate"}
                            type="button"
                          >
                            {slider.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteSlider(slider._id)}
                            disabled={busy}
                            className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                            title="Delete"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
