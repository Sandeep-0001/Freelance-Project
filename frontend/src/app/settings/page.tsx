"use client";

import { useState } from "react";
import { Settings, Bell, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "privacy" | "data">("account");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: true,
    twoFactorAuth: false,
    privateProfile: false,
    dataCollection: true,
    analyticsData: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingTabs = [
    { id: "account", label: "Account", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "data", label: "Data", icon: Database },
  ] as const;

  const Toggle = ({
    checked,
    onClick,
  }: {
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      type="button"
      className={[
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
        checked ? "bg-gradient-to-r from-emerald-600 to-sky-600" : "bg-zinc-300",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-7" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                <Settings className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-zinc-800">Preferences</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {settingTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                    className={[
                      "w-full px-6 py-4 flex items-center gap-3 text-left transition",
                      "border-l-4",
                      active
                        ? "bg-gradient-to-r from-emerald-50 to-sky-50 border-sky-600 text-sky-700"
                        : "border-transparent text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-9 w-9 items-center justify-center rounded-2xl border shadow-sm",
                        active
                          ? "border-sky-200 bg-white text-sky-700"
                          : "border-zinc-200 bg-white text-zinc-600",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="font-extrabold">{tab.label}</div>
                      <div className="text-xs text-zinc-500">
                        {tab.id === "account"
                          ? "Security & access"
                          : tab.id === "notifications"
                          ? "Email, push & SMS"
                          : tab.id === "privacy"
                          ? "Profile visibility"
                          : "Your data controls"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
              {/* Account */}
              {activeTab === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">Account Settings</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      Update security options and account details.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 hover:bg-white transition">
                      <div>
                        <h3 className="font-extrabold text-zinc-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-zinc-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Toggle checked={settings.twoFactorAuth} onClick={() => handleToggle("twoFactorAuth")} />
                    </div>

                    <div className="border-t border-zinc-200 pt-6">
                      <h3 className="font-extrabold text-zinc-900 mb-3">Change Password</h3>
                      <button
                        type="button"
                        className="rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
                      >
                        Update Password
                      </button>
                    </div>

                    <div className="border-t border-zinc-200 pt-6">
                      <h3 className="font-extrabold text-zinc-900 mb-2">Email Address</h3>
                      <p className="text-zinc-600 mb-4">your.email@example.com</p>
                      <button
                        type="button"
                        className="rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-extrabold text-sky-700 transition hover:bg-sky-100"
                      >
                        Change Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">Notification Preferences</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      Choose what you want to receive and where.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications" as const,
                        title: "Email Notifications",
                        desc: "Receive updates via email",
                      },
                      {
                        key: "pushNotifications" as const,
                        title: "Push Notifications",
                        desc: "Get notifications on your device",
                      },
                      {
                        key: "smsNotifications" as const,
                        title: "SMS Notifications",
                        desc: "Receive SMS messages",
                      },
                      {
                        key: "marketingEmails" as const,
                        title: "Marketing Emails",
                        desc: "Receive promotional content",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 hover:bg-white transition"
                      >
                        <div>
                          <h3 className="font-extrabold text-zinc-900">{item.title}</h3>
                          <p className="text-sm text-zinc-600 mt-1">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={settings[item.key]}
                          onClick={() => handleToggle(item.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">Privacy Settings</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      Control what others can see.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 hover:bg-white transition">
                      <div>
                        <h3 className="font-extrabold text-zinc-900">Private Profile</h3>
                        <p className="text-sm text-zinc-600 mt-1">
                          Only show your profile to connections
                        </p>
                      </div>
                      <Toggle checked={settings.privateProfile} onClick={() => handleToggle("privateProfile")} />
                    </div>

                    <div className="border-t border-zinc-200 pt-6">
                      <h3 className="font-extrabold text-zinc-900 mb-3">Blocked Users</h3>
                      <button
                        type="button"
                        className="rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                      >
                        Manage Blocked Users
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data */}
              {activeTab === "data" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">Data & Privacy</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      Manage how data is collected and exported.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl borderounded-2xl border border-zinc-200 bg-zinc-50 p-5 hover:bg-white transition">
                      <div>
                        <h3 className="font-extrabold text-zinc-900">Data Collection</h3>
                        <p className="text-sm text-zinc-600 mt-1">Allow us to collect usage data</p>
                      </div>
                      <Toggle checked={settings.dataCollection} onClick={() => handleToggle("dataCollection")} />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 hover:bg-white transition">
                      <div>
                        <h3 className="font-extrabold text-zinc-900">Analytics Data</h3>
                        <p className="text-sm text-zinc-600 mt-1">Help us improve with analytics</p>
                      </div>
                      <Toggle checked={settings.analyticsData} onClick={() => handleToggle("analyticsData")} />
                    </div>

                    <div className="border-t border-zinc-200 pt-6">
                      <h3 className="font-extrabold text-zinc-900 mb-2">Export Your Data</h3>
                      <p className="text-zinc-600 text-sm mb-4">
                        Download all your personal data in JSON format
                      </p>
                      <button
                        type="button"
                        className="rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-extrabold text-sky-700 transition hover:bg-sky-100"
                      >
                        Download Data
                      </button>
                    </div>

                    <div className="border-t border-zinc-200 pt-6">
                      <h3 className="font-extrabold text-zinc-900 mb-2">Delete Account</h3>
                      <p className="text-zinc-600 text-sm mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <button
                        type="button"
                        className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="mt-10 border-t border-zinc-200 pt-8">
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl"
                >
                  Save Changes
                </button>
                <p className="mt-3 text-xs text-zinc-500">
                  Tip: These toggles are UI only right now. Connect APIs later to persist settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
