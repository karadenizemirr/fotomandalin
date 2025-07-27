import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fotomandalin.com'
  
  // Ana sayfalar
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/calismalarimiz`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hizmetlerimiz`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
        {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
        {
      url: `${baseUrl}/rezervasyon`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/giris-yap`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kayit-ol`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // TODO: Dinamik sayfa URL'leri buraya eklenebilir
  // Örneğin: paketler, blog yazıları, galeri kategorileri
  // const dynamicPages = await getDynamicPages()

  return staticPages
}

// Dinamik sayfalar için yardımcı fonksiyon
// async function getDynamicPages() {
//   try {
//     // Veritabanından paket listesi
//     const packages = await prisma.package.findMany({
//       where: { isActive: true },
//       select: { id: true, slug: true, updatedAt: true }
//     })

//     const packagePages = packages.map(pkg => ({
//       url: `https://fotomandalin.com/packages/${pkg.slug || pkg.id}`,
//       lastModified: pkg.updatedAt,
//       changeFrequency: 'weekly' as const,
//       priority: 0.8,
//     }))

//     return packagePages
//   } catch (error) {
//     console.error('Sitemap generation error:', error)
//     return []
//   }
// }
