"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/lib/useAuth";
import { AlertCircle, RefreshCw, Settings, Plus, List, Check, X, Edit, ClipboardList, Upload, FolderOpen, Search, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import AdminServiceUpload from "./AdminServiceUpload";
import AdminCategoryUpload from "../categories_archived/AdminCategoryUpload";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type Service = {
  _id: string;
  name: string;
  price: number;
  businessVolume: number;
  status: "active" | "inactive";
  createdAt: string;
  categoryId?: string;
  category?: {
    _id: string;
    name: string;
  };
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  code: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  code: string;
  categoryId: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    _id: string;
    name: string;
    code: string;
  };
}

export default function AdminServicesPage() {
  useAuth({ requireAdmin: true }); // Protect admin page
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [activeTab, setActiveTab] = useState<"services" | "categories" | "subcategories" | "bulk-services" | "bulk-categories">("services");
  
  // Service states
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
  const [editCategoryId, setEditCategoryId] = useState("");
  
  // Category states
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    code: "",
    icon: "",
    image: "",
    isActive: true,
    sortOrder: 0,
    categoryId: "",
  });
  
  // General states
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load functions
  async function loadServices() {
    try {
      setError(null);
      const res = await apiFetch("/api/admin/services");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load services");
      setServices(json.services ?? []);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      setServices([]);
    }
  }

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCategories([]);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/subcategories");
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      const data = await response.json();
      setSubcategories(Array.isArray(data?.subcategories) ? data.subcategories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSubcategories([]);
    }
  };

  const refreshAll = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadServices(), fetchCategories(), fetchSubcategories()]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for updates from bulk upload (cross-tab + same-origin channel)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // localStorage cross-tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin-categories-updated" || e.key === "admin-services-updated") refreshAll();
    };
    globalThis.addEventListener("storage", onStorage);

    // BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("admin-services");
      channel.onmessage = (msg) => {
        if (msg?.data?.type === "CATEGORIES_UPDATED" || msg?.data?.type === "SERVICES_UPDATED") refreshAll();
      };
    } catch {
      channel = null;
    }

    return () => {
      globalThis.removeEventListener("storage", onStorage);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Service management functions
  async function createService(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      showErrorToast("Service name is required");
      return;
    }
    if (price === "" || price < 0) {
      showErrorToast("Valid price is required");
      return;
    }
    if (businessVolume === "" || businessVolume < 0) {
      showErrorToast("Valid business volume is required");
      return;
    }
    
    setBusy(true);
    setError(null);

    try {
      // Auto-generate slug if not provided
      const finalSlug = slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const serviceData: any = { 
        name: trimmedName, 
        slug: finalSlug,
        price, 
        businessVolume,
        isFeatured
      };
      
      // Only include optional fields if they have values
      if (image && image.trim()) serviceData.image = image.trim();
      if (shortDescription && shortDescription.trim()) serviceData.shortDescription = shortDescription.trim();
      if (categoryId && categoryId.trim()) serviceData.categoryId = categoryId.trim();
      
      const res = await apiFetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Create failed");
      
      // Reset form
      setName("");
      setSlug("");
      setPrice("");
      setBusinessVolume("");
      setImage("");
      setShortDescription("");
      setCategoryId("");
      setIsFeatured(false);
      
      await loadServices();
      
      // Show appropriate message based on backend response
      const successMessage = json.message || "Service created successfully";
      showSuccessToast(successMessage);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      showErrorToast(errorMsg);
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
      await loadServices();
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
    setEditCategoryId(service.categoryId || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditCategoryId("");
  }

  async function saveEdit() {
    if (!editingId) return;
    
    // Validation
    const trimmedName = editName.trim();
    if (!trimmedName) {
      showErrorToast("Service name is required");
      return;
    }
    if (editPrice === "" || editPrice < 0) {
      showErrorToast("Valid price is required");
      return;
    }
    if (editBusinessVolume === "" || editBusinessVolume < 0) {
      showErrorToast("Valid business volume is required");
      return;
    }
    
    setBusy(true);
    setError(null);

    try {
      const updateData: any = { 
        name: trimmedName, 
        price: editPrice, 
        businessVolume: editBusinessVolume
      };
      
      // Only include categoryId if it's set
      if (editCategoryId && editCategoryId.trim()) {
        updateData.categoryId = editCategoryId.trim();
      } else {
        // Explicitly set to empty to remove category
        updateData.categoryId = null;
      }
      
      const res = await apiFetch(`/api/admin/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
      setEditingId(null);
      setEditCategoryId("");
      await loadServices();
      showSuccessToast("Service updated successfully");
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  // Category management functions
  const createCategory = async () => {
    // Validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showErrorToast("Category name is required");
      return;
    }
    if (!formData.slug.trim()) {
      showErrorToast("Category slug is required");
      return;
    }
    if (!formData.code.trim()) {
      showErrorToast("Category code is required");
      return;
    }
    
    try {
      setError(null);
      setBusy(true);
      
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: trimmedName,
          slug: formData.slug.trim(),
          code: formData.code.trim().toUpperCase(),
          icon: formData.icon.trim() || undefined,
          image: formData.image.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to create category");
      }

      await refreshAll();
      setShowCreateModal(false);
      resetForm();
      showSuccessToast("Category created successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategoryId) return;
    
    // Validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showErrorToast("Category name is required");
      return;
    }
    if (!formData.slug.trim()) {
      showErrorToast("Category slug is required");
      return;
    }
    if (!formData.code.trim()) {
      showErrorToast("Category code is required");
      return;
    }
    
    try {
      setError(null);
      setBusy(true);
      
      const response = await fetch(`/api/admin/categories/${editingCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          slug: formData.slug.trim(),
          code: formData.code.trim().toUpperCase(),
          icon: formData.icon.trim() || undefined,
          image: formData.image.trim() || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update category");
      }

      await refreshAll();
      setShowCreateModal(false);
      setEditingCategoryId(null);
      resetForm();
      showSuccessToast("Category updated successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategoryId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      code: category.code,
      icon: category.icon || "",
      image: category.image || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      categoryId: "",
    });
    setShowCreateModal(true);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }
    
    try {
      setError(null);
      setBusy(true);
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to delete category");
      }

      await refreshAll();
      showSuccessToast("Category deleted successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  const createSubcategory = async () => {
    // Validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showErrorToast("Subcategory name is required");
      return;
    }
    if (!formData.slug.trim()) {
      showErrorToast("Subcategory slug is required");
      return;
    }
    if (!formData.code.trim()) {
      showErrorToast("Subcategory code is required");
      return;
    }
    if (!formData.categoryId) {
      showErrorToast("Category is required");
      return;
    }
    
    try {
      setError(null);
      setBusy(true);
      
      const response = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          slug: formData.slug.trim(),
          code: formData.code.trim().toUpperCase(),
          categoryId: formData.categoryId,
          icon: formData.icon.trim() || undefined,
          image: formData.image.trim() || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to create subcategory");
      }

      await refreshAll();
      setShowSubcategoryModal(false);
      resetForm();
      showSuccessToast("Subcategory created successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      setError(null);
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete subcategory");

      showSuccessToast("Subcategory deleted successfully");
      await refreshAll();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    setExpandedCategories(next);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      code: "",
      icon: "",
      image: "",
      isActive: true,
      sortOrder: 0,
      categoryId: "",
    });
    setSelectedCategory(null);
    setEditingCategoryId(null);
  };

  const openSubcategoryModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, categoryId: category._id }));
    setShowSubcategoryModal(true);
  };

  const generateCode = (name: string) =>
    name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/(^_|_$)/g, "");

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
      code: generateCode(name),
    }));
  };

  const filteredCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (category) =>
        category.name.toLowerCase().includes(q) || category.code.toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  const getSubcategoriesForCategory = (categoryId: string) => {
    const list = Array.isArray(subcategories) ? subcategories : [];
    return list.filter((sub) => sub.categoryId === categoryId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-gray-600 bg-clip-text text-transparent">Services Management</h1>
            </div>
            <p className="text-sm text-zinc-600 ml-15">Manage services, categories, and subcategories</p>
          </div>
          <div className="flex gap-3 animate-slide-in">
            <button
              onClick={refreshAll}
              disabled={refreshing || busy}
              className="glass-panel rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg border border-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Refresh All"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
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
          <div className="mb-6 glass-panel animate-shake rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>⚠️ {error}</span>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-blue-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "services"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "categories"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "subcategories"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
            Subcategories
          </button>
          <button
            onClick={() => setActiveTab("bulk-services")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "bulk-services"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            Bulk Services
          </button>
          <button
            onClick={() => setActiveTab("bulk-categories")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "bulk-categories"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            Bulk Categories
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "bulk-services" && (
          <AdminServiceUpload />
        )}

        {activeTab === "bulk-categories" && (
          <AdminCategoryUpload onUploaded={refreshAll} />
        )}

        {activeTab === "services" && (
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
                  <select
                    className="w-full glass-panel rounded-xl border border-blue-200 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-purple-500"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {categories.length === 0 ? "No categories available. Create one in the Categories tab." : "Select a category for this service"}
                  </p>
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
                      <th className="py-3 px-4 font-semibold">Category</th>
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
                          {editingId === s._id ? (
                            <select
                              className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium text-sm"
                              value={editCategoryId}
                              onChange={(e) => setEditCategoryId(e.target.value)}
                            >
                              <option value="">None</option>
                              {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">
                              {s.category ? s.category.name : <span className="text-gray-400">No category</span>}
                            </span>
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
                        <td className="py-8 text-center text-zinc-600" colSpan={6}>
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

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="glass-panel rounded-2xl border border-blue-200 p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
                <p className="text-gray-500">Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => {
                  const categorySubcategories = getSubcategoriesForCategory(category._id);
                  const isExpanded = expandedCategories.has(category._id);

                  return (
                    <div key={category._id} className="glass-panel rounded-2xl border border-blue-200 overflow-hidden">
                      {/* Category Header */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => toggleCategoryExpansion(category._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </button>

                            <div className="flex items-center space-x-3">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <FolderOpen className="w-5 h-5 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                  <span>Code: {category.code}</span>
                                  <span>Slug: {category.slug}</span>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {category.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openSubcategoryModal(category)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <Plus className="w-4 h-4 mr-1 inline" />
                              Add Subcategory
                            </button>
                            <button
                              onClick={() => openEditCategoryModal(category)}
                              className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4 mr-1 inline" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(category._id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span>{categorySubcategories.length} subcategories</span>
                          <span>Sort order: {category.sortOrder}</span>
                          <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {isExpanded && categorySubcategories.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Subcategories</h4>
                            <div className="space-y-2">
                              {categorySubcategories.map((subcategory) => (
                                <div key={subcategory._id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center space-x-3">
                                      {subcategory.image ? (
                                        <img
                                          src={subcategory.image}
                                          alt={subcategory.name}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                          <FolderOpen className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}

                                      <div>
                                        <p className="font-medium text-gray-900">{subcategory.name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                          <span>Code: {subcategory.code}</span>
                                          <span
                                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                              subcategory.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {subcategory.isActive ? "Active" : "Inactive"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => deleteSubcategory(subcategory._id)}
                                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Subcategories Tab */}
        {activeTab === "subcategories" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl border border-blue-200 p-6">
              <h2 className="text-xl font-bold mb-4">All Subcategories</h2>
              {subcategories.length === 0 ? (
                <div className="text-center py-12">
                  <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subcategories Found</h3>
                  <p className="text-gray-500">Add subcategories from the Categories tab.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subcategories.map((subcategory) => (
                    <div key={subcategory._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          {subcategory.image ? (
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <List className="w-5 h-5 text-gray-400" />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">{subcategory.name}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span>Code: {subcategory.code}</span>
                              <span>Slug: {subcategory.slug}</span>
                              {subcategory.category && (
                                <span>Category: {subcategory.category.name}</span>
                              )}
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  subcategory.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {subcategory.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteSubcategory(subcategory._id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategoryId ? "Edit Category" : "Create Category"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="URL-friendly slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Unique category code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Display order"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveCat"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActiveCat" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={editingCategoryId ? updateCategory : createCategory}
                disabled={busy || !formData.name.trim() || !formData.slug.trim() || !formData.code.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? "Saving..." : (editingCategoryId ? "Update Category" : "Create Category")}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                disabled={busy}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subcategory Modal */}
      {showSubcategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Subcategory for {selectedCategory.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="URL-friendly slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Unique subcategory code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Display order"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveSub"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActiveSub" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={createSubcategory}
                disabled={busy || !formData.name.trim() || !formData.slug.trim() || !formData.code.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? "Creating..." : "Create Subcategory"}
              </button>
              <button
                onClick={() => {
                  setShowSubcategoryModal(false);
                  resetForm();
                }}
                disabled={busy}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
