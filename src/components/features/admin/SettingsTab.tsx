"use client";

import React from "react";
import { Check } from "lucide-react";
import type { SettingsTabProps } from "@/types/settings";

export default function SettingsTab({
  label,
  icon,
  isActive,
  onClick,
  hasChanges,
  description,
}: SettingsTabProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-start space-x-3 w-full p-4 text-left rounded-lg transition-all duration-200 border ${
        isActive
          ? "bg-white text-black border-gray-300 shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${isActive ? "bg-gray-100" : "bg-gray-50"}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-medium ${
              isActive ? "text-black" : "text-gray-900"
            }`}
          >
            {label}
          </p>
          {hasChanges && (
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
