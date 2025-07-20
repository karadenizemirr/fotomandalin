/**
 * Decimal Type Utilities for TRPC Cache System
 * Prisma Decimal tiplerini TypeScript ve React component'ları için güvenli hale getirir
 */

import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Decimal değerini güvenli bir şekilde string'e çevirir
 * @param value - Decimal, string, number veya null/undefined değer
 * @param decimals - Ondalık basamak sayısı (default: 2)
 * @returns Formatlanmış string değer
 */
export function formatDecimal(
  value: Decimal | string | number | null | undefined,
  decimals: number = 2
): string {
  if (!value) return "0";

  try {
    if (typeof value === "string" || typeof value === "number") {
      return parseFloat(value.toString()).toFixed(decimals);
    }

    // Prisma Decimal type
    return parseFloat(value.toString()).toFixed(decimals);
  } catch (error) {
    console.warn("formatDecimal error:", error);
    return "0";
  }
}

/**
 * Decimal değerini number tipine güvenli bir şekilde çevirir
 * @param value - Decimal, string, number veya null/undefined değer
 * @returns Number değer
 */
export function decimalToNumber(
  value: Decimal | string | number | null | undefined
): number {
  if (!value) return 0;

  try {
    if (typeof value === "number") return value;
    return parseFloat(value.toString());
  } catch (error) {
    console.warn("decimalToNumber error:", error);
    return 0;
  }
}

/**
 * Fiyat formatlaması için özel fonksiyon (Türk Lirası formatı)
 * @param value - Decimal, string, number veya null/undefined değer
 * @param currency - Para birimi (default: "TRY")
 * @returns Formatlanmış fiyat string'i
 */
export function formatPrice(
  value: Decimal | string | number | null | undefined,
  currency: string = "TRY"
): string {
  const numericValue = decimalToNumber(value);

  if (currency === "TRY") {
    return `₺${numericValue.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${numericValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * TRPC verilerini DataTable için transform eden generic fonksiyon
 * @param items - TRPC'den gelen item array'i
 * @param priceFields - Decimal olan field'ların adları
 * @returns Transform edilmiş data
 */
export function transformDecimalData<T extends Record<string, any>>(
  items: T[],
  priceFields: string[] = ["price", "basePrice", "discountPrice", "totalPrice"]
): T[] {
  return items.map(item => {
    const transformedItem:any = { ...item };

    // Her price field'ı için transform işlemi yap
    priceFields.forEach(field => {
      if (transformedItem[field] !== undefined && transformedItem[field] !== null) {
        transformedItem[field] = formatDecimal(transformedItem[field]);
      }
    });

    // Nested objects için özel durumlar (addOns, packages vs.)
    if (transformedItem.addOns && Array.isArray(transformedItem.addOns)) {
      transformedItem.addOns = transformedItem.addOns.map((addOn: any) => ({
        ...addOn,
        addOn: addOn.addOn ? {
          ...addOn.addOn,
          price: formatDecimal(addOn.addOn.price)
        } : addOn.addOn
      }));
    }

    return transformedItem;
  });
}

/**
 * Package verisi için özel transform fonksiyonu
 * @param items - Package items
 * @returns Transform edilmiş package data
 */
export function transformPackageData(items: any[]): any[] {
  return transformDecimalData(items, ["basePrice", "discountPrice"]);
}

/**
 * AddOn verisi için özel transform fonksiyonu
 * @param items - AddOn items
 * @returns Transform edilmiş addOn data
 */
export function transformAddOnData(items: any[]): any[] {
  return transformDecimalData(items, ["price"]);
}

/**
 * Booking verisi için özel transform fonksiyonu
 * @param items - Booking items
 * @returns Transform edilmiş booking data
 */
export function transformBookingData(items: any[]): any[] {
  return transformDecimalData(items, ["totalAmount", "paidAmount", "remainingAmount"]);
}

/**
 * Payment verisi için özel transform fonksiyonu
 * @param items - Payment items
 * @returns Transform edilmiş payment data
 */
export function transformPaymentData(items: any[]): any[] {
  return transformDecimalData(items, ["amount", "fee"]);
}

/**
 * Review/Rating verisi için transform fonksiyonu
 * @param items - Review items with rating
 * @returns Transform edilmiş review data
 */
export function transformReviewData(items: any[]): any[] {
  return items.map(item => ({
    ...item,
    rating: decimalToNumber(item.rating)
  }));
}

/**
 * Statistics verisi için transform fonksiyonu
 * @param stats - Stats object with Decimal values
 * @returns Transform edilmiş stats
 */
export function transformStatsData(stats: any): any {
  if (!stats) return stats;

  return {
    ...stats,
    averagePrice: decimalToNumber(stats.averagePrice),
    totalRevenue: decimalToNumber(stats.totalRevenue),
    averageOrderValue: decimalToNumber(stats.averageOrderValue),
    averageRating: decimalToNumber(stats.averageRating),
  };
}

/**
 * Form değerlerini API'ye göndermeden önce hazırlayan fonksiyon
 * @param formData - Form'dan gelen data
 * @param priceFields - Decimal olarak gönderilecek field'lar
 * @returns API'ye uygun format
 */
export function prepareFormDataForAPI(
  formData: any,
  priceFields: string[] = ["price", "basePrice", "discountPrice"]
): any {
  const prepared = { ...formData };

  priceFields.forEach(field => {
    if (prepared[field] !== undefined && prepared[field] !== null) {
      // String'i number'a çevir
      prepared[field] = decimalToNumber(prepared[field]);
    }
  });

  return prepared;
}
