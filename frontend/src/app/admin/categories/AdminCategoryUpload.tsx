"use client";

import { useState, useRef } from "react";
import { Upload, Download, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface UploadResult {
  success: boolean;
  message: string;
  totalRows: number;
  successfulInserts: number;
  errors: Array<{
    rowNumber: number;
    data: unknown;
    errors: string[];
  }>;
  warnings: Array<{
    rowNumber: number;
    message: string;
  }>;
  summary: {
    totalAdded: number;
    totalFailed: number;
  };
}

export default function AdminCategoryUpload({ onUploaded }: { onUploaded?: () => void | Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiFetch("/api/admin/categories/template/download");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "category-import-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download template");
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|csv)$/i)) {
      setError("Please select a valid Excel (.xlsx) or CSV (.csv) file");
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch("/api/admin/categories/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResult;

      if (!response.ok) {
        setError(data.message || "Upload failed");
        setResult(data);
        return;
      }

      setResult(data);
      if (data?.success) {
        try {
          await onUploaded?.();
        } catch {}
        try {
          localStorage.setItem("admin-categories-updated", String(Date.now()));
        } catch {}
        try {
          const channel = new BroadcastChannel("admin-categories");
          channel.postMessage({ type: "CATEGORIES_UPDATED" });
          channel.close();
        } catch {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-50", "border-blue-400");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Category Import</h2>
        <p className="text-gray-600">Upload Excel or CSV files to import multiple categories at once</p>
      </div>

      {/* Template Download */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Download Template</h3>
            <p className="text-sm text-gray-600">Start with our pre-formatted template to ensure correct data structure</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <>
              <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Processing upload...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to select Excel (.xlsx) or CSV (.csv) file
              </p>
              <p className="text-xs text-gray-500">Max file size: 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">{error}</p>
            {result?.errors && result.errors.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.slice(0, 5).map((err, idx) => (
                  <div key={idx} className="text-sm text-red-700">
                    Row {err.rowNumber}: {err.errors.join(", ")}
                  </div>
                ))}
                {result.errors.length > 5 && (
                  <div className="text-sm text-red-700">
                    ... and {result.errors.length - 5} more errors
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">{result.message}</p>
              <p className="text-sm text-green-700 mt-1">
                {result.successfulInserts} out of {result.totalRows} categories imported
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded p-4 border border-green-100">
            <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Categories Added</span>
                <span className="font-medium text-green-600">{result.summary.totalAdded}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed</span>
                <span className="font-medium text-red-600">{result.summary.totalFailed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Rows</span>
                <span className="font-medium text-gray-900">{result.totalRows}</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="mt-4 bg-yellow-50 rounded p-4 border border-yellow-100">
              <p className="font-medium text-yellow-900 mb-2">Warnings ({result.warnings.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.warnings.slice(0, 5).map((warning, idx) => (
                  <div key={idx} className="text-sm text-yellow-700">
                    Row {warning.rowNumber}: {warning.message}
                  </div>
                ))}
                {result.warnings.length > 5 && (
                  <div className="text-sm text-yellow-700">
                    ... and {result.warnings.length - 5} more warnings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Partial Success */}
      {result && !result.success && result.successfulInserts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">{result.message}</p>
              <p className="text-sm text-yellow-700 mt-1">
                {result.successfulInserts} out of {result.totalRows} categories imported successfully
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded p-4 border border-yellow-100 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Categories Added</span>
                <span className="font-medium text-green-600">{result.summary.totalAdded}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed</span>
                <span className="font-medium text-red-600">{result.summary.totalFailed}</span>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 rounded p-4 border border-red-100">
              <p className="font-medium text-red-900 mb-2">Errors ({result.errors.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.errors.slice(0, 5).map((err, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-red-700">Row {err.rowNumber}:</p>
                    <ul className="list-disc list-inside text-red-600 text-xs ml-2">
                      {err.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {result.errors.length > 5 && (
                  <div className="text-sm text-red-700">
                    ... and {result.errors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">File Format Requirements</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Required fields:</strong> name, slug, code</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Optional fields:</strong> icon, image, isActive, sortOrder</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>code:</strong> Unique category code (max 10 characters)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>slug:</strong> URL-friendly unique identifier</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>isActive:</strong> true/false, TRUE/FALSE, or 1/0 (defaults to true)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>sortOrder:</strong> Numeric value for display order (defaults to 0)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
