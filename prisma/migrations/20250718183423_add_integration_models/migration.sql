-- CreateTable
CREATE TABLE "payment_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "iyzicoApiKey" TEXT,
    "iyzicoSecretKey" TEXT,
    "iyzicoBaseUrl" TEXT,
    "stripePublishableKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "paytrMerchantId" TEXT,
    "paytrMerchantKey" TEXT,
    "paytrMerchantSalt" TEXT,
    "payuMerchantId" TEXT,
    "payuSecretKey" TEXT,
    "callbackUrl" TEXT,
    "webhookUrl" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "sendgridApiKey" TEXT,
    "mailgunApiKey" TEXT,
    "mailgunDomain" TEXT,
    "mailgunRegion" TEXT DEFAULT 'us',
    "sesAccessKey" TEXT,
    "sesSecretKey" TEXT,
    "sesRegion" TEXT DEFAULT 'us-east-1',
    "resendApiKey" TEXT,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "replyTo" TEXT,
    "templates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "netgsmApiKey" TEXT,
    "netgsmHeader" TEXT,
    "twilioAccountSid" TEXT,
    "twilioAuthToken" TEXT,
    "twilioFromNumber" TEXT,
    "vonageApiKey" TEXT,
    "vonageApiSecret" TEXT,
    "vonageFromName" TEXT,
    "imerkeziApiKey" TEXT,
    "imerkeziSender" TEXT,
    "mutlucellApiKey" TEXT,
    "mutlucellSender" TEXT,
    "defaultSender" TEXT,
    "encoding" TEXT DEFAULT 'UTF-8',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_integrations" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "instagramAccessToken" TEXT,
    "instagramBusinessId" TEXT,
    "instagramRefreshToken" TEXT,
    "instagramAppId" TEXT,
    "instagramAppSecret" TEXT,
    "facebookAppId" TEXT,
    "facebookAppSecret" TEXT,
    "facebookPageId" TEXT,
    "facebookAccessToken" TEXT,
    "whatsappToken" TEXT,
    "whatsappNumberId" TEXT,
    "whatsappWebhookUrl" TEXT,
    "whatsappVerifyToken" TEXT,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "googleRefreshToken" TEXT,
    "googleAnalyticsId" TEXT,
    "googleMyBusinessId" TEXT,
    "linkedinClientId" TEXT,
    "linkedinClientSecret" TEXT,
    "linkedinPageId" TEXT,
    "tiktokClientKey" TEXT,
    "tiktokClientSecret" TEXT,
    "tiktokAdvertiserId" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "awsAccessKeyId" TEXT,
    "awsSecretAccessKey" TEXT,
    "awsRegion" TEXT,
    "awsS3BucketName" TEXT,
    "awsCloudFrontUrl" TEXT,
    "cloudinaryCloudName" TEXT,
    "cloudinaryApiKey" TEXT,
    "cloudinaryApiSecret" TEXT,
    "azureAccountName" TEXT,
    "azureAccountKey" TEXT,
    "azureContainerName" TEXT,
    "azureEndpoint" TEXT,
    "gcsProjectId" TEXT,
    "gcsPrivateKey" TEXT,
    "gcsClientEmail" TEXT,
    "gcsBucketName" TEXT,
    "doAccessKey" TEXT,
    "doSecretKey" TEXT,
    "doRegion" TEXT,
    "doBucketName" TEXT,
    "doEndpoint" TEXT,
    "cdnUrl" TEXT,
    "uploadPath" TEXT DEFAULT '/uploads',
    "maxFileSize" INTEGER DEFAULT 10485760,
    "allowedTypes" TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[],
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "ga4MeasurementId" TEXT,
    "ga4ApiSecret" TEXT,
    "gtmContainerId" TEXT,
    "gaTrackingId" TEXT,
    "mixpanelToken" TEXT,
    "hotjarSiteId" TEXT,
    "clarityProjectId" TEXT,
    "facebookPixelId" TEXT,
    "facebookAccessToken" TEXT,
    "customTrackingCode" TEXT,
    "trackingEvents" JSONB,
    "requireConsent" BOOLEAN NOT NULL DEFAULT true,
    "consentCategories" TEXT[] DEFAULT ARRAY['analytics']::TEXT[],
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "googleRefreshToken" TEXT,
    "googleCalendarId" TEXT,
    "outlookClientId" TEXT,
    "outlookClientSecret" TEXT,
    "outlookTenantId" TEXT,
    "outlookRefreshToken" TEXT,
    "appleCalendarUrl" TEXT,
    "appleCalendarUsername" TEXT,
    "appleCalendarPassword" TEXT,
    "zoomApiKey" TEXT,
    "zoomApiSecret" TEXT,
    "zoomAccountId" TEXT,
    "zoomWebhookToken" TEXT,
    "meetClientId" TEXT,
    "meetClientSecret" TEXT,
    "meetRefreshToken" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncFrequency" INTEGER DEFAULT 15,
    "lastSyncAt" TIMESTAMP(3),
    "autoCreateMeeting" BOOLEAN NOT NULL DEFAULT false,
    "defaultEventDuration" INTEGER DEFAULT 60,
    "bufferTime" INTEGER DEFAULT 15,
    "reminderSettings" JSONB,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Fotomandalin',
    "siteUrl" TEXT NOT NULL DEFAULT 'https://fotomandalin.com',
    "description" TEXT NOT NULL DEFAULT 'Profesyonel Fotoğrafçılık Hizmetleri',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "businessHours" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "language" TEXT NOT NULL DEFAULT 'tr',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "favicon" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reviewsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "portfolioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "privacyPolicyUrl" TEXT,
    "termsOfServiceUrl" TEXT,
    "cookiePolicyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_integrations_provider_key" ON "payment_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "email_integrations_provider_key" ON "email_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "sms_integrations_provider_key" ON "sms_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "social_integrations_platform_key" ON "social_integrations"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "storage_integrations_provider_key" ON "storage_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_integrations_provider_key" ON "analytics_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "booking_integrations_provider_key" ON "booking_integrations"("provider");
