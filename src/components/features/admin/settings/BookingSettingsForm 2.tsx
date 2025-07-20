"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Calendar, Globe, Shield, AlertCircle } from "lucide-react";
import StatusIndicator from "@/components/features/admin/StatusIndicator";
import type { BookingSettings } from "@/types/settings";

interface BookingSettingsFormProps {
  showSensitiveData: boolean;
}

export default function BookingSettingsForm({
  showSensitiveData,
}: BookingSettingsFormProps) {
  const { register, watch } = useFormContext<BookingSettings>();
  const watchedValues = watch();

  return (
    <div className="space-y-8">
      {/* Google Calendar Integration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Google Calendar Entegrasyonu
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-black">Calendar API</h5>
              <p className="text-sm text-gray-600">
                Rezervasyonları Google Calendar ile senkronize edin
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("googleCalendarEnabled")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <StatusIndicator isActive={watchedValues.googleCalendarEnabled} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                {...register("googleCalendarApiKey")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Google Calendar API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar ID
              </label>
              <input
                type="text"
                {...register("googleCalendarId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="primary@gmail.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Outlook Integration */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Outlook Entegrasyonu
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-black">Outlook Calendar</h5>
              <p className="text-sm text-gray-600">
                Microsoft Outlook ile takvim senkronizasyonu
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("outlookEnabled")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <StatusIndicator isActive={watchedValues.outlookEnabled} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                {...register("outlookClientId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Microsoft App ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <input
                type={showSensitiveData ? "text" : "password"}
                {...register("outlookClientSecret")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Microsoft App Secret"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Settings */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Rezervasyon Ayarları
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rezervasyon Süresi (Saat)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                {...register("minimumBookingHours", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Önceden Rezervasyon (Gün)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                {...register("maximumAdvanceBookingDays", {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Başlangıcı
              </label>
              <input
                type="time"
                {...register("workingHoursStart")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Bitişi
              </label>
              <input
                type="time"
                {...register("workingHoursEnd")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoConfirm"
                {...register("autoConfirmBookings")}
                className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
              />
              <label
                htmlFor="autoConfirm"
                className="ml-2 text-sm text-gray-700"
              >
                Rezervasyonları otomatik onayla
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendReminders"
                {...register("sendReminders")}
                className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
              />
              <label
                htmlFor="sendReminders"
                className="ml-2 text-sm text-gray-700"
              >
                Rezervasyon hatırlatmaları gönder
              </label>
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
