"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  User,
  Camera,
  Save,
  Upload,
  Building,
  MapPin,
  CreditCard,
  Settings,
  ShoppingBag,
  Cog,
  CheckCircle2,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { apiFetch } from "@/lib/apiClient";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface UserProfile {
  id: string;
  mobile: string;
  countryCode: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  referralCode: string;

  // Business Settings
  businessName?: string;
  companyPhone?: string;
  companyEmail?: string;
  website?: string;
  billingAddress?: string;
  state?: string;
  pincode?: string;
  city?: string;
  language?: string;
  businessType?: string;
  industryType?: string;
  businessDescription?: string;
  gstin?: string;
  panNumber?: string;
  isGSTRegistered?: boolean;
  enableEInvoicing?: boolean;
  enableTDS?: boolean;
  enableTCS?: boolean;
  businessLogo?: string;
  signature?: string;
  currencyCode?: string;
  currencySymbol?: string;

  createdAt?: string;
  updatedAt?: string;
}

const tabs = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "company", label: "Company Info", icon: Building },
  { id: "address", label: "Address", icon: MapPin },
  { id: "business", label: "Business Settings", icon: Settings },
  { id: "tax", label: "Tax & Compliance", icon: CreditCard },
] as const;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof tabs)[number]["id"]>("basic");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form states for different sections
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
  });

  const [companyInfo, setCompanyInfo] = useState({
    businessName: "",
    companyPhone: "",
    companyEmail: "",
    website: "",
    businessDescription: "",
  });

  const [addressInfo, setAddressInfo] = useState({
    billingAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessType: "",
    industryType: "",
    language: "",
    currencyCode: "INR",
    currencySymbol: "₹",
  });

  const [taxSettings, setTaxSettings] = useState({
    gstin: "",
    panNumber: "",
    isGSTRegistered: false,
    enableEInvoicing: false,
    enableTDS: false,
    enableTCS: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiFetch("/api/profile");
      const data = await res.json();
      setProfile(data.user);

      // Initialize form states
      setBasicInfo({
        name: data.user.name || "",
        email: data.user.email || "",
      });

      setCompanyInfo({
        businessName: data.user.businessName || "",
        companyPhone: data.user.companyPhone || "",
        companyEmail: data.user.companyEmail || "",
        website: data.user.website || "",
        businessDescription: data.user.businessDescription || "",
      });

      setAddressInfo({
        billingAddress: data.user.billingAddress || "",
        city: data.user.city || "",
        state: data.user.state || "",
        pincode: data.user.pincode || "",
      });

      setBusinessSettings({
        businessType: data.user.businessType || "",
        industryType: data.user.industryType || "",
        language: data.user.language || "",
        currencyCode: data.user.currencyCode || "INR",
        currencySymbol: data.user.currencySymbol || "₹",
      });

      setTaxSettings({
        gstin: data.user.gstin || "",
        panNumber: data.user.panNumber || "",
        isGSTRegistered: data.user.isGSTRegistered || false,
        enableEInvoicing: data.user.enableEInvoicing || false,
        enableTDS: data.user.enableTDS || false,
        enableTCS: data.user.enableTCS || false,
      });

      if (data.user.profileImage) {
        setImagePreview(data.user.profileImage);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) {
      showErrorToast("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", profileImage);

    try {
      console.log("Uploading image:", profileImage.name, "Size:", profileImage.size);

      // Use fetch directly for FormData uploads (apiFetch may interfere with multipart/form-data)
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          accept: "application/json",
        },
        // Don't set Content-Type - let the browser set it with boundary for multipart/form-data
      });

      const body = await res.json();
      console.log("Upload response:", body, "Status:", res.status);

      if (!res.ok) {
        throw new Error(body.error || "Upload failed");
      }

      setSuccessMessage("Profile image uploaded successfully!");
      setProfileImage(null);
      showSuccessToast("Profile image uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reload profile to get updated image
      await loadProfile();

      // Trigger profile update event to refresh navbar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profileUpdated"));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      showErrorToast(`Failed to upload profile image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const saveBasicInfo = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile/basic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicInfo),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        showSuccessToast(data.message || "Basic information updated successfully");
        await loadProfile();

        // Trigger profile update event to refresh navbar
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("profileUpdated"));
        }
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update basic info:", error);
      showErrorToast("Failed to update basic information");
    } finally {
      setSaving(false);
    }
  };

  const saveCompanyInfo = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyInfo),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        showSuccessToast(data.message || "Company information updated successfully");
        await loadProfile();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update company info:", error);
      showErrorToast("Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  const saveAddressInfo = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressInfo),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        showSuccessToast(data.message || "Address information updated successfully");
        await loadProfile();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update address info:", error);
      showErrorToast("Failed to update address information");
    } finally {
      setSaving(false);
    }
  };

  const saveBusinessSettings = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessSettings),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        showSuccessToast(data.message || "Business settings updated successfully");
        await loadProfile();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update business settings:", error);
      showErrorToast("Failed to update business settings");
    } finally {
      setSaving(false);
    }
  };

  const saveTaxSettings = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taxSettings),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        showSuccessToast(data.message || "Tax settings updated successfully");
        await loadProfile();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update tax settings:", error);
      showErrorToast("Failed to update tax settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 p-[2px]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                    {imagePreview ? (
                      <img
                        src={
                          imagePreview.startsWith("http")
                            ? imagePreview
                            : imagePreview.startsWith("/uploads")
                            ? `http://localhost:4000${imagePreview}`
                            : imagePreview // base64 data URL
                        }
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load image:", imagePreview);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <User className="h-10 w-10 text-emerald-700" />
                    )}
                  </div>
                </div>

                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 p-2 shadow-md transition hover:from-emerald-700 hover:to-sky-700">
                  <Camera className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-zinc-900 sm:text-2xl">{profile?.name}</h1>
                <p className="text-sm text-zinc-600">{profile?.email}</p>
                <p className="text-sm text-zinc-500">{profile?.mobile}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {profileImage && (
                <button
                  onClick={uploadProfileImage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </button>
              )}

              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-700" />
                Orders
              </Link>

              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                <Cog className="h-4 w-4 text-sky-700" />
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-emerald-800 shadow-sm">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </span>
            <div className="text-sm font-semibold">{successMessage}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200">
            <nav className="flex flex-wrap gap-2 px-4 py-3 sm:gap-3 sm:px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeSection === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={[
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                      active
                        ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Basic Info */}
          {activeSection === "basic" && (
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Full Name</label>
                  <input
                    type="text"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Email</label>
                  <input
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={saveBasicInfo}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Company */}
          {activeSection === "company" && (
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-6">Company Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Name</label>
                  <input
                    type="text"
                    value={companyInfo.businessName}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessName: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Company Phone</label>
                  <input
                    type="tel"
                    value={companyInfo.companyPhone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyPhone: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Company Email</label>
                  <input
                    type="email"
                    value={companyInfo.companyEmail}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyEmail: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Website</label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Description</label>
                <textarea
                  value={companyInfo.businessDescription}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, businessDescription: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={saveCompanyInfo}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Address */}
          {activeSection === "address" && (
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-6">Address Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Billing Address</label>
                  <textarea
                    value={addressInfo.billingAddress}
                    onChange={(e) => setAddressInfo({ ...addressInfo, billingAddress: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">City</label>
                  <input
                    type="text"
                    value={addressInfo.city}
                    onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">State</label>
                  <input
                    type="text"
                    value={addressInfo.state}
                    onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Pincode</label>
                  <input
                    type="text"
                    value={addressInfo.pincode}
                    onChange={(e) => setAddressInfo({ ...addressInfo, pincode: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={saveAddressInfo}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Business Settings */}
          {activeSection === "business" && (
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-6">Business Settings</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Type</label>
                  <input
                    type="text"
                    value={businessSettings.businessType}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, businessType: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Industry Type</label>
                  <input
                    type="text"
                    value={businessSettings.industryType}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, industryType: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Language</label>
                  <input
                    type="text"
                    value={businessSettings.language}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, language: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Currency Code</label>
                  <select
                    value={businessSettings.currencyCode}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, currencyCode: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={saveBusinessSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Tax */}
          {activeSection === "tax" && (
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-6">Tax & Compliance</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">GSTIN</label>
                  <input
                    type="text"
                    value={taxSettings.gstin}
                    onChange={(e) => setTaxSettings({ ...taxSettings, gstin: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">PAN Number</label>
                  <input
                    type="text"
                    value={taxSettings.panNumber}
                    onChange={(e) => setTaxSettings({ ...taxSettings, panNumber: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { key: "isGSTRegistered", label: "GST Registered" },
                  { key: "enableEInvoicing", label: "Enable E-Invoicing" },
                  { key: "enableTDS", label: "Enable TDS" },
                  { key: "enableTCS", label: "Enable TCS" },
                ].map((x) => (
                  <label
                    key={x.key}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={(taxSettings as any)[x.key]}
                      onChange={(e) => setTaxSettings({ ...taxSettings, [x.key]: e.target.checked } as any)}
                      className="h-4 w-4"
                    />
                    {x.label}
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={saveTaxSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
