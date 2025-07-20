"use client";

import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import {
  Settings,
  Globe,
  Mail,
  MessageSquare,
  CreditCard,
  Eye,
  EyeOff,
  Share2,
  Calendar,
} from "lucide-react";

import {
  useSettingsData,
  useSettingsMutations,
  useSettingsForms,
} from "@/hooks/useSettings";
import SettingsTab from "@/components/features/admin/SettingsTab";
import SettingsCard from "@/components/features/admin/SettingsCard";
import SiteSettingsForm from "@/components/features/admin/settings/SiteSettingsForm";
import PaymentSettingsForm from "@/components/features/admin/settings/PaymentSettingsForm";
import EmailSettingsForm from "@/components/features/admin/settings/EmailSettingsForm";
import SmsSettingsForm from "@/components/features/admin/settings/SmsSettingsForm";
import SocialSettingsForm from "@/components/features/admin/settings/SocialSettingsForm";
import BookingSettingsForm from "@/components/features/admin/settings/BookingSettingsForm";

export default function SettingsContainer() {
  const [activeTab, setActiveTab] = useState("site");
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Custom hooks
  const {
    siteSettings,
    siteLoading,
    paymentIntegrations,
    paymentLoading,
    emailIntegrations,
    emailLoading,
    smsIntegrations,
    smsLoading,
    bookingSettings,
    bookingLoading,
  } = useSettingsData();

  const {
    updateSiteSettings,
    updatePaymentIntegration,
    updateEmailIntegration,
    updateSmsIntegration,
    updateBookingSettings,
    handleSiteSettingsSubmit,
    handlePaymentSubmit,
    handleEmailSubmit,
    handleSmsSubmit,
    handleBookingSubmit,
  } = useSettingsMutations();

  const { siteForm, paymentForm, emailForm, smsForm, bookingForm } =
    useSettingsForms();

  // Reset handlers
  const resetSiteSettings = () => {
    if (siteSettings) {
      const transformedData = {
        siteName: siteSettings.siteName,
        siteUrl: siteSettings.siteUrl,
        description: siteSettings.description,
        contactEmail: siteSettings.contactEmail || "",
        contactPhone: siteSettings.contactPhone || "",
        contactAddress: siteSettings.contactAddress || "",
        instagramUrl: siteSettings.instagramUrl || "",
        facebookUrl: siteSettings.facebookUrl || "",
        twitterUrl: siteSettings.twitterUrl || "",
        linkedinUrl: siteSettings.linkedinUrl || "",
        youtubeUrl: siteSettings.youtubeUrl || "",
        timezone: siteSettings.timezone,
        currency: siteSettings.currency,
        language: siteSettings.language,
        metaTitle: siteSettings.metaTitle || "",
        metaDescription: siteSettings.metaDescription || "",
        metaKeywords: siteSettings.metaKeywords || "",
        favicon: siteSettings.favicon || "",
        logo: siteSettings.logo || "",
        primaryColor: siteSettings.primaryColor,
        secondaryColor: siteSettings.secondaryColor,
        accentColor: siteSettings.accentColor,
        maintenanceMode: siteSettings.maintenanceMode,
        registrationOpen: siteSettings.registrationOpen,
        bookingEnabled: siteSettings.bookingEnabled,
        reviewsEnabled: siteSettings.reviewsEnabled,
        portfolioEnabled: siteSettings.portfolioEnabled,
        privacyPolicyUrl: siteSettings.privacyPolicyUrl || "",
        termsOfServiceUrl: siteSettings.termsOfServiceUrl || "",
        cookiePolicyUrl: siteSettings.cookiePolicyUrl || "",
      };
      siteForm.reset(transformedData);
    }
  };

  const resetPaymentSettings = () => {
    if (paymentIntegrations && paymentIntegrations.length > 0) {
      const paymentData = paymentIntegrations[0];
      paymentForm.reset({
        provider: paymentData.provider,
        isActive: paymentData.isActive,
        isTestMode: paymentData.isTestMode,
        iyzicoApiKey: paymentData.iyzicoApiKey || "",
        iyzicoSecretKey: paymentData.iyzicoSecretKey || "",
        iyzicoBaseUrl: paymentData.iyzicoBaseUrl || "",
        stripePublishableKey: paymentData.stripePublishableKey || "",
        stripeSecretKey: paymentData.stripeSecretKey || "",
        stripeWebhookSecret: paymentData.stripeWebhookSecret || "",
        paytrMerchantId: paymentData.paytrMerchantId || "",
        paytrMerchantKey: paymentData.paytrMerchantKey || "",
        paytrMerchantSalt: paymentData.paytrMerchantSalt || "",
        callbackUrl: paymentData.callbackUrl || "",
        webhookUrl: paymentData.webhookUrl || "",
      });
    }
  };

  const resetEmailSettings = () => {
    if (emailIntegrations && emailIntegrations.length > 0) {
      const emailData = emailIntegrations[0];
      emailForm.reset({
        provider: emailData.provider,
        isActive: emailData.isActive,
        smtpHost: emailData.smtpHost || "",
        smtpPort: emailData.smtpPort || 587,
        smtpUsername: emailData.smtpUsername || "",
        smtpPassword: emailData.smtpPassword || "",
        smtpSecure: emailData.smtpSecure,
        sendgridApiKey: emailData.sendgridApiKey || "",
        fromEmail: emailData.fromEmail || "",
        fromName: emailData.fromName || "",
        replyTo: emailData.replyTo || "",
      });
    }
  };

  const resetSmsSettings = () => {
    if (smsIntegrations && smsIntegrations.length > 0) {
      const smsData = smsIntegrations[0];
      smsForm.reset({
        provider: smsData.provider,
        isActive: smsData.isActive,
        netgsmApiKey: smsData.netgsmApiKey || "",
        netgsmHeader: smsData.netgsmHeader || "",
        twilioAccountSid: smsData.twilioAccountSid || "",
        twilioAuthToken: smsData.twilioAuthToken || "",
        twilioFromNumber: smsData.twilioFromNumber || "",
        defaultSender: smsData.defaultSender || "",
      });
    }
  };

  const resetBookingSettings = () => {
    if (bookingSettings) {
      bookingForm.reset({
        googleCalendarApiKey: bookingSettings.googleCalendarApiKey || "",
        googleCalendarId: bookingSettings.googleCalendarId || "",
        googleCalendarEnabled: bookingSettings.googleCalendarEnabled,
        outlookClientId: bookingSettings.outlookClientId || "",
        outlookClientSecret: bookingSettings.outlookClientSecret || "",
        outlookEnabled: bookingSettings.outlookEnabled,
        minimumBookingHours: bookingSettings.minimumBookingHours,
        maximumAdvanceBookingDays: bookingSettings.maximumAdvanceBookingDays,
        workingHoursStart: bookingSettings.workingHoursStart,
        workingHoursEnd: bookingSettings.workingHoursEnd,
        autoConfirmBookings: bookingSettings.autoConfirmBookings,
        sendReminders: bookingSettings.sendReminders,
        bufferTimeBefore: bookingSettings.bufferTimeBefore || 30,
        bufferTimeAfter: bookingSettings.bufferTimeAfter || 30,
        cancellationHours: bookingSettings.cancellationHours || 24,
      });
    }
  };

  const tabs = [
    {
      id: "site",
      label: "Site Ayarları",
      description: "Genel site bilgileri ve görünüm ayarları",
      icon: <Globe className="h-5 w-5" />,
      hasChanges: siteForm.formState.isDirty,
    },
    {
      id: "payment",
      label: "Ödeme Entegrasyonu",
      description: "Ödeme sağlayıcıları ve API ayarları",
      icon: <CreditCard className="h-5 w-5" />,
      hasChanges: paymentForm.formState.isDirty,
    },
    {
      id: "email",
      label: "E-posta Entegrasyonu",
      description: "SMTP ve e-posta servis sağlayıcı ayarları",
      icon: <Mail className="h-5 w-5" />,
      hasChanges: emailForm.formState.isDirty,
    },
    {
      id: "sms",
      label: "SMS Entegrasyonu",
      description: "SMS servis sağlayıcı ve bildirim ayarları",
      icon: <MessageSquare className="h-5 w-5" />,
      hasChanges: smsForm.formState.isDirty,
    },
    {
      id: "social",
      label: "Sosyal Medya",
      description: "Sosyal medya platform entegrasyonları",
      icon: <Share2 className="h-5 w-5" />,
      hasChanges: false,
    },
    {
      id: "booking",
      label: "Rezervasyon",
      description: "Takvim entegrasyonları ve rezervasyon ayarları",
      icon: <Calendar className="h-5 w-5" />,
      hasChanges: bookingForm.formState.isDirty,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gray-50 rounded-lg text-black border border-gray-200">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Sistem Ayarları
                </h1>
                <p className="text-gray-600 mt-1">
                  Site ayarlarınızı ve entegrasyonlarınızı yönetin
                </p>
              </div>
            </div>

            {/* Sensitive Data Toggle */}
            <button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {showSensitiveData ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>
                {showSensitiveData
                  ? "Hassas verileri gizle"
                  : "Hassas verileri göster"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-black mb-6">
                Ayar Kategorileri
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <SettingsTab
                    key={tab.id}
                    id={tab.id}
                    label={tab.label}
                    description={tab.description}
                    icon={tab.icon}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    hasChanges={tab.hasChanges}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Site Settings */}
              {activeTab === "site" && (
                <FormProvider {...siteForm}>
                  <SettingsCard
                    title="Site Ayarları"
                    description="Sitenizin genel bilgilerini ve görünümünü yönetin"
                    icon={<Globe className="h-6 w-6" />}
                    isLoading={siteLoading || updateSiteSettings.isPending}
                    onSave={() =>
                      siteForm.handleSubmit(handleSiteSettingsSubmit)()
                    }
                    onReset={resetSiteSettings}
                    hasChanges={siteForm.formState.isDirty}
                  >
                    <SiteSettingsForm />
                  </SettingsCard>
                </FormProvider>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <FormProvider {...paymentForm}>
                  <SettingsCard
                    title="Ödeme Entegrasyonu"
                    description="Ödeme sistemlerinizi yapılandırın"
                    icon={<CreditCard className="h-6 w-6" />}
                    isLoading={
                      paymentLoading || updatePaymentIntegration.isPending
                    }
                    onSave={() =>
                      paymentForm.handleSubmit(handlePaymentSubmit)()
                    }
                    onReset={resetPaymentSettings}
                    hasChanges={paymentForm.formState.isDirty}
                  >
                    <PaymentSettingsForm
                      showSensitiveData={showSensitiveData}
                      isLoading={paymentLoading}
                    />
                  </SettingsCard>
                </FormProvider>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <FormProvider {...emailForm}>
                  <SettingsCard
                    title="E-posta Entegrasyonu"
                    description="SMTP ve e-posta servis sağlayıcı ayarlarınızı yapılandırın"
                    icon={<Mail className="h-6 w-6" />}
                    isLoading={emailLoading || updateEmailIntegration.isPending}
                    onSave={() => emailForm.handleSubmit(handleEmailSubmit)()}
                    onReset={resetEmailSettings}
                    hasChanges={emailForm.formState.isDirty}
                  >
                    <EmailSettingsForm
                      showSensitiveData={showSensitiveData}
                      isLoading={emailLoading}
                    />
                  </SettingsCard>
                </FormProvider>
              )}

              {/* SMS Settings */}
              {activeTab === "sms" && (
                <FormProvider {...smsForm}>
                  <SettingsCard
                    title="SMS Entegrasyonu"
                    description="SMS servis sağlayıcı ve bildirim ayarlarınızı yapılandırın"
                    icon={<MessageSquare className="h-6 w-6" />}
                    isLoading={smsLoading || updateSmsIntegration.isPending}
                    onSave={() => smsForm.handleSubmit(handleSmsSubmit)()}
                    onReset={resetSmsSettings}
                    hasChanges={smsForm.formState.isDirty}
                  >
                    <SmsSettingsForm
                      showSensitiveData={showSensitiveData}
                      isLoading={smsLoading}
                    />
                  </SettingsCard>
                </FormProvider>
              )}

              {/* Social Media Settings */}
              {activeTab === "social" && (
                <SettingsCard
                  title="Sosyal Medya Entegrasyonu"
                  description="Sosyal medya platform entegrasyonlarınızı yönetin"
                  icon={<Share2 className="h-6 w-6" />}
                  hasChanges={false}
                >
                  <SocialSettingsForm showSensitiveData={showSensitiveData} />
                </SettingsCard>
              )}

              {/* Booking Settings */}
              {activeTab === "booking" && (
                <FormProvider {...bookingForm}>
                  <SettingsCard
                    title="Rezervasyon Entegrasyonu"
                    description="Takvim entegrasyonları ve rezervasyon ayarlarınızı yönetin"
                    icon={<Calendar className="h-6 w-6" />}
                    isLoading={
                      bookingLoading || updateBookingSettings.isPending
                    }
                    onSave={() => {
                      const formData = bookingForm.getValues();
                      const data = {
                        googleCalendarApiKey:
                          formData.googleCalendarApiKey || "",
                        googleCalendarId: formData.googleCalendarId || "",
                        googleCalendarEnabled:
                          formData.googleCalendarEnabled ?? false,
                        outlookClientId: formData.outlookClientId || "",
                        outlookClientSecret: formData.outlookClientSecret || "",
                        outlookEnabled: formData.outlookEnabled ?? false,
                        minimumBookingHours: formData.minimumBookingHours ?? 2,
                        maximumAdvanceBookingDays:
                          formData.maximumAdvanceBookingDays ?? 90,
                        workingHoursStart:
                          formData.workingHoursStart || "09:00",
                        workingHoursEnd: formData.workingHoursEnd || "18:00",
                        autoConfirmBookings:
                          formData.autoConfirmBookings ?? false,
                        sendReminders: formData.sendReminders ?? true,
                        bufferTimeBefore: formData.bufferTimeBefore ?? 30,
                        bufferTimeAfter: formData.bufferTimeAfter ?? 30,
                        cancellationHours: formData.cancellationHours ?? 24,
                      };
                      handleBookingSubmit(data);
                    }}
                    onReset={resetBookingSettings}
                    hasChanges={bookingForm.formState.isDirty}
                  >
                    <BookingSettingsForm
                      showSensitiveData={showSensitiveData}
                    />
                  </SettingsCard>
                </FormProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
