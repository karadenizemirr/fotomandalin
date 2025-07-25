"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Loader2,
} from "lucide-react";
import { OptimizedImage } from "@/components/atoms/optimized-image/OptimizedImage";

export interface UploadResult {
  webpPath: string;
  thumbnailPath?: string;
  width: number;
  height: number;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
}

// UploadedFile interface'i için alias
interface UploadedFile {
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

interface WebPUploaderProps {
  maxFiles?: number;
  maxSize?: number; // MB cinsinden
  quality?: number; // WebP kalitesi (20-100 arası, düşük = daha çok sıkıştırma)
  width?: number;
  height?: number;
  aspectRatio?: string;
  acceptedFileTypes?: string[];
  showStatistics?: boolean;
  thumbnails?: boolean;
  autoConvert?: boolean;
  disabled?: boolean;
  initialImages?: UploadResult[];
  onUploadComplete?: (results: UploadResult[]) => void;
  className?: string;
  uploadEndpoint?: string;
}

export default function WebPUploader({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  aspectRatio,
  thumbnails = true,
  width,
  height,
  quality = 85,
  className = "",
  disabled = false,
  uploadEndpoint = "/api/upload", // Ana upload API WebP dönüşümünü destekliyor
  initialImages = [],
  showStatistics = false,
  autoConvert = true,
}: WebPUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadResult[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    initialImages?.map((img) => img.webpPath) || []
  );
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set()); // Hangi dosyaların yüklendiğini takip et
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const maxSizeBytes = maxSize * 1024 * 1024; // MB to bytes

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Maximum dosya sayısı kontrolü
      if (previews.length + acceptedFiles.length > maxFiles) {
        setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
        return;
      }

      setError(null);
      setSuccess(null);
      setIsUploading(true);
      setTotalFiles(acceptedFiles.length);
      setCurrentUploadIndex(0);

      // Seçilen dosyaları kaydet
      setFiles((prev) => [...prev, ...acceptedFiles]);

