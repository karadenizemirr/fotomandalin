import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

// Input validation schemas
const staffCreateSchema = z.object({
  name: z.string().min(1, "Personel adı gereklidir"),
  email: z.string().email("Geçerli bir email adresi gereklidir"),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  specialties: z.array(z.string()).default([]),
  workingHours: z.record(z.string(), z.any()).optional(),
  locationId: z.string().optional(),
});

const staffUpdateSchema = staffCreateSchema.extend({
  id: z.string(),
});

const staffAvailabilitySchema = z.object({
  staffId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli tarih formatı: YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçerli saat formatı: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçerli saat formatı: HH:MM"),
  isActive: z.boolean().default(true),
  reason: z.string().optional(),
});

export const staffRouter = router({
  // Get all staff
  getAll: publicProcedure
    .input(
      z.object({
        locationId: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { locationId, isActive, limit, offset } = input;

      const where: any = {};
      if (locationId) {
        where.OR = [
          { primaryLocationId: locationId },
          {
            workingLocations: {
              some: {
                locationId: locationId,
                isActive: true,
              },
            },
          },
        ];
      }
      if (isActive !== undefined) where.isActive = isActive;

      const [staff, total] = await Promise.all([
        ctx.prisma.staff.findMany({
          where,
          include: {
            primaryLocation: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            workingLocations: {
              include: {
                location: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              where: {
                isActive: true,
              },
            },
            _count: {
              select: {
                bookings: true,
              },
            },
          },
          orderBy: [
            { isActive: "desc" },
            { name: "asc" },
          ],
          take: limit,
          skip: offset,
        }),
        ctx.prisma.staff.count({ where }),
      ]);

      return {
        staff,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get staff by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const staff = await ctx.prisma.staff.findUnique({
        where: { id: input.id },
        include: {
          primaryLocation: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          workingLocations: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
          bookings: {
            include: {
              package: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              startTime: "desc",
            },
            take: 10,
          },
          staffAvailability: {
            where: {
              specificDate: {
                gte: new Date(),
              },
            },
            orderBy: {
              specificDate: "asc",
            },
            take: 30,
          },
        },
      });

      if (!staff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personel bulunamadı",
        });
      }

      return staff;
    }),

  // Create staff
  create: publicProcedure
    .input(staffCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { locationId, ...staffData } = input;

      // Check if email already exists
      const existingStaff = await ctx.prisma.staff.findUnique({
        where: { email: input.email },
      });

      if (existingStaff) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu email adresi zaten kullanılıyor",
        });
      }

      // Validate location if provided
      if (locationId) {
        const location = await ctx.prisma.location.findUnique({
          where: { id: locationId },
        });

        if (!location) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Geçersiz lokasyon",
          });
        }
      }

      return await ctx.prisma.staff.create({
        data: {
          ...staffData,
          primaryLocationId: locationId,
        },
        include: {
          primaryLocation: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    }),

  // Update staff
  update: publicProcedure
    .input(staffUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, locationId, ...data } = input;

      // Check if staff exists
      const existingStaff = await ctx.prisma.staff.findUnique({
        where: { id },
      });

      if (!existingStaff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personel bulunamadı",
        });
      }

      // Check email uniqueness if email is being changed
      if (data.email && data.email !== existingStaff.email) {
        const emailExists = await ctx.prisma.staff.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu email adresi zaten kullanılıyor",
          });
        }
      }

      // Validate location if provided
      if (locationId) {
        const location = await ctx.prisma.location.findUnique({
          where: { id: locationId },
        });

        if (!location) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Geçersiz lokasyon",
          });
        }
      }

      return await ctx.prisma.staff.update({
        where: { id },
        data: {
          ...data,
          primaryLocationId: locationId,
        },
        include: {
          primaryLocation: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    }),

  // Delete staff
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if staff exists
      const existingStaff = await ctx.prisma.staff.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      if (!existingStaff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personel bulunamadı",
        });
      }

      // Check if staff has bookings
      if (existingStaff._count.bookings > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Bu personelin rezervasyonları var, silinemez. Önce personeli pasif hale getirin.",
        });
      }

      await ctx.prisma.staff.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle staff status
  toggleStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const staff = await ctx.prisma.staff.findUnique({
        where: { id: input.id },
      });

      if (!staff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personel bulunamadı",
        });
      }

      return await ctx.prisma.staff.update({
        where: { id: input.id },
        data: {
          isActive: !staff.isActive,
        },
      });
    }),

  // Get available staff for a specific time slot
  getAvailableStaff: publicProcedure
    .input(
      z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        locationId: z.string().optional(),
        excludeStaffId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startTime, endTime, locationId, excludeStaffId } = input;

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Get all active staff
      const where: any = {
        isActive: true,
      };

      if (locationId) {
        where.OR = [
          { primaryLocationId: locationId },
          {
            workingLocations: {
              some: {
                locationId: locationId,
                isActive: true,
              },
            },
          },
        ];
      }

      if (excludeStaffId) {
        where.id = {
          not: excludeStaffId,
        };
      }

      const allStaff = await ctx.prisma.staff.findMany({
        where,
        include: {
          primaryLocation: {
            select: {
              id: true,
              name: true,
            },
          },
          workingLocations: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      // Check for conflicts with existing bookings
      const conflictingBookings = await ctx.prisma.booking.findMany({
        where: {
          staffId: {
            in: allStaff.map(s => s.id),
          },
          OR: [
            {
              startTime: {
                lt: endDate,
              },
              endTime: {
                gt: startDate,
              },
            },
          ],
          status: {
            in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
          },
        },
        select: {
          staffId: true,
        },
      });

      const busyStaffIds = new Set(conflictingBookings.map(b => b.staffId).filter(Boolean));

      // Filter out busy staff and return available staff
      return allStaff.filter(staff => !busyStaffIds.has(staff.id));
    }),

  // Set staff availability for specific date
  setAvailability: publicProcedure
    .input(staffAvailabilitySchema)
    .mutation(async ({ ctx, input }) => {
      const { staffId, date, startTime, endTime, isActive } = input;

      // Validate staff exists
      const staff = await ctx.prisma.staff.findUnique({
        where: { id: staffId },
      });

      if (!staff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personel bulunamadı",
        });
      }

      // Check for existing availability record
      const existing = await ctx.prisma.staffAvailability.findFirst({
        where: {
          staffId,
          specificDate: new Date(date),
        },
      });

      if (existing) {
        return await ctx.prisma.staffAvailability.update({
          where: { id: existing.id },
          data: {
            startTime,
            endTime,
            isActive,
          },
        });
      } else {
        return await ctx.prisma.staffAvailability.create({
          data: {
            staffId,
            dayOfWeek: new Date(date).getDay(), // 0=Sunday, 1=Monday, etc.
            startTime,
            endTime,
            isActive,
            specificDate: new Date(date),
          },
        });
      }
    }),

  // Get staff availability for a date range
  getAvailability: publicProcedure
    .input(
      z.object({
        staffId: z.string(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const { staffId, startDate, endDate } = input;

      return await ctx.prisma.staffAvailability.findMany({
        where: {
          staffId,
          specificDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: [
          { specificDate: "asc" },
          { startTime: "asc" },
        ],
      });
    }),
});
