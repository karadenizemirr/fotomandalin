import { z } from "zod";

// Schema definitions matching the tRPC router
export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site adı gereklidir"),
  siteUrl: z.string().url("Geçerli URL giriniz"),
  description: z.string().min(1, "Site açıklaması gereklidir"),
  contactEmail: z
    .string()
    .email("Geçerli email adresi giriniz")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactAddress: z.string().optional().or(z.literal("")),
  instagramUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  twitterUrl: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  youtubeUrl: z.string().optional().or(z.literal("")),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  metaKeywords: z.string().optional().or(z.literal("")),
  favicon: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  maintenanceMode: z.boolean(),
  registrationOpen: z.boolean(),
  bookingEnabled: z.boolean(),
  reviewsEnabled: z.boolean(),
  portfolioEnabled: z.boolean(),
  privacyPolicyUrl: z.string().optional().or(z.literal("")),
  termsOfServiceUrl: z.string().optional().or(z.literal("")),
  cookiePolicyUrl: z.string().optional().or(z.literal("")),
});

export const paymentIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  isTestMode: z.boolean(),
  iyzicoApiKey: z.string().optional().or(z.literal("")),
  iyzicoSecretKey: z.string().optional().or(z.literal("")),
  iyzicoBaseUrl: z.string().optional().or(z.literal("")),
  stripePublishableKey: z.string().optional().or(z.literal("")),
  stripeSecretKey: z.string().optional().or(z.literal("")),
  stripeWebhookSecret: z.string().optional().or(z.literal("")),
  paytrMerchantId: z.string().optional().or(z.literal("")),
  paytrMerchantKey: z.string().optional().or(z.literal("")),
  paytrMerchantSalt: z.string().optional().or(z.literal("")),
  callbackUrl: z.string().optional().or(z.literal("")),
  webhookUrl: z.string().optional().or(z.literal("")),
});

export const emailIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  smtpHost: z.string().optional().or(z.literal("")),
  smtpPort: z.number().optional(),
  smtpUsername: z.string().optional().or(z.literal("")),
  smtpPassword: z.string().optional().or(z.literal("")),
  smtpSecure: z.boolean(),
  sendgridApiKey: z.string().optional().or(z.literal("")),
  fromEmail: z.string().optional().or(z.literal("")),
  fromName: z.string().optional().or(z.literal("")),
  replyTo: z.string().optional().or(z.literal("")),
});

export const smsIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  netgsmApiKey: z.string().optional().or(z.literal("")),
  netgsmHeader: z.string().optional().or(z.literal("")),
  twilioAccountSid: z.string().optional().or(z.literal("")),
  twilioAuthToken: z.string().optional().or(z.literal("")),
  twilioFromNumber: z.string().optional().or(z.literal("")),
  defaultSender: z.string().optional().or(z.literal("")),
});

export const bookingSettingsSchema = z.object({
  // Google Calendar Integration
  googleCalendarApiKey: z.string().optional().or(z.literal("")),
  googleCalendarId: z.string().optional().or(z.literal("")),
  googleCalendarEnabled: z.boolean().default(false),
  
  // Outlook Integration
  outlookClientId: z.string().optional().or(z.literal("")),
  outlookClientSecret: z.string().optional().or(z.literal("")),
  outlookEnabled: z.boolean().default(false),
  
  // Booking Settings
  minimumBookingHours: z.number().min(1).max(24).default(2),
  maximumAdvanceBookingDays: z.number().min(1).max(365).default(90),
  workingHoursStart: z.string().default("09:00"),
  workingHoursEnd: z.string().default("18:00"),
  autoConfirmBookings: z.boolean().default(false),
  sendReminders: z.boolean().default(true),
  
  // Buffer Settings
  bufferTimeBefore: z.number().default(30),
  bufferTimeAfter: z.number().default(30),
  
  // Cancellation Policy
  cancellationHours: z.number().default(24),
});

// Type definitions
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type PaymentIntegration = z.infer<typeof paymentIntegrationSchema>;
export type EmailIntegration = z.infer<typeof emailIntegrationSchema>;
export type SmsIntegration = z.infer<typeof smsIntegrationSchema>;
export type BookingSettings = z.infer<typeof bookingSettingsSchema>;

// Interface definitions
export interface SettingsTabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  hasChanges?: boolean;
  description?: string;
}

export interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  hasChanges?: boolean;
}

export interface StatusIndicatorProps {
  isActive: boolean;
  isLoading?: boolean;
}
