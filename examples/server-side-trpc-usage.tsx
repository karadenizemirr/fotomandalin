// ✅ Server-Side tRPC Kullanım Örnekleri

import { serverClient } from "@/server/trpc/serverClient";

// 1. PORTFOLIO VERİLERİNİ ÇEKME
export async function getPortfolioData() {
  const client = await serverClient();

  try {
    // Öne çıkan portfolyolar
    const featured = await client.portfolio.list({
      featured: true,
      limit: 8,
      sortBy: "eventDate",
      sortOrder: "desc"
    });

    // Belirli bir tag'e göre portfolyolar
    const weddingPortfolios = await client.portfolio.list({
      tag: "düğün",
      limit: 12
    });

    return { featured, weddingPortfolios };
  } catch (error) {
    console.error('Portfolio veri çekme hatası:', error);
    return null;
  }
}

// 2. REZERVASYON VERİLERİNİ ÇEKME
export async function getBookingData() {
  const client = await serverClient();

  try {
    // Müsait tarihleri çekme
    const availableDates = await client.booking.getAvailableDates({
      year: 2025,
      month: 1
    });

    // Paket bilgilerini çekme
    const packages = await client.package.list({
      isActive: true
    });

    return { availableDates, packages };
  } catch (error) {
    console.error('Booking veri çekme hatası:', error);
    return null;
  }
}

// 3. SİSTEM AYARLARINI ÇEKME
export async function getSystemSettings() {
  const client = await serverClient();

  try {
    const settings = await client.systemSettings.get();

    return settings;
  } catch (error) {
    console.error('Sistem ayarları çekme hatası:', error);
    return null;
  }
}

// 4. DUYURULARI ÇEKME
export async function getAnnouncements() {
  const client = await serverClient();

  try {
    const announcements = await client.announcement.getPublic();

    return announcements;
  } catch (error) {
    console.error('Duyuru çekme hatası:', error);
    return null;
  }
}

// 5. ÖRNEK SERVER COMPONENT KULLANIMI
export default async function ExamplePage() {
  // Paralel veri çekme
  const [portfolioData, bookingData, settings, announcements] = await Promise.all([
    getPortfolioData(),
    getBookingData(),
    getSystemSettings(),
    getAnnouncements()
  ]);

  return (
    <div>
      <h1>Server-Side Veri Örnekleri</h1>

      {portfolioData?.featured && (
        <section>
          <h2>Öne Çıkan Portfolyolar</h2>
          {portfolioData.featured.items.map(portfolio => (
            <div key={portfolio.id}>
              <h3>{portfolio.title}</h3>
              <p>{portfolio.description}</p>
            </div>
          ))}
        </section>
      )}

      {announcements && (
        <section>
          <h2>Duyurular</h2>
          {announcements.map(announcement => (
            <div key={announcement.id}>
              <h3>{announcement.title}</h3>
              <p>{announcement.content}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
