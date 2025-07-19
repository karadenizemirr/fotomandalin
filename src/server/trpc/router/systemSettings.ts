import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../index";
import { TRPCError } from "@trpc/server";

// Site Settings Schema
const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site adı gereklidir"),
  siteUrl: z.string().url("Geçerli URL giriniz"),
  description: z.string().min(1, "Site açıklaması gereklidir"),
  contactEmail: z.string().email("Geçerli email adresi giriniz").optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  businessHours: z.any().optional(),
  timezone: z.string().default("Europe/Istanbul"),
  currency: z.string().default("TRY"),
  language: z.string().default("tr"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  favicon: z.string().optional(),
  logo: z.string().optional(),
  primaryColor: z.string().default("#000000"),
  secondaryColor: z.string().default("#ffffff"),
  accentColor: z.string().default("#f59e0b"),
  maintenanceMode: z.boolean().default(false),
  registrationOpen: z.boolean().default(true),
  bookingEnabled: z.boolean().default(true),
  reviewsEnabled: z.boolean().default(true),
  portfolioEnabled: z.boolean().default(true),
  privacyPolicyUrl: z.string().optional(),
  termsOfServiceUrl: z.string().optional(),
  cookiePolicyUrl: z.string().optional(),
});

// Payment Integration Schema
const paymentIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  isTestMode: z.boolean().default(true),
  iyzicoApiKey: z.string().optional(),
  iyzicoSecretKey: z.string().optional(),
  iyzicoBaseUrl: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  paytrMerchantId: z.string().optional(),
  paytrMerchantKey: z.string().optional(),
  paytrMerchantSalt: z.string().optional(),
  payuMerchantId: z.string().optional(),
  payuSecretKey: z.string().optional(),
  callbackUrl: z.string().optional(),
  webhookUrl: z.string().optional(),
  settings: z.any().optional(),
});

// Email Integration Schema
const emailIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().default(true),
  sendgridApiKey: z.string().optional(),
  mailgunApiKey: z.string().optional(),
  mailgunDomain: z.string().optional(),
  mailgunRegion: z.string().default("us"),
  sesAccessKey: z.string().optional(),
  sesSecretKey: z.string().optional(),
  sesRegion: z.string().default("us-east-1"),
  resendApiKey: z.string().optional(),
  fromEmail: z.string().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().optional(),
  templates: z.any().optional(),
});

// SMS Integration Schema
const smsIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  netgsmApiKey: z.string().optional(),
  netgsmHeader: z.string().optional(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioFromNumber: z.string().optional(),
  vonageApiKey: z.string().optional(),
  vonageApiSecret: z.string().optional(),
  vonageFromName: z.string().optional(),
  imerkeziApiKey: z.string().optional(),
  imerkeziSender: z.string().optional(),
  mutlucellApiKey: z.string().optional(),
  mutlucellSender: z.string().optional(),
  defaultSender: z.string().optional(),
  encoding: z.string().default("UTF-8"),
  settings: z.any().optional(),
});

// Booking Settings Schema
const bookingSettingsSchema = z.object({
  googleCalendarApiKey: z.string().optional(),
  googleCalendarId: z.string().optional(),
  googleCalendarEnabled: z.boolean().default(false),
  outlookClientId: z.string().optional(),
  outlookClientSecret: z.string().optional(),
  outlookEnabled: z.boolean().default(false),
  minimumBookingHours: z.number().min(1).max(24).default(2),
  maximumAdvanceBookingDays: z.number().min(1).max(365).default(90),
  workingHoursStart: z.string().default("09:00"),
  workingHoursEnd: z.string().default("18:00"),
  autoConfirmBookings: z.boolean().default(false),
  sendReminders: z.boolean().default(true),
  bufferTimeBefore: z.number().default(30),
  bufferTimeAfter: z.number().default(30),
  cancellationHours: z.number().default(24),
  settings: z.any().optional(),
});

// Storage Integration Schema
const storageIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  awsRegion: z.string().optional(),
  awsS3BucketName: z.string().optional(),
  awsCloudFrontUrl: z.string().optional(),
  cloudinaryCloudName: z.string().optional(),
  cloudinaryApiKey: z.string().optional(),
  cloudinaryApiSecret: z.string().optional(),
  azureAccountName: z.string().optional(),
  azureAccountKey: z.string().optional(),
  azureContainerName: z.string().optional(),
  azureEndpoint: z.string().optional(),
  gcsProjectId: z.string().optional(),
  gcsPrivateKey: z.string().optional(),
  gcsClientEmail: z.string().optional(),
  gcsBucketName: z.string().optional(),
  doAccessKey: z.string().optional(),
  doSecretKey: z.string().optional(),
  doRegion: z.string().optional(),
  doBucketName: z.string().optional(),
  doEndpoint: z.string().optional(),
  cdnUrl: z.string().optional(),
  uploadPath: z.string().default("/uploads"),
  maxFileSize: z.number().default(10485760),
  allowedTypes: z.array(z.string()).default(["image/jpeg", "image/png", "image/webp"]),
  settings: z.any().optional(),
});

