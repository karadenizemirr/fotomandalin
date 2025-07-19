import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../index';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  image: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır'),
});

const adminUserUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'PHOTOGRAPHER']).optional(),
  image: z.string().url().optional(),
});

export const userRouter = router({
  // Kullanıcı kaydı
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email, phone, password } = input;

      // Email kontrolü
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Bu email adresi zaten kullanılıyor',
        });
      }

      // Şifre hashleme
      const hashedPassword = await bcrypt.hash(password, 12);

      // Kullanıcı oluşturma
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'CUSTOMER',
          emailVerified: new Date(), // Email otomatik onaylı
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          createdAt: true,
        },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: user.id,
          changes: { email, name, phone },
        },
      });

      return {
        success: true,
        message: 'Hesabınız başarıyla oluşturuldu. Hemen giriş yapabilirsiniz.',
        user,
      };
    }),

  // Profil bilgilerini getirme
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kullanıcı bulunamadı',
        });
      }

      return user;
    }),

  // Profil güncelleme
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          updatedAt: true,
        },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId,
          action: 'PROFILE_UPDATED',
          entity: 'User',
          entityId: userId,
          changes: input,
        },
      });

      return {
        success: true,
        message: 'Profil bilgileriniz başarıyla güncellendi',
        user: updatedUser,
      };
    }),

  // Şifre değiştirme
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input;
      const userId = ctx.session.user.id;

      // Mevcut kullanıcıyı getir
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kullanıcı bulunamadı veya şifre mevcut değil',
        });
      }

      // Mevcut şifre kontrolü
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Mevcut şifre yanlış',
        });
      }

      // Yeni şifre hashleme
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Şifre güncelleme
      await ctx.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: userId,
          changes: { passwordChanged: true },
        },
      });

      return {
        success: true,
        message: 'Şifreniz başarıyla değiştirildi',
      };
    }),

  // Hesap silme
  deleteAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Kullanıcıyı sil (cascade ile ilişkili veriler de silinir)
      await ctx.prisma.user.delete({
        where: { id: userId },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId,
          action: 'ACCOUNT_DELETED',
          entity: 'User',
          entityId: userId,
          changes: { deleted: true },
        },
      });

      return {
        success: true,
        message: 'Hesabınız başarıyla silindi',
      };
    }),

  // Kullanıcının rezervasyonları
  getMyBookings: protectedProcedure
    .query(async ({ ctx }) => {
      const bookings = await ctx.prisma.booking.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              description: true,
              basePrice: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              title: true,
            },
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              createdAt: true,
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              content: true,
              createdAt: true,
            },
          },
          timeline: {
            select: {
              id: true,
              action: true,
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return bookings;
    }),

  // Kullanıcının yorumları
  getMyReviews: protectedProcedure
    .query(async ({ ctx }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    }),

  // Kullanıcının istatistikleri
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const [
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        totalSpent,
        reviewCount,
        averageRating,
      ] = await Promise.all([
        // Toplam rezervasyon sayısı
        ctx.prisma.booking.count({
          where: { userId },
        }),
        // Tamamlanan rezervasyonlar
        ctx.prisma.booking.count({
          where: { 
            userId,
            status: 'COMPLETED',
          },
        }),
        // İptal edilen rezervasyonlar
        ctx.prisma.booking.count({
          where: { 
            userId,
            status: 'CANCELLED',
          },
        }),
        // Bekleyen rezervasyonlar
        ctx.prisma.booking.count({
          where: { 
            userId,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        }),
        // Toplam harcama
        ctx.prisma.booking.aggregate({
          where: { 
            userId,
            status: 'COMPLETED',
          },
          _sum: {
            totalAmount: true,
          },
        }),
        // Değerlendirme sayısı
        ctx.prisma.review.count({
          where: { userId },
        }),
        // Ortalama değerlendirme
        ctx.prisma.review.aggregate({
          where: { userId },
          _avg: {
            rating: true,
          },
        }),
      ]);

      return {
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          pending: pendingBookings,
        },
        financial: {
          totalSpent: Number(totalSpent._sum?.totalAmount || 0),
          averageBookingValue: completedBookings > 0 
            ? Number(totalSpent._sum?.totalAmount || 0) / completedBookings
            : 0,
        },
        reviews: {
          count: reviewCount,
          averageRating: averageRating._avg.rating || 0,
        },
      };
    }),

  // Admin: Tüm kullanıcıları listeleme
  getAllUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      role: z.enum(['CUSTOMER', 'ADMIN', 'PHOTOGRAPHER']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search, role } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(role && { role }),
      };

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Kullanıcı güncelleme
  updateUser: adminProcedure
    .input(adminUserUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          updatedAt: true,
        },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'USER_UPDATED_BY_ADMIN',
          entity: 'User',
          entityId: id,
          changes: { targetUserId: id, ...updateData },
        },
      });

      return {
        success: true,
        message: 'Kullanıcı başarıyla güncellendi',
        user: updatedUser,
      };
    }),

  // Admin: Kullanıcı silme
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await ctx.prisma.user.delete({
        where: { id },
      });

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'USER_DELETED_BY_ADMIN',
          entity: 'User',
          entityId: id,
          changes: { targetUserId: id, deleted: true },
        },
      });

      return {
        success: true,
        message: 'Kullanıcı başarıyla silindi',
      };
    }),

  // Admin: Kullanıcı istatistikleri
  getUserStats: adminProcedure
    .query(async ({ ctx }) => {
      const [
        totalUsers,
        totalAdmins,
        recentUsers,
        activeUsers,
      ] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.user.count({ where: { role: 'ADMIN' } }),
        ctx.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
            },
          },
        }),
        ctx.prisma.user.count({
          where: {
            bookings: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
                },
              },
            },
          },
        }),
      ]);

      return {
        totalUsers,
        totalAdmins,
        recentUsers,
        activeUsers,
        regularUsers: totalUsers - totalAdmins,
      };
    }),
});
