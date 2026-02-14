"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { FolderOpen, Plus, Trash2, Search, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from "lucide-react";
import AdminCategoryUpload from "./AdminCategoryUpload";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

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

export default function CategoriesPage() {
  useAuth({ requireAdmin: true });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "bulk">("manage");

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

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
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
      await Promise.all([fetchCategories(), fetchSubcategories()]);
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
      if (e.key === "admin-categories-updated") refreshAll();
    };
    globalThis.addEventListener("storage", onStorage);

    // BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("admin-categories");
      channel.onmessage = (msg) => {
        if (msg?.data?.type === "CATEGORIES_UPDATED") refreshAll();
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

  const createCategory = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create category");

      await refreshAll();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const createSubcategory = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create subcategory");

      await refreshAll();
      setShowSubcategoryModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all associated subcategories."))
      return;

    try {
      setError(null);
      const response = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete category");

      showSuccessToast("Category deleted successfully");
      await refreshAll();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
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
      setError(err instanceof Error ? err.message : "An error occurred");
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
  };

  const openSubcategoryModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, categoryId: category._id }));
    setShowSubcategoryModal(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories & Subcategories</h1>
            <p className="text-lg text-gray-600">Manage service categories and subcategories</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {activeTab === "manage" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "manage"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Manage Categories
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "bulk"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Bulk Import
          </button>
        </div>

        {/* Search (only manage tab) */}
        {activeTab === "manage" && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "manage" ? (
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-500">Create your first category to get started.</p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const categorySubcategories = getSubcategoriesForCategory(category._id);
              const isExpanded = expandedCategories.has(category._id);

              return (
                <div key={category._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleCategoryExpansion(category._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={isExpanded ? "Collapse" : "Expand"}
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
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='10'%3ENo%3C/text%3E%3C/svg%3E";
                              }}
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
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='9'%3ENo%3C/text%3E%3C/svg%3E";
                                      }}
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
                                  title="Delete Subcategory"
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
            })
          )}
        </div>
      ) : (
        <AdminCategoryUpload onUploaded={refreshAll} />
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Category</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL-friendly slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onClick={createCategory}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Category
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subcategory name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL-friendly slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Subcategory
              </button>
              <button
                onClick={() => {
                  setShowSubcategoryModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
