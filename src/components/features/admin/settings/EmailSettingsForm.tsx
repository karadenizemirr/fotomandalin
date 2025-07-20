"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Shield, Mail, AlertCircle } from "lucide-react";
import FormInput from "@/components/molecules/FormInput";
import FormCheckbox from "@/components/molecules/FormCheckbox";
import StatusIndicator from "@/components/features/admin/StatusIndicator";
import type { EmailIntegration } from "@/types/settings";

interface EmailSettingsFormProps {
  showSensitiveData: boolean;
  isLoading: boolean;
}

export default function EmailSettingsForm({
  showSensitiveData,
  isLoading,
}: EmailSettingsFormProps) {
  const form = useFormContext<EmailIntegration>();
  const provider = form.watch("provider");
  const isActive = form.watch("isActive");

  return (
    <form className="space-y-8">
      {/* Status and Provider */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h4 className="text-lg font-medium text-black">
            E-posta Sistemi Durumu
          </h4>
          <p className="text-sm text-gray-600">
            E-posta entegrasyonunuzun aktiflik durumu
          </p>
        </div>
        <StatusIndicator isActive={isActive} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-posta Sağlayıcısı
          </label>
          <select
            {...form.register("provider")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
          </select>
        </div>

        <div className="flex items-center space-x-6 pt-6">
          <FormCheckbox name="isActive" label="Aktif" />
          <FormCheckbox name="smtpSecure" label="SSL/TLS" />
        </div>
      </div>

      {/* Provider specific settings */}
      {provider === "smtp" && (
        <div>
          <h4 className="text-lg font-medium text-black mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            SMTP Ayarları
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="smtpHost"
              label="SMTP Host"
              placeholder="smtp.gmail.com"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                {...form.register("smtpPort", {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="587"
              />
            </div>
            <FormInput
              name="smtpUsername"
              label="Kullanıcı Adı"
              placeholder="your-email@gmail.com"
            />
            <FormInput
              name="smtpPassword"
              label="Şifre / App Password"
              placeholder="uygulama şifresi"
              type={showSensitiveData ? "text" : "password"}
            />
          </div>
        </div>
      )}

      {provider === "sendgrid" && (
        <div>
          <h4 className="text-lg font-medium text-black mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            SendGrid Ayarları
          </h4>
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              name="sendgridApiKey"
              label="SendGrid API Key"
              placeholder="SG.xxxxxxxxxxxxxxx"
              type={showSensitiveData ? "text" : "password"}
            />
          </div>
        </div>
      )}

      {/* Email Configuration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          E-posta Konfigürasyonu
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="fromEmail"
            label="Gönderen E-posta"
            placeholder="noreply@fotomandalin.com"
            type="email"
          />
          <FormInput
            name="fromName"
            label="Gönderen İsmi"
            placeholder="Fotomandalin"
          />
          <FormInput
            name="replyTo"
            label="Yanıtlama Adresi"
            placeholder="info@fotomandalin.com"
            type="email"
          />
        </div>
      </div>

      {!showSensitiveData && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Hassas Veriler Gizli</p>
            <p>
              SMTP şifreleri ve API anahtarları güvenlik amacıyla gizlenmiştir.
              Görmek için sağ üstteki düğmeyi kullanın.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
