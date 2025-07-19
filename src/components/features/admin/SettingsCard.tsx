"use client";

import React from "react";
import { Save, RotateCcw, Loader2, Check } from "lucide-react";
import type { SettingsCardProps } from "@/types/settings";

export default function SettingsCard({
  title,
  description,
  icon,
  children,
  isLoading = false,
  onSave,
  onReset,
  hasChanges = false,
}: SettingsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-50 rounded-lg text-black border border-gray-200">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          {(onSave || onReset) && (
            <div className="flex items-center space-x-3">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sıfırla
                </button>
              )}
              {onSave && (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isLoading || !hasChanges}
                  className={`inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    hasChanges
                      ? "text-white bg-black hover:bg-gray-800 border border-black"
                      : "text-gray-500 bg-gray-100 border border-gray-200"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : hasChanges ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {hasChanges ? "Değişiklikleri Kaydet" : "Kaydedildi"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
