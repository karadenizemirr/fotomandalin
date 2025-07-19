import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import {
  siteSettingsSchema,
  paymentIntegrationSchema,
  emailIntegrationSchema,
  smsIntegrationSchema,
  bookingSettingsSchema,
  type SiteSettings,
  type PaymentIntegration,
  type EmailIntegration,
  type SmsIntegration,
  type BookingSettings,
} from "@/types/settings";

export function useSettingsData() {
  // tRPC queries
  const { data: siteSettings, isLoading: siteLoading } =
    trpc.systemSettings.getSiteSettings.useQuery();
  const { data: paymentIntegrations, isLoading: paymentLoading } =
    trpc.systemSettings.getPaymentIntegrations.useQuery();
  const { data: emailIntegrations, isLoading: emailLoading } =
    trpc.systemSettings.getEmailIntegrations.useQuery();
  const { data: smsIntegrations, isLoading: smsLoading } =
    trpc.systemSettings.getSmsIntegrations.useQuery();
  const { data: bookingSettings, isLoading: bookingLoading } =
    trpc.systemSettings.getBookingSettings.useQuery();

  return {
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
  };
}

export function useSettingsMutations() {
  const { addToast } = useToast();

  // tRPC mutations
  const updateSiteSettings =
    trpc.systemSettings.updateSiteSettings.useMutation();
  const updatePaymentIntegration =
    trpc.systemSettings.updatePaymentIntegration.useMutation();
  const updateEmailIntegration =
    trpc.systemSettings.updateEmailIntegration.useMutation();
  const updateSmsIntegration =
    trpc.systemSettings.updateSmsIntegration.useMutation();
  
  // Booking settings mutation
  const updateBookingSettings =
    trpc.systemSettings.updateBookingSettings.useMutation();

  // Submit handlers
  const handleSiteSettingsSubmit = async (data: SiteSettings) => {
    try {
      await updateSiteSettings.mutateAsync(data);
      addToast({
        type: "success",
        message: "Site ayarları başarıyla güncellendi",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "Ayarlar güncellenirken hata oluştu",
      });
    }
  };

  const handlePaymentSubmit = async (data: PaymentIntegration) => {
    try {
      await updatePaymentIntegration.mutateAsync(data);
      addToast({
        type: "success",
        message: "Ödeme entegrasyonu başarıyla güncellendi",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message:
          error.message || "Ödeme entegrasyonu güncellenirken hata oluştu",
      });
    }
  };

  const handleEmailSubmit = async (data: EmailIntegration) => {
    try {
      await updateEmailIntegration.mutateAsync(data);
      addToast({
        type: "success",
        message: "E-posta entegrasyonu başarıyla güncellendi",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message:
          error.message || "E-posta entegrasyonu güncellenirken hata oluştu",
      });
    }
  };

  const handleSmsSubmit = async (data: SmsIntegration) => {
    try {
      await updateSmsIntegration.mutateAsync(data);
      addToast({
        type: "success",
        message: "SMS entegrasyonu başarıyla güncellendi",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "SMS entegrasyonu güncellenirken hata oluştu",
      });
    }
  };

  const handleBookingSubmit = async (data: BookingSettings) => {
    try {
      await updateBookingSettings.mutateAsync(data);
      addToast({
        type: "success",
        message: "Rezervasyon ayarları başarıyla güncellendi",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "Rezervasyon ayarları güncellenirken hata oluştu",
      });
    }
  };

  return {
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
  };
}

export function useSettingsForms() {
  const { 
    siteSettings, 
    paymentIntegrations, 
    emailIntegrations, 
    smsIntegrations,
    bookingSettings
  } = useSettingsData();

  // Form instances
  const siteForm = useForm<SiteSettings>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: "",
      siteUrl: "",
      description: "",
      timezone: "Europe/Istanbul",
      currency: "TRY",
      language: "tr",
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      accentColor: "#fca311",
      maintenanceMode: false,
      registrationOpen: true,
      bookingEnabled: true,
      reviewsEnabled: true,
      portfolioEnabled: true,
    },
  });

  const paymentForm = useForm<PaymentIntegration>({
    resolver: zodResolver(paymentIntegrationSchema),
    defaultValues: {
      provider: "iyzico",
      isActive: false,
      isTestMode: true,
    },
  });

  const emailForm = useForm<EmailIntegration>({
    resolver: zodResolver(emailIntegrationSchema),
    defaultValues: {
      provider: "smtp",
      isActive: false,
      smtpSecure: true,
    },
  });

  const smsForm = useForm<SmsIntegration>({
    resolver: zodResolver(smsIntegrationSchema),
    defaultValues: {
      provider: "netgsm",
      isActive: false,
    },
  });

  const bookingForm = useForm({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: {
      googleCalendarApiKey: "",
      googleCalendarId: "",
      googleCalendarEnabled: false,
      outlookClientId: "",
      outlookClientSecret: "",
      outlookEnabled: false,
      minimumBookingHours: 2,
      maximumAdvanceBookingDays: 90,
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      autoConfirmBookings: false,
      sendReminders: true,
      bufferTimeBefore: 30,
      bufferTimeAfter: 30,
      cancellationHours: 24,
    },
  });

  // Load data into forms when available
  useEffect(() => {
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
  }, [siteSettings]);

  useEffect(() => {
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
  }, [paymentIntegrations]);

  useEffect(() => {
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
  }, [emailIntegrations]);

  useEffect(() => {
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
  }, [smsIntegrations]);

  useEffect(() => {
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
  }, [bookingSettings]);

  return {
    siteForm,
    paymentForm,
    emailForm,
    smsForm,
    bookingForm,
  };
}
