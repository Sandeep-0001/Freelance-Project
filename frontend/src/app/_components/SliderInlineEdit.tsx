"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import ImageUpload from "@/app/_components/ImageUpload";

interface SliderInlineEditProps {
  readonly slider: {
    _id: string;
    title: string;
    description?: string;
    imageUrl: string;
    order: number;
    isActive: boolean;
  };
  readonly onSave: (updatedSlider: {
    _id: string;
    title: string;
    description?: string;
    imageUrl: string;
    order: number;
    isActive: boolean;
  }) => void;
  readonly onCancel: () => void;
  readonly busy: boolean;
}

export default function SliderInlineEdit({ slider, onSave, onCancel, busy }: SliderInlineEditProps) {
  const [editData, setEditData] = useState({
    title: slider.title,
    description: slider.description || "",
    imageUrl: slider.imageUrl
  });

  const handleSave = () => {
    onSave({
      ...slider,
      ...editData
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium"
          maxLength={100}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <ImageUpload
          onImageSelect={(imageUrl: string) => setEditData({ ...editData, imageUrl })}
          currentImage={editData.imageUrl}
          className="mb-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          className="w-full glass-panel rounded-lg border border-blue-200 px-3 py-2 font-medium"
          rows={2}
          maxLength={500}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={busy}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