      // Önizleme URL'leri oluştur ve loading state'i ayarla
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [...prev, ...newPreviews]);

      // Loading state'lerini ayarla
      const newUploadingIndices = new Set<number>();
      for (let i = 0; i < acceptedFiles.length; i++) {
        newUploadingIndices.add(previews.length + i);
      }
      setUploadingFiles(newUploadingIndices);

      // Dosyaları yükle ve WebP'ye dönüştür
      try {
        const uploadResults: UploadResult[] = [];

        // Her dosyayı tek tek yükle (ana upload API kullanarak)
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          const previewIndex = previews.length + i;
          setCurrentUploadIndex(i + 1);

          const formData = new FormData();
          formData.append("file", file);

          // WebP konfigürasyonu
          const config = {
            convertToWebP: autoConvert,
            webpQuality: quality,
            generateThumbnail: thumbnails,
            uploadPath: "portfolio",
          };
          formData.append("config", JSON.stringify(config));

          const response = await fetch(uploadEndpoint, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Yükleme hatası: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Upload failed");
          }

          // Response'u UploadResult formatına dönüştür
          const result: UploadResult = {
            webpPath: data.file.url, // WebP URL
            thumbnailPath: data.file.thumbnailUrl,
            width: data.file.metadata?.width || 800,
            height: data.file.metadata?.height || 600,
            originalSize: data.file.originalSize || file.size, // Orijinal dosya boyutu
            webpSize: data.file.size || file.size, // WebP dosya boyutu
            compressionRatio: data.file.metadata?.compressionRatio || 0,
          };

          uploadResults.push(result);

          // Bu dosya için loading state'i kaldır
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(previewIndex);
            return newSet;
          });
        }

        setUploads((prev) => [...prev, ...uploadResults]);

        // İstatistik hesaplama
        const totalOriginalSize = uploadResults.reduce(
          (sum, result) => sum + result.originalSize,
          0
        );
        const totalWebPSize = uploadResults.reduce(
          (sum, result) => sum + result.webpSize,
          0
        );
        const totalSavings = Math.round(
          (1 - totalWebPSize / totalOriginalSize) * 100
        );

        setSuccess(
          `${uploadResults.length} dosya başarıyla yüklendi! %${totalSavings} boyut kazancı.`
        );

        // Callback fonksiyonu çağır
        if (onUploadComplete) {
          onUploadComplete(uploadResults);
        }
      } catch (err: any) {
        setError(`Yükleme hatası: ${err.message}`);
        console.error("Yükleme hatası:", err);
      } finally {
        setIsUploading(false);
        setCurrentUploadIndex(-1);
        setTotalFiles(0);
        setUploadingFiles(new Set()); // Tüm loading state'lerini temizle
      }
    },
    [
      disabled,
      maxFiles,
      previews.length,
      width,
      height,
      quality,
      thumbnails,
      uploadEndpoint,
      onUploadComplete,
    ]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".bmp", ".tiff"],
      },
      maxSize: maxSizeBytes,
      disabled: isUploading || disabled,
      maxFiles,
    });

  // Bir önizlemeyi kaldır
  const removePreview = (index: number) => {
    // URL nesnesini temizle
    if (previews[index].startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }

    // Dizilerden kaldır
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));

    // Loading state'i temizle
    setUploadingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Yüklemeler dizisinden de kaldır
    if (index < uploads.length) {
      setUploads((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Dosya red nedenlerini göster
  const fileRejectionItems = fileRejections.map(({ file, errors }: any) => (
    <div key={file.name} className="text-sm text-red-600 mt-2">
      <p className="font-semibold">{file.name}</p>
      <ul className="list-disc pl-5">
        {errors.map((e: any) => (
          <li key={e.code}>
            {e.code === "file-too-large"
              ? `Dosya boyutu çok büyük (${(file.size / (1024 * 1024)).toFixed(
                  2
                )}MB). Maksimum ${maxSize}MB olabilir.`
              : e.message}
          </li>
        ))}
      </ul>
    </div>
  ));

  return (
    <div className={`w-full ${className}`}>
      {/* Optimizasyon Bilgi Banner */}
      {autoConvert && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <Zap className="w-5 h-5 text-blue-600 mr-2" />
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Otomatik Optimizasyon:</span>{" "}
            Yüklenen görseller otomatik olarak optimize edilerek %20-50 boyut
            kazancı sağlanır.
          </div>
        </div>
      )}

      {/* Dosya yükleme alanı */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors 
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${
          isUploading ? "pointer-events-none" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 mb-3 animate-spin" />
              <p className="text-lg font-medium text-blue-700">
                Görseller işleniyor...
              </p>
              <p className="mt-2 text-sm text-blue-600">
                {currentUploadIndex > 0 && totalFiles > 0
                  ? `${currentUploadIndex}/${totalFiles} dosya işleniyor`
                  : "Dosyalar yükleniyor ve optimize ediliyor"}
              </p>
              {/* Progress Bar */}
              {totalFiles > 0 && (
                <div className="w-full max-w-xs mt-3">
                  <div className="bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(currentUploadIndex / totalFiles) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mt-1 text-center">
                    {Math.round((currentUploadIndex / totalFiles) * 100)}%
                    tamamlandı
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Dosyaları buraya bırakın..."
                  : "Görselleri buraya sürükleyin veya seçin"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {`Her biri en fazla ${maxSize}MB olan ${maxFiles} dosyaya kadar yükleyebilirsiniz.`}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Desteklenen formatlar: JPG, PNG, GIF, BMP, TIFF
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hatalar */}
      {(error || fileRejectionItems.length > 0) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          {error && (
            <div className="flex items-center text-red-700 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          )}
          {fileRejectionItems}
        </div>
      )}

      {/* Başarı mesajı */}
      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Önizleme alanı */}
      {previews.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Yüklenen Görseller
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div
                  className={`border rounded-lg overflow-hidden bg-gray-100 ${
                    aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-[4/3]"
                  }`}
                >
                  {/* Yüklenen görsel preview için OptimizedImage bileşenini kullan */}
                  <OptimizedImage
                    src={preview}
                    alt={`Yüklenen görsel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Loading overlay */}
                  {uploadingFiles.has(index) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-xs">İşleniyor...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* İstatistikler */}
                {showStatistics && uploads[index] && (
                  <div className="mt-1 text-xs text-gray-500">
                    <p>
                      Boyut: {uploads[index].width}x{uploads[index].height}
                    </p>
                    <p>
                      Kazanç: {uploads[index].compressionRatio}% (
                      {(uploads[index].originalSize / (1024 * 1024)).toFixed(2)}
                      MB →{(uploads[index].webpSize / (1024 * 1024)).toFixed(2)}
                      MB)
                    </p>
                  </div>
                )}

                {/* Silme butonu */}
                {!uploadingFiles.has(index) && (
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Görseli kaldır"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
