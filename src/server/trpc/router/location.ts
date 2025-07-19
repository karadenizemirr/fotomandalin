import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure, publicProcedure } from "@/server/trpc";
import { createSlug } from "@/lib/utils";

// Validation schemas
const createLocationSchema = z.object({
  name: z.string().min(1, "Lokasyon adı gereklidir"),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  images: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  extraFee: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  maxBookingsPerDay: z.coerce.number().min(1).default(3),
  workingHours: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  blackoutDates: z.array(z.string()).default([])
});

const updateLocationSchema = createLocationSchema.partial().extend({
  id: z.string()
});

export const locationRouter = router({
  // Get all locations
  getAll: publicProcedure
    .input(z.object({
      includeInactive: z.boolean().default(false),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, includeInactive } = input;
      const skip = (page - 1) * limit;

      const where = includeInactive ? {} : { isActive: true };

      const [locations, total] = await Promise.all([
        ctx.prisma.location.findMany({
          where,
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ],
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                bookings: true
              }
            }
          }
        }),
        ctx.prisma.location.count({ where })
      ]);

      return {
        locations,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      };
    }),

  // Get location by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lokasyon bulunamadı"
        });
      }

      return location;
    }),

  // Get location by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lokasyon bulunamadı"
        });
      }

      return location;
    }),

  // Create location (admin only)
  create: adminProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = createSlug(input.name);

      // Check if slug already exists
      const existingLocation = await ctx.prisma.location.findUnique({
        where: { slug }
      });

      if (existingLocation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu isimde bir lokasyon zaten mevcut"
        });
      }

      const location = await ctx.prisma.location.create({
        data: {
          ...input,
          slug,
          extraFee: input.extraFee ? String(input.extraFee) : null,
        }
      });

      return location;
    }),

  // Update location (admin only)
  update: adminProcedure
    .input(updateLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, ...updateData } = input;

      // Check if location exists
      const existingLocation = await ctx.prisma.location.findUnique({
        where: { id }
      });

      if (!existingLocation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lokasyon bulunamadı"
        });
      }

      let slug = existingLocation.slug;

      // If name is being updated, generate new slug
      if (name && name !== existingLocation.name) {
        slug = createSlug(name);
        
        // Check if new slug conflicts with another location
        const slugConflict = await ctx.prisma.location.findFirst({
          where: {
            slug,
            id: { not: id }
          }
        });

        if (slugConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu isimde bir lokasyon zaten mevcut"
          });
        }
      }

      const location = await ctx.prisma.location.update({
        where: { id },
        data: {
          ...updateData,
          ...(name && { name, slug }),
          ...(updateData.extraFee && { extraFee: String(updateData.extraFee) })
        }
      });

      return location;
    }),

  // Delete location (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if location exists
      const existingLocation = await ctx.prisma.location.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      });

      if (!existingLocation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lokasyon bulunamadı"
        });
      }

      // Check if location has bookings
      if (existingLocation._count.bookings > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu lokasyonun rezervasyonları bulunduğu için silinemez"
        });
      }

      await ctx.prisma.location.delete({
        where: { id: input.id }
      });

      return { success: true };
    }),

  // Toggle location status (admin only)
  toggleStatus: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.findUnique({
        where: { id: input.id }
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lokasyon bulunamadı"
        });
      }

      const updatedLocation = await ctx.prisma.location.update({
        where: { id: input.id },
        data: {
          isActive: !location.isActive
        }
      });

      return updatedLocation;
    }),

  // Bulk update sort order (admin only)
  updateSortOrder: adminProcedure
    .input(z.array(z.object({
      id: z.string(),
      sortOrder: z.number()
    })))
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ id, sortOrder }) =>
        ctx.prisma.location.update({
          where: { id },
          data: { sortOrder }
        })
      );

      await Promise.all(updates);
      return { success: true };
    }),

  // Get available locations for booking
  getAvailableForBooking: publicProcedure
    .input(z.object({
      date: z.string(), // ISO date string
      packageId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const bookingDate = new Date(input.date);
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all active locations
      const locations = await ctx.prisma.location.findMany({
        where: {
          isActive: true,
          NOT: {
            blackoutDates: {
              has: input.date
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          bookings: {
            where: {
              startTime: {
                gte: startOfDay,
                lte: endOfDay
              },
              status: {
                not: 'CANCELLED'
              }
            }
          }
        }
      });

      // Filter locations based on booking availability
      const availableLocations = locations.filter((location: any) => {
        if (!location.maxBookingsPerDay) return true;
        return location.bookings.length < location.maxBookingsPerDay;
      });

      return availableLocations.map((location: any) => ({
        id: location.id,
        name: location.name,
        slug: location.slug,
        description: location.description,
        address: location.address,
        coverImage: location.coverImage,
        extraFee: location.extraFee,
        currentBookings: location.bookings.length,
        maxBookingsPerDay: location.maxBookingsPerDay,
        workingHours: location.workingHours
      }));
    }),

  // Get location statistics (admin only)
  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, inactive, totalBookings] = await Promise.all([
      ctx.prisma.location.count(),
      ctx.prisma.location.count({ where: { isActive: true } }),
      ctx.prisma.location.count({ where: { isActive: false } }),
      ctx.prisma.booking.count({
        where: {
          locationId: { not: null }
        }
      })
    ]);

    // Get top locations by booking count
    const topLocations = await ctx.prisma.location.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      }
    });

    return {
      total,
      active,
      inactive,
      totalBookings,
      topLocations: topLocations.map(location => ({
        id: location.id,
        name: location.name,
        bookingCount: location._count.bookings
      }))
    };
  })
});
