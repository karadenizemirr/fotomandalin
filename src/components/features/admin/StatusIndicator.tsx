"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import type { StatusIndicatorProps } from "@/types/settings";

export default function StatusIndicator({
  isActive,
  isLoading,
}: StatusIndicatorProps) {
  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
  }

  return isActive ? (
    <div className="flex items-center text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
      <span className="text-sm font-medium">Aktif</span>
    </div>
  ) : (
    <div className="flex items-center text-gray-400">
      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
      <span className="text-sm font-medium">Pasif</span>
    </div>
  );
}
