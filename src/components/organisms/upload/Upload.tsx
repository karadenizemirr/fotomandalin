"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload as UploadIcon,
  FileText,
  Video,
  AlertCircle,
  Trash2,
  Eye,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { uploadService, UploadConfig } from "@/lib/upload";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  uploadedAt: Date;
  status: "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

interface UploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  onRemove?: (file: UploadedFile) => void;
  multiple?: boolean;
  maxFiles?: number;
  config?: Partial<UploadConfig>;
  preset?: "image" | "avatar" | "document" | "video";
  className?: string;
  disabled?: boolean;
  initialFiles?: UploadedFile[];
}

export default function Upload({
  onUpload,
  onRemove,
  multiple = false,
  maxFiles = 10,
  config,
  preset,
  className = "",
  disabled = false,
  initialFiles = [],
}: UploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update files when initialFiles change
  const memoizedInitialFiles = React.useMemo(
    () => initialFiles,
    [initialFiles.length, initialFiles.map((f) => f.id).join(",")]
  );

  useEffect(() => {
    setFiles(memoizedInitialFiles);
  }, [memoizedInitialFiles]);

  // Get upload config based on preset or custom config
  const uploadConfig = React.useMemo(() => {
    const presets = {
      image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        uploadPath: "images",
      },
      avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        uploadPath: "avatars",
      },
      document: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf", "text/plain", "application/msword"],
        uploadPath: "documents",
      },
      video: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ["video/mp4", "video/quicktime", "video/webm"],
        uploadPath: "videos",
      },
    };

    if (preset) {
      return { ...presets[preset], ...config };
    }
    return config || {};
  }, [preset, config]);

  // Notify parent component when files change
  useEffect(() => {
    const successfulFiles = files.filter((f) => f.status === "success");
    onUpload?.(successfulFiles);
  }, [files, onUpload]);

  // S3 upload function
  const uploadToS3 = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);

    if (config) {
      formData.append("config", JSON.stringify(config));
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Upload failed");
    }

    return {
      id: result.file.id,
      name: result.file.name,
      size: result.file.size,
      type: result.file.type,
      url: result.file.url,
      thumbnailUrl: result.file.thumbnailUrl,
      uploadedAt: new Date(result.file.uploadedAt),
      status: "success",
    };
  };

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList) => {
      if (disabled || isUploading) return;

      const fileArray = Array.from(selectedFiles);
      setIsUploading(true);

      setFiles((currentFiles) => {
        // Check max files limit
        if (currentFiles.length + fileArray.length > maxFiles) {
          console.warn(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
          setIsUploading(false);
          return currentFiles;
        }

        // Create initial file entries with uploading status
        const initialFiles: UploadedFile[] = fileArray.map((file) => ({
          id: Date.now() + Math.random().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: "",
          uploadedAt: new Date(),
          status: "uploading" as const,
          progress: 0,
        }));

        const newFiles = [...currentFiles, ...initialFiles];

        // Start upload process for each file
        fileArray.forEach(async (file, index) => {
          try {
            const uploadedFile = await uploadToS3(file);

            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === initialFiles[index].id ? uploadedFile : f
              )
            );
          } catch (error) {
            console.error("Upload error:", error);
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === initialFiles[index].id
                  ? {
                      ...f,
                      status: "error",
                      error:
                        error instanceof Error
                          ? error.message
                          : "Upload failed",
                    }
                  : f
              )
            );
          }
        });

        setIsUploading(false);
        return newFiles;
      });
    },
    [disabled, isUploading, maxFiles, config]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        handleFileSelect(selectedFiles);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(
    async (fileToRemove: UploadedFile) => {
      if (disabled) return;

      // Remove from local state
      const updatedFiles = files.filter((f) => f.id !== fileToRemove.id);
      setFiles(updatedFiles);

      // Delete from server if uploaded
      if (fileToRemove.status === "success" && fileToRemove.url) {
        try {
          await uploadService.deleteFile(fileToRemove.url);
        } catch (error) {
          console.error("Delete error:", error);
        }
      }

      onRemove?.(fileToRemove);
    },
    [files, disabled, onRemove]
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragOver
              ? "border-amber-400 bg-amber-50"
              : "border-gray-200 hover:border-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
          accept={uploadConfig.allowedTypes?.join(",") || "*"}
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <UploadIcon className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragOver
                ? "Dosyaları bırakın"
                : "Dosya yüklemek için tıklayın"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              veya dosyaları sürükleyip bırakın
            </p>

            {uploadConfig.maxSize && (
              <p className="text-xs text-gray-400 mt-2">
                Maksimum dosya boyutu: {formatFileSize(uploadConfig.maxSize)}
              </p>
            )}

            {uploadConfig.allowedTypes && (
              <p className="text-xs text-gray-400">
                Desteklenen formatlar: {uploadConfig.allowedTypes.join(", ")}
              </p>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Yükleniyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Yüklenen Dosyalar ({files.length})
          </h4>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white"
              >
                {/* File Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {file.thumbnailUrl ? (
                    <Image
                      src={file.thumbnailUrl}
                      alt={file.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Status */}
                  {file.status === "uploading" && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-amber-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {file.status === "error" && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div title={file.error}>
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      </div>
                      <p className="text-xs text-red-600">{file.error}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {file.status === "success" && file.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, "_blank");
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file);
                    }}
                    disabled={disabled}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
