"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import type { SiteSettings } from "@/types/settings";

interface SiteSettingsContextType {
  siteSettings: any | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(
  undefined
);

interface SiteSettingsProviderProps {
  children: React.ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const {
    data: siteSettings,
    isLoading,
    error,
    refetch,
  } = trpc.systemSettings.getSiteSettings.useQuery(undefined, {
    // Cache for 5 minutes to avoid unnecessary requests
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const value = {
    siteSettings: siteSettings as any,
    isLoading,
    error,
    refetch,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider"
    );
  }
  return context;
}

// Utility hook for getting specific settings with fallbacks
export function useSiteSettingsWithDefaults() {
  const { siteSettings, isLoading, error } = useSiteSettings();

  const getSettingWithFallback = <T,>(
    key: keyof SiteSettings,
    fallback: T
  ): T => {
    if (!siteSettings || isLoading) return fallback;
    const value = siteSettings[key];
    return (value !== null && value !== undefined ? value : fallback) as T;
  };

  return {
    // Site Identity
    siteName: getSettingWithFallback("siteName", "Fotomandalin"),
    siteUrl: getSettingWithFallback("siteUrl", "https://fotomandalin.com"),
    description: getSettingWithFallback(
      "description",
      "Profesyonel fotoğrafçılık hizmetleri"
    ),
    logo: getSettingWithFallback("logo", ""),
    favicon: getSettingWithFallback("favicon", ""),

    // Contact Information
    contactEmail: getSettingWithFallback(
      "contactEmail",
      "info@fotomandalin.com"
    ),
    contactPhone: getSettingWithFallback("contactPhone", "+90 (555) 123 45 67"),
    contactAddress: getSettingWithFallback(
      "contactAddress",
      "Ataşehir, İstanbul, Türkiye"
    ),

    // Social Media
    instagramUrl: getSettingWithFallback("instagramUrl", ""),
    facebookUrl: getSettingWithFallback("facebookUrl", ""),
    twitterUrl: getSettingWithFallback("twitterUrl", ""),
    linkedinUrl: getSettingWithFallback("linkedinUrl", ""),
    youtubeUrl: getSettingWithFallback("youtubeUrl", ""),

    // SEO
    metaTitle: getSettingWithFallback("metaTitle", ""),
    metaDescription: getSettingWithFallback("metaDescription", ""),
    metaKeywords: getSettingWithFallback("metaKeywords", ""),

    // Appearance
    primaryColor: getSettingWithFallback("primaryColor", "#000000"),
    secondaryColor: getSettingWithFallback("secondaryColor", "#ffffff"),
    accentColor: getSettingWithFallback("accentColor", "#fca311"),

    // Settings
    timezone: getSettingWithFallback("timezone", "Europe/Istanbul"),
    currency: getSettingWithFallback("currency", "TRY"),
    language: getSettingWithFallback("language", "tr"),

    // Features
    maintenanceMode: getSettingWithFallback("maintenanceMode", false),
    registrationOpen: getSettingWithFallback("registrationOpen", true),
    bookingEnabled: getSettingWithFallback("bookingEnabled", true),
    reviewsEnabled: getSettingWithFallback("reviewsEnabled", true),
    portfolioEnabled: getSettingWithFallback("portfolioEnabled", true),

    // Legal
    privacyPolicyUrl: getSettingWithFallback("privacyPolicyUrl", "/privacy"),
    termsOfServiceUrl: getSettingWithFallback("termsOfServiceUrl", "/terms"),
    cookiePolicyUrl: getSettingWithFallback("cookiePolicyUrl", "/cookies"),

    // States
    isLoading,
    error,
    siteSettings,
  };
}