// Social Integration Schema
const socialIntegrationSchema = z.object({
  platform: z.string(),
  isActive: z.boolean(),
  instagramAccessToken: z.string().optional(),
  instagramBusinessId: z.string().optional(),
  instagramRefreshToken: z.string().optional(),
  instagramAppId: z.string().optional(),
  instagramAppSecret: z.string().optional(),
  facebookAppId: z.string().optional(),
  facebookAppSecret: z.string().optional(),
  facebookPageId: z.string().optional(),
  facebookAccessToken: z.string().optional(),
  whatsappToken: z.string().optional(),
  whatsappNumberId: z.string().optional(),
  whatsappWebhookUrl: z.string().optional(),
  whatsappVerifyToken: z.string().optional(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  googleRefreshToken: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleMyBusinessId: z.string().optional(),
  linkedinClientId: z.string().optional(),
  linkedinClientSecret: z.string().optional(),
  linkedinPageId: z.string().optional(),
  tiktokClientKey: z.string().optional(),
  tiktokClientSecret: z.string().optional(),
  tiktokAdvertiserId: z.string().optional(),
  settings: z.any().optional(),
});

// Analytics Integration Schema
const analyticsIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  ga4MeasurementId: z.string().optional(),
  ga4ApiSecret: z.string().optional(),
  gtmContainerId: z.string().optional(),
  gaTrackingId: z.string().optional(),
  mixpanelToken: z.string().optional(),
  hotjarSiteId: z.string().optional(),
  clarityProjectId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  facebookAccessToken: z.string().optional(),
  customTrackingCode: z.string().optional(),
  trackingEvents: z.any().optional(),
  requireConsent: z.boolean().default(true),
  consentCategories: z.array(z.string()).default(["analytics"]),
  settings: z.any().optional(),
});

