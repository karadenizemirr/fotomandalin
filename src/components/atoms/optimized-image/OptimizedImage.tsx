"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  fallback?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // Örneğin: "16/9", "4/3", "1/1"
  objectPosition?: string;
  loadingStyle?: "blur" | "shimmer" | "none";
  onLoad?: () => void;
}

/**
 * WebP formatını destekleyen optimize edilmiş görsel bileşeni
 * Next.js Image bileşenini kullanarak otomatik WebP dönüşümü sağlar
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  fallback,
  className = "",
  containerClassName = "",
  aspectRatio,
  objectPosition = "center",
  loadingStyle = "shimmer",
  onLoad,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Yerel veya harici URL olup olmadığını kontrol et
  const isExternal =
    typeof src === "string" && (src.startsWith("http") || src.startsWith("//"));

  // Shimmer efekti için base64 SVG
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#333" offset="20%" />
          <stop stop-color="#222" offset="50%" />
          <stop stop-color="#333" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#333" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  // Placeholder için blur veya shimmer
  const getPlaceholder = () => {
    if (loadingStyle === "blur") return "blur";
    if (loadingStyle === "shimmer")
      return `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;
    return "empty";
  };

  return (
    <div
      className={cn(
        "overflow-hidden relative",
        isLoading && "animate-pulse bg-gray-200",
        aspectRatio && `aspect-[${aspectRatio}]`,
        containerClassName
      )}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          style={{
            objectFit: props.fill ? "cover" : "contain",
            objectPosition,
          }}
          onLoadingComplete={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            if (fallback) {
              setError(true);
            }
          }}
          placeholder={getPlaceholder() as any}
          blurDataURL={
            loadingStyle === "blur" ? undefined : (getPlaceholder() as string)
          }
          {...props}
        />
      ) : (
        // Fallback image if the original image fails to load
        <Image
          src={fallback || "/images/placeholder.webp"}
          alt={`${alt} (fallback)`}
          width={width}
          height={height}
          className={className}
          style={{
            objectFit: props.fill ? "cover" : "contain",
            objectPosition,
          }}
          {...props}
        />
      )}
    </div>
  );
};
