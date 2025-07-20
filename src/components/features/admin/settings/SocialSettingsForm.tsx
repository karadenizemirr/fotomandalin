"use client";

import React from "react";
import { Share2, Activity, Globe, AlertCircle } from "lucide-react";
import StatusIndicator from "@/components/features/admin/StatusIndicator";

interface SocialSettingsFormProps {
  showSensitiveData: boolean;
}

export default function SocialSettingsForm({
  showSensitiveData,
}: SocialSettingsFormProps) {
  return (
    <div className="space-y-8">
      {/* Facebook Integration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Facebook Entegrasyonu
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-black">Facebook Login</h5>
              <p className="text-sm text-gray-600">
                Kullanıcıların Facebook ile giriş yapabilmesi
              </p>
            </div>
            <StatusIndicator isActive={false} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App ID
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Facebook App ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Secret
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Facebook App Secret"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Integration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Instagram Entegrasyonu
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-black">Instagram API</h5>
              <p className="text-sm text-gray-600">
                Instagram fotoğraflarını portfolyoda gösterin
              </p>
            </div>
            <StatusIndicator isActive={false} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Instagram Access Token"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Integration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Google Entegrasyonu
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-black">Google Login</h5>
              <p className="text-sm text-gray-600">
                Kullanıcıların Google ile giriş yapabilmesi
              </p>
            </div>
            <StatusIndicator isActive={false} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Google Client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Google Client Secret"
              />
            </div>
          </div>
        </div>
      </div>

      {!showSensitiveData && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Hassas Veriler Gizli</p>
            <p>
              API anahtarları ve kimlik bilgileri güvenlik amacıyla
              gizlenmiştir. Görmek için sağ üstteki düğmeyi kullanın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
