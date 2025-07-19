"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import {
  Globe,
  Mail,
  Share2,
  Settings,
  Palette,
  Activity,
  BarChart3,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import FormInput from "@/components/molecules/FormInput";
import FormCheckbox from "@/components/molecules/FormCheckbox";
import Upload from "@/components/organisms/upload/Upload";

export default function SiteSettingsForm() {
  const { setValue, watch } = useFormContext();

  const logoUrl = watch("logo");
  const faviconUrl = watch("favicon");
  return (
    <form className="space-y-8">
      {/* Basic Information */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Temel Bilgiler
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="siteName"
            label="Site Adı"
            placeholder="Fotomandalin"
            required
          />
          <FormInput
            name="siteUrl"
            label="Site URL"
            placeholder="https://fotomandalin.com"
            required
          />
          <div className="md:col-span-2">
            <FormInput
              name="description"
              label="Site Açıklaması"
              placeholder="Profesyonel fotoğrafçılık hizmetleri"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          İletişim Bilgileri
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="contactEmail"
            label="İletişim E-postası"
            placeholder="info@fotomandalin.com"
            type="email"
          />
          <FormInput
            name="contactPhone"
            label="Telefon Numarası"
            placeholder="+90 (555) 123 45 67"
          />
          <div className="md:col-span-2">
            <FormInput
              name="contactAddress"
              label="Adres"
              placeholder="İş adresi veya ofis konumu"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Sosyal Medya
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="instagramUrl"
            label="Instagram URL"
            placeholder="https://instagram.com/fotomandalin"
          />
          <FormInput
            name="facebookUrl"
            label="Facebook URL"
            placeholder="https://facebook.com/fotomandalin"
          />
          <FormInput
            name="twitterUrl"
            label="Twitter URL"
            placeholder="https://twitter.com/fotomandalin"
          />
          <FormInput
            name="linkedinUrl"
            label="LinkedIn URL"
            placeholder="https://linkedin.com/company/fotomandalin"
          />
        </div>
      </div>

      {/* System Settings */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Sistem Ayarları
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            name="timezone"
            label="Zaman Dilimi"
            placeholder="Europe/Istanbul"
          />
          <FormInput name="currency" label="Para Birimi" placeholder="TRY" />
          <FormInput name="language" label="Dil" placeholder="tr" />
        </div>
      </div>

      {/* Theme Colors */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Tema Renkleri
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput name="primaryColor" label="Ana Renk" type="color" />
          <FormInput name="secondaryColor" label="İkincil Renk" type="color" />
          <FormInput name="accentColor" label="Vurgu Rengi" type="color" />
        </div>
      </div>

      {/* Feature Toggles */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Özellik Ayarları
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCheckbox name="bookingEnabled" label="Rezervasyon Sistemi" />
          <FormCheckbox name="portfolioEnabled" label="Portfolyo Bölümü" />
          <FormCheckbox name="reviewsEnabled" label="Yorum Sistemi" />
          <FormCheckbox name="registrationOpen" label="Üye Kayıt" />
          <FormCheckbox name="maintenanceMode" label="Bakım Modu" />
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h4 className="text-lg font-medium text-black mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          SEO ve Marka Ayarları
        </h4>
        <div className="space-y-6">
          {/* Logo ve Favicon Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Logosu
              </label>

              {/* Mevcut Logo Preview */}
              {logoUrl && (
                <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Mevcut Logo:</p>
                  <div className="relative w-32 h-16 bg-white rounded border">
                    <Image
                      src={logoUrl}
                      alt="Site Logo"
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        // Resim yüklenemezse varsayılan icon göster
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{logoUrl}</p>
                </div>
              )}

              <Upload
                preset="image"
                maxFiles={1}
                config={{
                  maxSize: 5 * 1024 * 1024, // 5MB
                  allowedTypes: [
                    "image/png",
                    "image/jpeg",
                    "image/svg+xml",
                    "image/webp",
                  ],
                }}
                onUpload={(files) => {
                  if (files.length > 0) {
                    // Logo URL'yi form'a set et
                    setValue("logo", files[0].url);
                  }
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG veya WebP formatında, maksimum 5MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>

              {/* Mevcut Favicon Preview */}
              {faviconUrl && (
                <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Mevcut Favicon:</p>
                  <div className="relative w-8 h-8 bg-white rounded border">
                    <Image
                      src={faviconUrl}
                      alt="Site Favicon"
                      fill
                      className="object-contain p-1"
                      onError={(e) => {
                        // Resim yüklenemezse varsayılan icon göster
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{faviconUrl}</p>
                </div>
              )}

              <Upload
                preset="image"
                maxFiles={1}
                config={{
                  maxSize: 1 * 1024 * 1024, // 1MB
                  allowedTypes: [
                    "image/ico",
                    "image/png",
                    "image/jpeg",
                    "image/svg+xml",
                  ],
                }}
                onUpload={(files) => {
                  if (files.length > 0) {
                    // Favicon URL'yi form'a set et
                    setValue("favicon", files[0].url);
                  }
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                ICO, PNG, JPG veya SVG formatında, maksimum 1MB
              </p>
            </div>
          </div>

          {/* Manual URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="logo"
              label="Logo URL (Manuel)"
              placeholder="/images/logo.png"
            />
            <FormInput
              name="favicon"
              label="Favicon URL (Manuel)"
              placeholder="/favicon.ico"
            />
          </div>

          {/* SEO Meta Tags */}
          <FormInput
            name="metaTitle"
            label="Meta Başlık"
            placeholder="Fotomandalin - Profesyonel Fotoğrafçılık"
          />
          <FormInput
            name="metaDescription"
            label="Meta Açıklama"
            placeholder="Düğün, nişan ve özel anlarınız için profesyonel fotoğrafçılık hizmetleri"
          />
          <FormInput
            name="metaKeywords"
            label="Meta Anahtar Kelimeler"
            placeholder="fotoğraf, çekim, düğün, nişan, portre"
          />
        </div>
      </div>
    </form>
  );
}