// Booking Integration Schema
const bookingIntegrationSchema = z.object({
  provider: z.string(),
  isActive: z.boolean(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  googleRefreshToken: z.string().optional(),
  googleCalendarId: z.string().optional(),
  outlookClientId: z.string().optional(),
  outlookClientSecret: z.string().optional(),
  outlookTenantId: z.string().optional(),
  outlookRefreshToken: z.string().optional(),
  appleCalendarUrl: z.string().optional(),
  appleCalendarUsername: z.string().optional(),
  appleCalendarPassword: z.string().optional(),
  zoomApiKey: z.string().optional(),
  zoomApiSecret: z.string().optional(),
  zoomAccountId: z.string().optional(),
  zoomWebhookToken: z.string().optional(),
  meetClientId: z.string().optional(),
  meetClientSecret: z.string().optional(),
  meetRefreshToken: z.string().optional(),
  syncEnabled: z.boolean().default(false),
  syncFrequency: z.number().default(15),
  autoCreateMeeting: z.boolean().default(false),
  defaultEventDuration: z.number().default(60),
  bufferTime: z.number().default(15),
  reminderSettings: z.any().optional(),
  settings: z.any().optional(),
});

export const systemSettingsRouter = router({
  // Public procedures
  getPublic: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const siteSettings = await ctx.prisma.siteSettings.findFirst();
      
      if (!siteSettings) {
        return null;
      }

      const publicKeys = [
        "siteName",
        "description", 
        "contactEmail",
        "contactPhone",
        "businessHours",
        "instagramUrl",
        "facebookUrl",
        "twitterUrl",
        "linkedinUrl",
        "youtubeUrl",
        "timezone",
        "currency",
        "language",
        "metaTitle",
        "metaDescription",
        "metaKeywords",
        "favicon",
        "logo",
        "primaryColor",
        "secondaryColor",
        "accentColor",
        "privacyPolicyUrl",
        "termsOfServiceUrl",
        "cookiePolicyUrl",
        "callbackUrl",
      ];

      if (!publicKeys.includes(input.key)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu ayara erişim izniniz yok",
        });
      }

      return (siteSettings as any)[input.key];
    }),

  getSiteSettings: publicProcedure.query(async ({ ctx }) => {
    const siteSettings = await ctx.prisma.siteSettings.findFirst();
    
    if (!siteSettings) {
      // Varsayılan değerlerle yeni kayıt oluştur
      return await ctx.prisma.siteSettings.create({
        data: {
          siteName: "Fotomandalin",
          siteUrl: "https://fotomandalin.com",
          description: "Profesyonel Fotoğrafçılık Hizmetleri",
          timezone: "Europe/Istanbul",
          currency: "TRY",
          language: "tr",
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#f59e0b",
          maintenanceMode: false,
          registrationOpen: true,
          bookingEnabled: true,
          reviewsEnabled: true,
          portfolioEnabled: true,
        },
      });
    }

    return siteSettings;
  }),

  // Admin procedures
  updateSiteSettings: adminProcedure
    .input(siteSettingsSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const existingSettings = await ctx.prisma.siteSettings.findFirst();

      if (existingSettings) {
        return await ctx.prisma.siteSettings.update({
          where: { id: existingSettings.id },
          data: input,
        });
      } else {
        return await ctx.prisma.siteSettings.create({
          data: {
            siteName: "Fotomandalin",
            siteUrl: "https://fotomandalin.com",
            description: "Profesyonel Fotoğrafçılık Hizmetleri",
            timezone: "Europe/Istanbul",
            currency: "TRY",
            language: "tr",
            primaryColor: "#000000",
            secondaryColor: "#ffffff",
            accentColor: "#f59e0b",
            maintenanceMode: false,
            registrationOpen: true,
            bookingEnabled: true,
            reviewsEnabled: true,
            portfolioEnabled: true,
            ...input,
          },
        });
      }
    }),

  // Payment Integration CRUD
  getPaymentIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.paymentIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updatePaymentIntegration: adminProcedure
    .input(paymentIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.paymentIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.paymentIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // Email Integration CRUD
  getEmailIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.emailIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updateEmailIntegration: adminProcedure
    .input(emailIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.emailIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.emailIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // SMS Integration CRUD  
  getSmsIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.smsIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updateSmsIntegration: adminProcedure
    .input(smsIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.smsIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.smsIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // Storage Integration CRUD
  getStorageIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.storageIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updateStorageIntegration: adminProcedure
    .input(storageIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.storageIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.storageIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // Social Integration CRUD
  getSocialIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.socialIntegration.findMany({
      orderBy: { platform: "asc" },
    });
  }),

  updateSocialIntegration: adminProcedure
    .input(socialIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.socialIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.socialIntegration.upsert({
          where: { platform: data.platform },
          update: data,
          create: data,
        });
      }
    }),

  // Analytics Integration CRUD
  getAnalyticsIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.analyticsIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updateAnalyticsIntegration: adminProcedure
    .input(analyticsIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.analyticsIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.analyticsIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // Booking Integration CRUD
  getBookingIntegrations: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.bookingIntegration.findMany({
      orderBy: { provider: "asc" },
    });
  }),

  updateBookingIntegration: adminProcedure
    .input(bookingIntegrationSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return await ctx.prisma.bookingIntegration.update({
          where: { id },
          data,
        });
      } else {
        return await ctx.prisma.bookingIntegration.upsert({
          where: { provider: data.provider },
          update: data,
          create: data,
        });
      }
    }),

  // Booking Settings CRUD
  getBookingSettings: adminProcedure.query(async ({ ctx }) => {
    // Tek bir booking settings kaydı olacak
    let settings = await ctx.prisma.bookingSettings.findFirst();
    
    if (!settings) {
      // Eğer yoksa varsayılan değerlerle oluştur
      settings = await ctx.prisma.bookingSettings.create({
        data: {
          googleCalendarEnabled: false,
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
    }
    
    return settings;
  }),

  // Public Booking Settings
  getPublicBookingSettings: publicProcedure.query(async ({ ctx }) => {
    // Public için gerekli olan booking settings'leri döndür
    let settings = await ctx.prisma.bookingSettings.findFirst();
    
    if (!settings) {
      // Eğer yoksa varsayılan değerlerle oluştur
      settings = await ctx.prisma.bookingSettings.create({
        data: {
          googleCalendarEnabled: false,
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
    }
    
    // Sadece public bilgileri döndür (API key'leri vs gizle)
    return {
      minimumBookingHours: settings.minimumBookingHours,
      maximumAdvanceBookingDays: settings.maximumAdvanceBookingDays,
      workingHoursStart: settings.workingHoursStart,
      workingHoursEnd: settings.workingHoursEnd,
      autoConfirmBookings: settings.autoConfirmBookings,
      bufferTimeBefore: settings.bufferTimeBefore,
      bufferTimeAfter: settings.bufferTimeAfter,
      cancellationHours: settings.cancellationHours,
    };
  }),

  updateBookingSettings: adminProcedure
    .input(bookingSettingsSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Mevcut kaydı bul
      let settings = await ctx.prisma.bookingSettings.findFirst();

      if (settings) {
        // Güncelle
        return await ctx.prisma.bookingSettings.update({
          where: { id: settings.id },
          data,
        });
      } else {
        // Oluştur
        return await ctx.prisma.bookingSettings.create({
          data,
        });
      }
    }),
});
