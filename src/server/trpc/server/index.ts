import { cache } from "react";
import { z } from "zod";
import { serverClient } from "../serverClient";
import serializeDecimalFields from "@/utils/serializeDecimalFields";
import {announcementListSchema, portfolioListSchema, serviceCategoryListSchema } from "@/types/serverTypes";

/**
 * 🎯 MERKEZI SERVER DATA OPERATIONS
 * Tüm server-side tRPC fetch işlemleri için merkezi yapı
 * Her yerde kullanılabilir, cache'li ve type-safe
 *
 * @author Rezervasyon Sistemi Geliştirme Uzmanı
 * @version 1.0.0
 */

/**
 * ✨ Hizmet kategorilerini getir
 * Homepage ve kategori sayfaları için optimize
 */
export const getServiceCategories = cache(async (options?: z.infer<typeof serviceCategoryListSchema>) => {
  try {
    const validatedInput = serviceCategoryListSchema.parse(options || {});
    const client = await serverClient();

    const rawData = await client.serviceCategory.list(validatedInput);
    return serializeDecimalFields(rawData);
  } catch (error) {
    console.error('❌ Hizmet kategorileri çekme hatası:', error);
    return null;
  }
});

// 🎯 PORTFOLIO OPERATIONS

/**
 * 📋 Portfolio listesi getir
 * Homepage ve portfolio sayfaları için
 */
export const getPortfolios = cache(async (options?: z.infer<typeof portfolioListSchema>) => {
  try {
    const validatedInput = portfolioListSchema.parse(options || {});
    const client = await serverClient();

    const rawData = await client.portfolio.list(validatedInput);
    return serializeDecimalFields(rawData);
  } catch (error) {
    console.error('❌ Portfolio listesi çekme hatası:', error);
    return null;
  }
});

/**
 * ✨ Öne çıkan portfolyoları getir
 * Homepage için özel optimize
 */
export const getFeaturedPortfolios = cache(async (limit: number = 4) => {
  return await getPortfolios({
    featured: true,
    limit,
    sortBy: "eventDate",
    sortOrder: "desc"
  });
});

// 🎯 ANNOUNCEMENT OPERATIONS

/**
 * 📢 Aktif duyuruları getir
 * Homepage ve genel sayfalar için
 */
export const getAnnouncements = cache(async (options?: z.infer<typeof announcementListSchema>) => {
  try {
    const validatedInput = announcementListSchema.parse(options || {});
    const client = await serverClient();

    const rawData = await client.announcement.getActive(validatedInput);
    return serializeDecimalFields(rawData);
  } catch (error) {
    console.error('❌ Duyurular çekme hatası:', error);
    return null;
  }
});


/**
 * 📦 Homepage için tüm verileri tek seferde çek
 * Paralel çekme ile performans optimizasyonu
 */
export const getHomepageData = cache(async () => {
  try {
    console.log('🚀 Homepage veri çekme işlemi başladı...');

    // Paralel veri çekme - çok daha hızlı!
    const [categoriesData, portfolioData, announcementsData] = await Promise.all([
      getServiceCategories({
        includeInactive: false,
        limit: 8
      }),
      getFeaturedPortfolios(4),
      getAnnouncements({
        page: "/",
        role: "CUSTOMER"
      }),
    ]);

    console.log('✅ Homepage veri çekme başarılı!');
    console.log('📋 Kategori sayısı:', categoriesData?.items?.length || 0);
    console.log('🖼️ Portfolio sayısı:', portfolioData?.items?.length || 0);
    console.log('📢 Duyuru sayısı:', announcementsData?.length || 0);

    return {
      categories: categoriesData,
      portfolios: portfolioData,
      announcements: announcementsData,
      meta: {
        fetchedAt: new Date().toISOString(),
        success: true,
      }
    };
  } catch (error) {
    console.error('❌ Homepage veri çekme hatası:', error);

    return {
      categories: null,
      portfolios: null,
      announcements: null,
      systemSettings: null,
      meta: {
        fetchedAt: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }
    };
  }
});

/**
 * 📋 Portfolio sayfası için verileri çek
 * Filtreli portfolio listesi ile
 */
export const getPortfolioPageData = cache(async (filters?: {
  category?: string;
  tag?: string;
  featured?: boolean;
  limit?: number;
}) => {
  try {
    const [portfolios, categories, announcements] = await Promise.all([
      getPortfolios({
        limit: filters?.limit || 20,
        featured: filters?.featured,
        tag: filters?.tag,
        sortBy: "eventDate",
        sortOrder: "desc"
      }),
      getServiceCategories(),
      getAnnouncements({ page: "/portfolio", role: "CUSTOMER" })
    ]);

    return {
      portfolios,
      categories,
      announcements,
      filters,
      meta: {
        fetchedAt: new Date().toISOString(),
        success: true,
      }
    };
  } catch (error) {
    console.error('❌ Portfolio sayfa verisi çekme hatası:', error);

    return {
      portfolios: null,
      categories: null,
      announcements: null,
      filters,
      meta: {
        fetchedAt: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }
    };
  }
});
