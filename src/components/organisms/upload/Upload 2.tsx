"use client";

import { useState, useRef, useCallback } from "react";
import { 
  Upload as UploadIcon, 
  File, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Download,
  Trash2
} from "lucide-react";
import Image from "next/image";

export type FileType = "image" | "video" | "document" | "any";
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  status: UploadStatus;
  error?: string;
}

export interface UploadProps {
  accept?: FileType;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<UploadedFile>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  allowRemove?: boolean;
}

const getAcceptString = (accept: FileType): string => {
  switch (accept) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    case "document":
      return ".pdf,.doc,.docx,.txt,.rtf";
    case "any":
    default:
      return "*/*";
  }
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) {
    return <ImageIcon className="w-6 h-6 text-blue-500" />;
  }
  if (type.startsWith("video/")) {
    return <Video className="w-6 h-6 text-purple-500" />;
  }
  if (type.includes("pdf") || type.includes("document")) {
    return <FileText className="w-6 h-6 text-red-500" />;
  }
  return <File className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function Upload({
  accept = "any",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  value = [],
  onChange,
  onUpload,
  disabled = false,
  className = "",
  placeholder,
  showPreview = true,
  allowRemove = true,
}: UploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (!multiple && fileArray.length > 1) {
      alert("Sadece bir dosya seçebilirsiniz");
      return;
    }
    
    if (value.length + fileArray.length > maxFiles) {
      alert(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} dosyası çok büyük. Maksimum ${formatFileSize(maxSize)} olmalıdır.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const newFiles: UploadedFile[] = [];

      for (const file of validFiles) {
        if (onUpload) {
          try {
            const uploadedFile = await onUpload(file);
            newFiles.push(uploadedFile);
          } catch (error) {
            // Create error file entry
            newFiles.push({
              id: Date.now() + Math.random().toString(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: "",
              uploadedAt: new Date(),
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            });
          }
        } else {
          // Create local file URL for preview
          const fileUrl = URL.createObjectURL(file);
          newFiles.push({
            id: Date.now() + Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: fileUrl,
            uploadedAt: new Date(),
            status: "success",
          });
        }
      }

      const updatedFiles = multiple ? [...value, ...newFiles] : newFiles;
      onChange?.(updatedFiles);
    } finally {
      setUploading(false);
    }
  }, [value, multiple, maxSize, maxFiles, onUpload, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = value.filter(file => file.id !== fileId);
    onChange?.(updatedFiles);
  }, [value, onChange]);

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getStatusIcon = (status: UploadStatus, error?: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "success":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return (
          <div title={error}>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragActive 
            ? "border-orange-400 bg-orange-50" 
            : "border-gray-200 hover:border-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString(accept)}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            ) : (
              <UploadIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-black">
              {uploading 
                ? "Dosyalar yükleniyor..." 
                : placeholder || "Dosya seçin veya sürükleyin"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept !== "any" && `${accept.toUpperCase()} dosyaları, `}
              Maksimum {formatFileSize(maxSize)}
              {multiple && `, ${maxFiles} dosyaya kadar`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {showPreview && value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-black">
            Yüklenen Dosyalar ({value.length})
          </h4>
          
          <div className="space-y-2">
            {value.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {file.type.startsWith("image/") && file.url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={file.thumbnailUrl || file.url}
                        alt={file.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString("tr-TR")}
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status, file.error)}
                  
                  {/* Actions */}
                  {file.status === "success" && (
                    <div className="flex items-center space-x-1">
                      {file.url && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, "_blank");
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <a
                            href={file.url}
                            download={file.name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors duration-200"
                            title="İndir"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      
                      {allowRemove && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
