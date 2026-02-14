"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { CreditCard, Save, ToggleLeft, ToggleRight, Smartphone, Link2 } from "lucide-react";

interface PaymentSettings {
  paymentLinkEnabled: boolean;
  upiLink: string;
}

export default function PaymentSettingsPage() {
  useAuth({ requireAdmin: true });
  const [settings, setSettings] = useState<PaymentSettings>({
    paymentLinkEnabled: false,
    upiLink: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/payment-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch payment settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save payment settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Settings</h1>
        <p className="text-lg text-gray-600">
          Configure payment links and UPI settings for your platform
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">Payment settings saved successfully!</p>
        </div>
      )}

      {/* Payment Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="space-y-8">
          {/* Payment Link Toggle */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Link2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Links</h2>
                  <p className="text-sm text-gray-600">
                    Enable payment links for users to make payments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, paymentLinkEnabled: !prev.paymentLinkEnabled }))}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ backgroundColor: settings.paymentLinkEnabled ? "#2563eb" : "#d1d5db" }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: settings.paymentLinkEnabled ? "translateX(1.25rem)" : "translateX(0.25rem)" }}
                />
              </button>
            </div>
          </div>

          {/* UPI Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">UPI Settings</h2>
                <p className="text-sm text-gray-600">
                  Configure UPI payment details for transactions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI Link
                </label>
                <input
                  type="url"
                  value={settings.upiLink}
                  onChange={(e) => setSettings(prev => ({ ...prev, upiLink: e.target.value }))}
                  placeholder="https://upi.pay/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the complete UPI payment link that users can use to make payments
                </p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Instructions</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• When payment links are enabled, users will see payment options on service pages</p>
              <p>• UPI links should be in the format: upi://pay?pa=upi@bank&pn=Name&am=Amount&cu=INR</p>
              <p>• Make sure to test the UPI link before saving to ensure it works correctly</p>
              <p>• Users will be redirected to their UPI app when they click on payment links</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Current Settings Preview */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Links Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              settings.paymentLinkEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {settings.paymentLinkEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">UPI Link:</span>
            <span className="text-gray-900 text-sm">
              {settings.upiLink || "Not configured"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
