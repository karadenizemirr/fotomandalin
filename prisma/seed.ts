import { PrismaClient, UserRole, BookingStatus, PaymentStatus, PaymentMethod, BookingTimelineAction, AnnouncementType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // =========================================================================
  // 1. Create Users
  // =========================================================================
  console.log('Creating users...');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fotomandalin.com' },
    update: {},
    create: {
      email: 'admin@fotomandalin.com',
      name: 'Admin User',
      password: await hash('Admin123!', 10),
      role: UserRole.ADMIN,
      phone: '+905551234567',
      emailVerified: new Date(),
    },
  });

  const photographerUser = await prisma.user.upsert({
    where: { email: 'photographer@fotomandalin.com' },
    update: {},
    create: {
      email: 'photographer@fotomandalin.com',
      name: 'Ahmet Fotoğrafçı',
      password: await hash('Photo123!', 10),
      role: UserRole.PHOTOGRAPHER,
      phone: '+905552345678',
      emailVerified: new Date(),
    },
  });

  const customerUser1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      name: 'Ayşe Müşteri',
      password: await hash('Customer123!', 10),
      role: UserRole.CUSTOMER,
      phone: '+905553456789',
      emailVerified: new Date(),
    },
  });

  const customerUser2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      name: 'Mehmet Yılmaz',
      password: await hash('Customer123!', 10),
      role: UserRole.CUSTOMER,
      phone: '+905554567890',
      emailVerified: new Date(),
    },
  });

  // =========================================================================
  // 2. Create Accounts (NextAuth)
  // =========================================================================
  console.log('Creating accounts...');
  
  await prisma.account.upsert({
    where: { 
      provider_providerAccountId: {
        provider: 'credentials',
        providerAccountId: 'admin@fotomandalin.com',
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: 'admin@fotomandalin.com',
    },
  });

  await prisma.account.upsert({
    where: { 
      provider_providerAccountId: {
        provider: 'google',
        providerAccountId: '123456789',
      }
    },
    update: {},
    create: {
      userId: customerUser1.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: '123456789',
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      scope: 'email profile',
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  });

  // =========================================================================
  // 3. Create Sessions
  // =========================================================================
  console.log('Creating sessions...');
  
  await prisma.session.upsert({
    where: { sessionToken: 'mock-session-token-1' },
    update: {},
    create: {
      sessionToken: 'mock-session-token-1',
      userId: adminUser.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  await prisma.session.upsert({
    where: { sessionToken: 'mock-session-token-2' },
    update: {},
    create: {
      sessionToken: 'mock-session-token-2',
      userId: customerUser1.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // =========================================================================
  // 4. Create Verification Tokens
  // =========================================================================
  console.log('Creating verification tokens...');
  
  await prisma.verificationToken.upsert({
    where: { 
      identifier_token: {
        identifier: 'customer2@example.com',
        token: 'verification-token-1',
      }
    },
    update: {},
    create: {
      identifier: 'customer2@example.com',
      token: 'verification-token-1',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  await prisma.verificationToken.upsert({
    where: { 
      identifier_token: {
        identifier: 'new-user@example.com',
        token: 'verification-token-2',
      }
    },
    update: {},
    create: {
      identifier: 'new-user@example.com',
      token: 'verification-token-2',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // =========================================================================
  // 5. Create Service Categories
  // =========================================================================
  console.log('Creating service categories...');
  
  const weddingCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'dugun-fotografciligi' },
    update: {},
    create: {
      name: 'Düğün Fotoğrafçılığı',
      slug: 'dugun-fotografciligi',
      description: 'Özel gününüzü ölümsüzleştiren profesyonel düğün fotoğrafçılığı hizmetleri.',
      image: '/images/categories/wedding.jpg',
      icon: 'wedding-ring',
      isActive: true,
      sortOrder: 1,
      metaTitle: 'Düğün Fotoğrafçılığı | Fotomandalin',
      metaDescription: 'Profesyonel düğün fotoğrafçılığı hizmetleri ile özel gününüzü ölümsüzleştirin.',
    },
  });

  const engagementCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'nisan-fotografciligi' },
    update: {},
    create: {
      name: 'Nişan Fotoğrafçılığı',
      slug: 'nisan-fotografciligi',
      description: 'Nişan töreninizi ve romantik anlarınızı ölümsüzleştiren fotoğrafçılık hizmetleri.',
      image: '/images/categories/engagement.jpg',
      icon: 'ring',
      isActive: true,
      sortOrder: 2,
      metaTitle: 'Nişan Fotoğrafçılığı | Fotomandalin',
      metaDescription: 'Nişan töreninizi ve romantik anlarınızı ölümsüzleştiren profesyonel fotoğrafçılık hizmetleri.',
    },
  });

  const familyCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'aile-fotografciligi' },
    update: {},
    create: {
      name: 'Aile Fotoğrafçılığı',
      slug: 'aile-fotografciligi',
      description: 'Ailenizle birlikte özel anlarınızı ölümsüzleştiren fotoğrafçılık hizmetleri.',
      image: '/images/categories/family.jpg',
      icon: 'family',
      isActive: true,
      sortOrder: 3,
      metaTitle: 'Aile Fotoğrafçılığı | Fotomandalin',
      metaDescription: 'Ailenizle birlikte özel anlarınızı ölümsüzleştiren profesyonel fotoğrafçılık hizmetleri.',
    },
  });

  // =========================================================================
  // 6. Create Packages
  // =========================================================================
  console.log('Creating packages...');
  
  const weddingBasicPackage = await prisma.package.upsert({
    where: { slug: 'temel-dugun-paketi' },
    update: {},
    create: {
      name: 'Temel Düğün Paketi',
      slug: 'temel-dugun-paketi',
      description: 'Düğününüz için temel fotoğrafçılık hizmetleri içeren ekonomik paket.',
      shortDesc: '4 saatlik çekim, 100 düzenlenmiş fotoğraf',
      basePrice: 3500,
      discountPrice: 2999,
      durationInMinutes: 240, // 4 saat
      photoCount: 100,
      videoIncluded: false,
      albumIncluded: false,
      features: JSON.stringify([
        'Nikah töreni çekimi',
        'Düğün salonu çekimi',
        'Profesyonel fotoğraf düzenleme',
        'Çevrimiçi fotoğraf galerisi',
      ]),
      images: ['/images/packages/wedding-basic-1.jpg', '/images/packages/wedding-basic-2.jpg'],
      coverImage: '/images/packages/wedding-basic-cover.jpg',
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      categoryId: weddingCategory.id,
    },
  });

  const weddingPremiumPackage = await prisma.package.upsert({
    where: { slug: 'premium-dugun-paketi' },
    update: {},
    create: {
      name: 'Premium Düğün Paketi',
      slug: 'premium-dugun-paketi',
      description: 'Düğününüz için tam kapsamlı premium fotoğrafçılık ve video hizmetleri.',
      shortDesc: '8 saatlik çekim, 300 düzenlenmiş fotoğraf, video',
      basePrice: 7500,
      discountPrice: 6500,
      durationInMinutes: 480, // 8 saat
      photoCount: 300,
      videoIncluded: true,
      albumIncluded: true,
      features: JSON.stringify([
        'Hazırlık çekimleri',
        'Nikah töreni çekimi',
        'Düğün salonu çekimi',
        'Profesyonel fotoğraf düzenleme',
        'Çevrimiçi fotoğraf galerisi',
        '5 dakikalık highlight video',
        'Lüks fotoğraf albümü',
      ]),
      images: ['/images/packages/wedding-premium-1.jpg', '/images/packages/wedding-premium-2.jpg'],
      coverImage: '/images/packages/wedding-premium-cover.jpg',
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      categoryId: weddingCategory.id,
    },
  });

  const engagementPackage = await prisma.package.upsert({
    where: { slug: 'nisan-paketi' },
    update: {},
    create: {
      name: 'Nişan Paketi',
      slug: 'nisan-paketi',
      description: 'Nişan töreniniz için özel fotoğrafçılık hizmetleri.',
      shortDesc: '3 saatlik çekim, 80 düzenlenmiş fotoğraf',
      basePrice: 2500,
      durationInMinutes: 180, // 3 saat
      photoCount: 80,
      videoIncluded: false,
      albumIncluded: false,
      features: JSON.stringify([
        'Nişan töreni çekimi',
        'Profesyonel fotoğraf düzenleme',
        'Çevrimiçi fotoğraf galerisi',
      ]),
      images: ['/images/packages/engagement-1.jpg', '/images/packages/engagement-2.jpg'],
      coverImage: '/images/packages/engagement-cover.jpg',
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      categoryId: engagementCategory.id,
    },
  });

  const familyPackage = await prisma.package.upsert({
    where: { slug: 'aile-paketi' },
    update: {},
    create: {
      name: 'Aile Paketi',
      slug: 'aile-paketi',
      description: 'Ailenizle birlikte özel anlarınızı ölümsüzleştiren fotoğraf çekimi.',
      shortDesc: '2 saatlik çekim, 50 düzenlenmiş fotoğraf',
      basePrice: 1500,
      durationInMinutes: 120, // 2 saat
      photoCount: 50,
      videoIncluded: false,
      albumIncluded: false,
      features: JSON.stringify([
        'Stüdyo veya dış mekan çekimi',
        'Profesyonel fotoğraf düzenleme',
        'Çevrimiçi fotoğraf galerisi',
      ]),
      images: ['/images/packages/family-1.jpg', '/images/packages/family-2.jpg'],
      coverImage: '/images/packages/family-cover.jpg',
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      categoryId: familyCategory.id,
    },
  });

  // =========================================================================
  // 7. Create Add-ons
  // =========================================================================
  console.log('Creating add-ons...');
  
  const additionalHourAddon = await prisma.addOn.upsert({
    where: { id: 'addon-additional-hour' },
    update: {},
    create: {
      id: 'addon-additional-hour',
      name: 'Ek Saat',
      description: 'Çekim süresine ek 1 saat',
      price: 500,
      durationInMinutes: 60,
      isActive: true,
    },
  });

  const droneAddon = await prisma.addOn.upsert({
    where: { id: 'addon-drone' },
    update: {},
    create: {
      id: 'addon-drone',
      name: 'Drone Çekimi',
      description: 'Havadan drone ile çekim',
      price: 1000,
      isActive: true,
    },
  });

  const albumAddon = await prisma.addOn.upsert({
    where: { id: 'addon-album' },
    update: {},
    create: {
      id: 'addon-album',
      name: 'Fotoğraf Albümü',
      description: '30x30 cm lüks ciltli fotoğraf albümü',
      price: 800,
      isActive: true,
    },
  });

  const makeupAddon = await prisma.addOn.upsert({
    where: { id: 'addon-makeup' },
    update: {},
    create: {
      id: 'addon-makeup',
      name: 'Profesyonel Makyaj',
      description: 'Gelin için profesyonel makyaj hizmeti',
      price: 1200,
      isActive: true,
    },
  });

  // =========================================================================
  // 8. Create Package Add-ons
  // =========================================================================
  console.log('Creating package add-ons...');
  
  // Temel Düğün Paketi için ek hizmetler
  await prisma.packageAddOn.upsert({
    where: { 
      id: 'package-addon-basic-wedding-hour' 
    },
    update: {},
    create: {
      id: 'package-addon-basic-wedding-hour',
      packageId: weddingBasicPackage.id,
      addOnId: additionalHourAddon.id,
    },
  });

  await prisma.packageAddOn.upsert({
    where: { 
      id: 'package-addon-basic-wedding-album' 
    },
    update: {},
    create: {
      id: 'package-addon-basic-wedding-album',
      packageId: weddingBasicPackage.id,
      addOnId: albumAddon.id,
    },
  });

  // Premium Düğün Paketi için ek hizmetler
  await prisma.packageAddOn.upsert({
    where: { 
      id: 'package-addon-premium-wedding-hour' 
    },
    update: {},
    create: {
      id: 'package-addon-premium-wedding-hour',
      packageId: weddingPremiumPackage.id,
      addOnId: additionalHourAddon.id,
    },
  });

  await prisma.packageAddOn.upsert({
    where: { 
      id: 'package-addon-premium-wedding-drone' 
    },
    update: {},
    create: {
      id: 'package-addon-premium-wedding-drone',
      packageId: weddingPremiumPackage.id,
      addOnId: droneAddon.id,
    },
  });

  // Nişan Paketi için ek hizmetler
  await prisma.packageAddOn.upsert({
    where: { 
      id: 'package-addon-engagement-makeup' 
    },
    update: {},
    create: {
      id: 'package-addon-engagement-makeup',
      packageId: engagementPackage.id,
      addOnId: makeupAddon.id,
    },
  });

  // =========================================================================
  // 9. Create Locations
  // =========================================================================
  console.log('Creating locations...');
  
  const studioLocation = await prisma.location.upsert({
    where: { slug: 'fotomandalin-studio' },
    update: {},
    create: {
      name: 'Fotomandalin Stüdyo',
      slug: 'fotomandalin-studio',
      description: 'Profesyonel fotoğraf çekimleri için tam donanımlı stüdyo.',
      address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
      latitude: 40.9712,
      longitude: 29.0754,
      images: ['/images/locations/studio-1.jpg', '/images/locations/studio-2.jpg'],
      coverImage: '/images/locations/studio-cover.jpg',
      isActive: true,
      sortOrder: 1,
      maxBookingsPerDay: 5,
      workingHours: JSON.stringify({
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: null,
      }),
      blackoutDates: ['2025-01-01', '2025-05-01'],
    },
  });

  const outdoorLocation = await prisma.location.upsert({
    where: { slug: 'emirgan-korusu' },
    update: {},
    create: {
      name: 'Emirgan Korusu',
      slug: 'emirgan-korusu',
      description: 'Doğal güzelliği ile dış mekan çekimleri için ideal bir lokasyon.',
      address: 'Emirgan, Sarıyer, İstanbul',
      latitude: 41.1066,
      longitude: 29.0557,
      images: ['/images/locations/emirgan-1.jpg', '/images/locations/emirgan-2.jpg'],
      coverImage: '/images/locations/emirgan-cover.jpg',
      extraFee: 300,
      isActive: true,
      sortOrder: 2,
      maxBookingsPerDay: 3,
      workingHours: JSON.stringify({
        monday: { start: '10:00', end: '17:00' },
        tuesday: { start: '10:00', end: '17:00' },
        wednesday: { start: '10:00', end: '17:00' },
        thursday: { start: '10:00', end: '17:00' },
        friday: { start: '10:00', end: '17:00' },
        saturday: { start: '10:00', end: '17:00' },
        sunday: { start: '10:00', end: '17:00' },
      }),
      blackoutDates: ['2025-12-31'],
    },
  });

  // =========================================================================
  // 10. Create Staff
  // =========================================================================
  console.log('Creating staff...');
  
  const photographer1 = await prisma.staff.upsert({
    where: { email: 'photographer1@fotomandalin.com' },
    update: {},
    create: {
      name: 'Ali Yılmaz',
      email: 'photographer1@fotomandalin.com',
      phone: '+905551112233',
      avatar: '/images/staff/photographer1.jpg',
      title: 'Baş Fotoğrafçı',
      bio: '10 yıllık profesyonel fotoğrafçılık deneyimi ile düğün ve özel etkinlik çekimleri konusunda uzman.',
      experience: 10,
      isActive: true,
      specialties: ['Düğün', 'Portre', 'Moda'],
      workingHours: JSON.stringify({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: null,
      }),
      locationId: studioLocation.id,
    },
  });

  const photographer2 = await prisma.staff.upsert({
    where: { email: 'photographer2@fotomandalin.com' },
    update: {},
    create: {
      name: 'Zeynep Kaya',
      email: 'photographer2@fotomandalin.com',
      phone: '+905552223344',
      avatar: '/images/staff/photographer2.jpg',
      title: 'Fotoğrafçı',
      bio: 'Doğal ışık ve dış mekan çekimlerinde uzmanlaşmış, 5 yıllık deneyime sahip fotoğrafçı.',
      experience: 5,
      isActive: true,
      specialties: ['Doğa', 'Aile', 'Çocuk'],
      workingHours: JSON.stringify({
        monday: { start: '10:00', end: '18:00' },
        tuesday: { start: '10:00', end: '18:00' },
        wednesday: { start: '10:00', end: '18:00' },
        thursday: { start: '10:00', end: '18:00' },
        friday: { start: '10:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: null,
      }),
      locationId: outdoorLocation.id,
    },
  });

  // =========================================================================
  // 11. Create Staff Availability
  // =========================================================================
  console.log('Creating staff availability...');
  
  // Photographer 1 availability
  await prisma.staffAvailability.upsert({
    where: { 
      id: 'staff-avail-1'
    },
    update: {},
    create: {
      id: 'staff-avail-1',
      staffId: photographer1.id,
      date: new Date('2025-06-15'),
      startTime: new Date('2025-06-15T09:00:00Z'),
      endTime: new Date('2025-06-15T17:00:00Z'),
      isAvailable: true,
    },
  });

  await prisma.staffAvailability.upsert({
    where: { 
      id: 'staff-avail-2'
    },
    update: {},
    create: {
      id: 'staff-avail-2',
      staffId: photographer1.id,
      date: new Date('2025-06-16'),
      startTime: new Date('2025-06-16T09:00:00Z'),
      endTime: new Date('2025-06-16T17:00:00Z'),
      isAvailable: false,
      reason: 'İzin',
    },
  });

  // Photographer 2 availability
  await prisma.staffAvailability.upsert({
    where: { 
      id: 'staff-avail-3'
    },
    update: {},
    create: {
      id: 'staff-avail-3',
      staffId: photographer2.id,
      date: new Date('2025-06-15'),
      startTime: new Date('2025-06-15T10:00:00Z'),
      endTime: new Date('2025-06-15T18:00:00Z'),
      isAvailable: true,
    },
  });

  await prisma.staffAvailability.upsert({
    where: { 
      id: 'staff-avail-4'
    },
    update: {},
    create: {
      id: 'staff-avail-4',
      staffId: photographer2.id,
      date: new Date('2025-06-16'),
      startTime: new Date('2025-06-16T10:00:00Z'),
      endTime: new Date('2025-06-16T18:00:00Z'),
      isAvailable: true,
    },
  });

  // =========================================================================
  // 12. Create Bookings
  // =========================================================================
  console.log('Creating bookings...');
  
  const booking1 = await prisma.booking.upsert({
    where: { bookingCode: 'BK-2025-0001' },
    update: {},
    create: {
      bookingCode: 'BK-2025-0001',
      customerName: 'Ayşe Müşteri',
      customerEmail: 'customer1@example.com',
      customerPhone: '+905553456789',
      startTime: new Date('2025-06-15T14:00:00Z'),
      endTime: new Date('2025-06-15T18:00:00Z'),
      locationId: studioLocation.id,
      staffId: photographer1.id,
      specialNotes: 'Gelin çiçeği fotoğraflarına özel önem verilmesi rica olunur.',
      totalAmount: 3799,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      userId: customerUser1.id,
      packageId: weddingBasicPackage.id,
    },
  });

  const booking2 = await prisma.booking.upsert({
    where: { bookingCode: 'BK-2025-0002' },
    update: {},
    create: {
      bookingCode: 'BK-2025-0002',
      customerName: 'Mehmet Yılmaz',
      customerEmail: 'customer2@example.com',
      customerPhone: '+905554567890',
      startTime: new Date('2025-07-20T16:00:00Z'),
      endTime: new Date('2025-07-21T00:00:00Z'),
      locationId: outdoorLocation.id,
      staffId: photographer2.id,
      specialNotes: 'Düğün pastası kesimi sırasında özel çekim yapılması rica olunur.',
      totalAmount: 7500,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      userId: customerUser2.id,
      packageId: weddingPremiumPackage.id,
    },
  });

  // =========================================================================
  // 13. Create Booking Add-ons
  // =========================================================================
  console.log('Creating booking add-ons...');
  
  await prisma.bookingAddOn.upsert({
    where: { id: 'booking-addon-1' },
    update: {},
    create: {
      id: 'booking-addon-1',
      bookingId: booking1.id,
      addOnId: albumAddon.id,
      quantity: 1,
      price: 800,
    },
  });

  await prisma.bookingAddOn.upsert({
    where: { id: 'booking-addon-2' },
    update: {},
    create: {
      id: 'booking-addon-2',
      bookingId: booking2.id,
      addOnId: droneAddon.id,
      quantity: 1,
      price: 1000,
    },
  });

  // =========================================================================
  // 14. Create Booking Timeline
  // =========================================================================
  console.log('Creating booking timeline...');
  
  await prisma.bookingTimeline.upsert({
    where: { id: 'timeline-1-created' },
    update: {},
    create: {
      id: 'timeline-1-created',
      bookingId: booking1.id,
      action: BookingTimelineAction.CREATED,
      description: 'Rezervasyon oluşturuldu',
      createdAt: new Date('2024-12-15T10:30:00Z'),
    },
  });

  await prisma.bookingTimeline.upsert({
    where: { id: 'timeline-1-confirmed' },
    update: {},
    create: {
      id: 'timeline-1-confirmed',
      bookingId: booking1.id,
      action: BookingTimelineAction.CONFIRMED,
      description: 'Rezervasyon onaylandı',
      createdAt: new Date('2024-12-16T14:20:00Z'),
    },
  });

  await prisma.bookingTimeline.upsert({
    where: { id: 'timeline-1-payment' },
    update: {},
    create: {
      id: 'timeline-1-payment',
      bookingId: booking1.id,
      action: BookingTimelineAction.PAYMENT_RECEIVED,
      description: 'Ön ödeme alındı: 1500 TL',
      createdAt: new Date('2024-12-16T14:25:00Z'),
    },
  });

  await prisma.bookingTimeline.upsert({
    where: { id: 'timeline-2-created' },
    update: {},
    create: {
      id: 'timeline-2-created',
      bookingId: booking2.id,
      action: BookingTimelineAction.CREATED,
      description: 'Rezervasyon oluşturuldu',
      createdAt: new Date('2024-12-20T11:15:00Z'),
    },
  });

  // =========================================================================
  // 15. Create Payments
  // =========================================================================
  console.log('Creating payments...');
  
  await prisma.payment.upsert({
    where: { id: 'payment-1' },
    update: {},
    create: {
      id: 'payment-1',
      bookingId: booking1.id,
      amount: 1500,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      gatewayProvider: 'iyzico',
      gatewayPaymentId: 'iyzi-123456789',
      paidAt: new Date('2024-12-16T14:25:00Z'),
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment-2' },
    update: {},
    create: {
      id: 'payment-2',
      bookingId: booking2.id,
      amount: 2000,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PENDING,
      gatewayProvider: null,
      gatewayPaymentId: null,
    },
  });

  // =========================================================================
  // 16. Create Portfolio
  // =========================================================================
  console.log('Creating portfolio items...');
  
  await prisma.portfolio.upsert({
    where: { slug: 'ayse-mehmet-dugun' },
    update: {},
    create: {
      title: 'Ayşe & Mehmet Düğün',
      slug: 'ayse-mehmet-dugun',
      description: 'Boğaz manzaralı muhteşem bir düğün töreni.',
      coverImage: '/images/portfolio/ayse-mehmet-cover.jpg',
      images: [
        '/images/portfolio/ayse-mehmet-1.jpg',
        '/images/portfolio/ayse-mehmet-2.jpg',
        '/images/portfolio/ayse-mehmet-3.jpg',
      ],
      tags: ['düğün', 'boğaz', 'istanbul'],
      isPublished: true,
      isFeatured: true,
      eventDate: new Date('2024-05-15'),
      location: 'Hilton İstanbul Bosphorus',
      metaTitle: 'Ayşe & Mehmet Düğün Fotoğrafları | Fotomandalin',
      metaDescription: 'Boğaz manzaralı muhteşem bir düğün töreni fotoğrafları.',
    },
  });

  await prisma.portfolio.upsert({
    where: { slug: 'zeynep-can-nisan' },
    update: {},
    create: {
      title: 'Zeynep & Can Nişan',
      slug: 'zeynep-can-nisan',
      description: 'Romantik bir sonbahar nişan töreni.',
      coverImage: '/images/portfolio/zeynep-can-cover.jpg',
      images: [
        '/images/portfolio/zeynep-can-1.jpg',
        '/images/portfolio/zeynep-can-2.jpg',
      ],
      tags: ['nişan', 'sonbahar', 'romantik'],
      isPublished: true,
      isFeatured: false,
      eventDate: new Date('2024-10-10'),
      location: 'Emirgan Korusu, İstanbul',
    },
  });

  // =========================================================================
  // 17. Create Reviews
  // =========================================================================
  console.log('Creating reviews...');
  
  await prisma.review.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      rating: 5,
      title: 'Mükemmel Hizmet',
      content: 'Düğünümüzde harika fotoğraflar çektiler. Profesyonel ekip ve kaliteli hizmet için teşekkürler!',
      isPublished: true,
      isVerified: true,
      bookingId: booking1.id,
      userId: customerUser1.id,
    },
  });

  // =========================================================================
  // 18. Create System Settings
  // =========================================================================
  console.log('Creating system settings...');
  
  await prisma.systemSettings.upsert({
    where: { key: 'site_settings' },
    update: {},
    create: {
      key: 'site_settings',
      value: JSON.stringify({
        siteName: 'Fotomandalin',
        siteDescription: 'Profesyonel Fotoğrafçılık Hizmetleri',
        contactEmail: 'info@fotomandalin.com',
        contactPhone: '+90 555 123 45 67',
        address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
        socialMedia: {
          instagram: 'https://instagram.com/fotomandalin',
          facebook: 'https://facebook.com/fotomandalin',
        },
      }),
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: 'booking_settings' },
    update: {},
    create: {
      key: 'booking_settings',
      value: JSON.stringify({
        minAdvanceBookingDays: 7,
        maxAdvanceBookingDays: 365,
        depositPercentage: 30,
        cancellationPolicy: 'Rezervasyonlar 30 gün öncesine kadar ücretsiz iptal edilebilir.',
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: null, end: null },
        },
      }),
    },
  });

  // =========================================================================
  // 19. Create Audit Logs
  // =========================================================================
  console.log('Creating audit logs...');
  
  await prisma.auditLog.upsert({
    where: { id: 'audit-1' },
    update: {},
    create: {
      id: 'audit-1',
      action: 'CREATE',
      entity: 'BOOKING',
      entityId: booking1.id,
      userId: adminUser.id,
      userRole: UserRole.ADMIN,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'audit-2' },
    update: {},
    create: {
      id: 'audit-2',
      action: 'UPDATE',
      entity: 'BOOKING',
      entityId: booking1.id,
      changes: JSON.stringify({
        status: {
          from: 'PENDING',
          to: 'CONFIRMED',
        },
      }),
      userId: adminUser.id,
      userRole: UserRole.ADMIN,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  // =========================================================================
  // 11. Create Announcements
  // =========================================================================
  console.log('Creating announcements...');

  const announcements = [
    {
      title: "Yaz Kampanyası",
      message: "🌟 Yaz kampanyası! Düğün fotoğrafçılığında %25 indirim.",
      type: AnnouncementType.PROMOTION,
      priority: 100,
      actionText: "Rezervasyon",
      actionLink: "/booking",
      dismissible: true,
      targetRoles: [],
      targetPages: [],
      createdBy: adminUser.id,
    },
    {
      title: "Yeni Lokasyon",
      message: "📍 Yeni stüdyomuz Kadıköy'de hizmetinizde!",
      type: AnnouncementType.INFO,
      priority: 80,
      actionText: "Adres",
      actionLink: "/contact",
      dismissible: true,
      targetRoles: [],
      targetPages: [],
      createdBy: adminUser.id,
    },
    {
      title: "Ödül Duyurusu",
      message: "🏆 2024 En İyi Düğün Fotoğrafçısı ödülüne layık görüldük!",
      type: AnnouncementType.SUCCESS,
      priority: 90,
      actionText: "Portfolyo",
      actionLink: "/portfolio",
      dismissible: true,
      targetRoles: [],
      targetPages: [],
      createdBy: adminUser.id,
    },
    {
      title: "Hafta Sonu Özel",
      message: "🎁 Hafta sonu özel: Engagement çekimlerinde %30 indirim!",
      type: AnnouncementType.PROMOTION,
      priority: 95,
      actionText: "Detaylar",
      actionLink: "/services",
      dismissible: true,
      targetRoles: [],
      targetPages: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta
      createdBy: adminUser.id,
    },
    {
      title: "Bayram Tatil Bildirimi",
      message: "⚠️ Bayram tatili: 28-30 Ağustos arası kapalıyız.",
      type: AnnouncementType.WARNING,
      priority: 70,
      dismissible: true,
      targetRoles: [],
      targetPages: [],
      createdBy: adminUser.id,
    }
  ];

  for (const announcementData of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: announcementData.title }
    });
    
    if (!existing) {
      await prisma.announcement.create({
        data: announcementData,
      });
    }
  }

  console.log('✅ Announcements created successfully!');
  console.log('🌱 Seeding completed!');
  console.log('✅ Announcements created successfully!');
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });