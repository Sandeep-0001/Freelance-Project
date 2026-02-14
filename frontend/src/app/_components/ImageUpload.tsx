"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { showErrorToast } from "@/lib/toast";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({ onImageSelect, currentImage, className = "" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || "");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      showErrorToast('Please select image files only');
      return;
    }

    const file = imageFiles[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Compress image before converting to base64
      const compressedImage = await compressImage(file);
      setPreviewUrl(compressedImage);
      onImageSelect(compressedImage);
    } catch (error) {
      console.error('Error processing image:', error);
      showErrorToast('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1200px width/height)
          let { width, height } = img;
          const maxSize = 1200;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = () => {
    setPreviewUrl("");
    onImageSelect("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {previewUrl ? (
        <div className="relative group">
          <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <ImageIcon className="w-12 h-12 text-gray-600" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag & drop image here
                </p>
                <p className="text-sm text-gray-600">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-gray-700">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="image-upload"
      />
      
      {!previewUrl && (
        <label
          htmlFor="image-upload"
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Choose Image
        </label>
      )}
    </div>
  );
}
