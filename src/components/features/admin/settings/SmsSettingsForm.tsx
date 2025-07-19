"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Shield, Smartphone, AlertCircle } from "lucide-react";
import FormInput from "@/components/molecules/FormInput";
import FormCheckbox from "@/components/molecules/FormCheckbox";
import StatusIndicator from "@/components/features/admin/StatusIndicator";
import type { SmsIntegration } from "@/types/settings";

interface SmsSettingsFormProps {
  showSensitiveData: boolean;
  isLoading: boolean;
}

export default function SmsSettingsForm({
  showSensitiveData,
  isLoading,
}: SmsSettingsFormProps) {
  const form = useFormContext<SmsIntegration>();
  const provider = form.watch("provider");
  const isActive = form.watch("isActive");

  return (
    <form className="space-y-8">
      {/* Status and Provider */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h4 className="text-lg font-medium text-black">SMS Sistemi Durumu</h4>
          <p className="text-sm text-gray-600">
            SMS entegrasyonunuzun aktiflik durumu
          </p>
        </div>
        <StatusIndicator isActive={isActive} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMS Sağlayıcısı
          </label>
          <select
            {...form.register("provider")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          >
            <option value="netgsm">NetGSM</option>
            <option value="twilio">Twilio</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <FormCheckbox name="isActive" label="Aktif" />
        </div>
      </div>

      {/* Provider specific settings */}
      {provider === "netgsm" && (
        <div>
          <h4 className="text-lg font-medium text-black mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            NetGSM Ayarları
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="netgsmApiKey"
              label="API Key"
              placeholder="NetGSM API Key"
              type={showSensitiveData ? "text" : "password"}
            />
            <FormInput
              name="netgsmHeader"
              label="SMS Başlığı"
              placeholder="FOTOMANDALIN"
            />
          </div>
        </div>
      )}

      {provider === "twilio" && (
        <div>
          <h4 className="text-lg font-medium text-black mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Twilio Ayarları
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="twilioAccountSid"
              label="Account SID"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
              type={showSensitiveData ? "text" : "password"}
            />
            <FormInput
              name="twilioAuthToken"
              label="Auth Token"
              placeholder="Auth Token"
              type={showSensitiveData ? "text" : "password"}
            />
            <FormInput
              name="twilioFromNumber"
              label="Gönderen Numara"
              placeholder="+1234567890"
            />
          </div>
        </div>
      )}

      {/* SMS Configuration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          SMS Konfigürasyonu
        </h4>
        <div className="grid grid-cols-1 gap-6">
          <FormInput
            name="defaultSender"
            label="Varsayılan Gönderen"
            placeholder="FOTOMANDALIN"
          />
        </div>
      </div>

      {!showSensitiveData && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Hassas Veriler Gizli</p>
            <p>
              API anahtarları ve diğer hassas veriler güvenlik amacıyla
              gizlenmiştir. Görmek için sağ üstteki düğmeyi kullanın.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
