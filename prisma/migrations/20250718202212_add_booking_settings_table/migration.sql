-- CreateTable
CREATE TABLE "booking_settings" (
    "id" TEXT NOT NULL,
    "googleCalendarApiKey" TEXT,
    "googleCalendarId" TEXT,
    "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "outlookClientId" TEXT,
    "outlookClientSecret" TEXT,
    "outlookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minimumBookingHours" INTEGER NOT NULL DEFAULT 2,
    "maximumAdvanceBookingDays" INTEGER NOT NULL DEFAULT 90,
    "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "autoConfirmBookings" BOOLEAN NOT NULL DEFAULT false,
    "sendReminders" BOOLEAN NOT NULL DEFAULT true,
    "bufferTimeBefore" INTEGER NOT NULL DEFAULT 30,
    "bufferTimeAfter" INTEGER NOT NULL DEFAULT 30,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id")
);
