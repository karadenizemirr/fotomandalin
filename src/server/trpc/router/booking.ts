import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schemas
const createBookingSchema = z.object({
  packageId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  customerName: z.string().min(1, "Müşteri adı gereklidir"),
  customerEmail: z.string().email("Geçerli email adresi giriniz"),
  customerPhone: z.string().min(1, "Telefon numarası gereklidir"),
  locationId: z.string().optional(),
  staffId: z.string().optional(), // Personel seçimi opsiyonel
  specialNotes: z.string().optional(),
  addOns: z.array(
    z.object({
      addOnId: z.string(),
      quantity: z.number().int().min(1).default(1),
    })
  ).default([]),
  totalAmount: z.number().min(0),
});

const updateBookingSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  locationId: z.string().optional(),
  specialNotes: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  addOns: z.array(
    z.object({
      addOnId: z.string(),
      quantity: z.number().int().min(1).default(1),
      price: z.number().min(0),
    })
  ).optional(),
});

export const bookingRouter = router({
  // Public procedures
  create: publicProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const { packageId, addOns, totalAmount, staffId, ...bookingData } = input;

      // Check if package exists and is active
      const pkg = await ctx.prisma.package.findUnique({
        where: { id: packageId },
        include: {
          category: true,
        },
      });

      if (!pkg || !pkg.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı veya aktif değil",
        });
      }

      // Validate staff if provided
      let assignedStaff = null;
      if (staffId) {
        assignedStaff = await ctx.prisma.staff.findUnique({
          where: { id: staffId },
        });

        if (!assignedStaff || !assignedStaff.isActive) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Personel bulunamadı veya aktif değil",
          });
        }
      }

      // Check for time slot conflicts
      const whereConditions: any = {
        startTime: { lt: bookingData.endTime },
        endTime: { gt: bookingData.startTime },
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      };

      // If staff is specified, check for staff conflicts
      if (staffId) {
        whereConditions.staffId = staffId;
      } else {
        // If no staff specified, find available staff automatically
        const availableStaff = await ctx.prisma.staff.findMany({
          where: {
            isActive: true,
            locationId: bookingData.locationId || undefined,
            NOT: {
              bookings: {
                some: {
                  startTime: { lt: bookingData.endTime },
                  endTime: { gt: bookingData.startTime },
                  status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
                },
              },
            },
          },
          take: 1,
        });

        if (availableStaff.length > 0) {
          assignedStaff = availableStaff[0];
        } else {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu zaman dilimi için müsait personel bulunmuyor",
          });
        }
      }

      // Final conflict check for selected/assigned staff
      const conflictingBooking = await ctx.prisma.booking.findFirst({
        where: {
          ...whereConditions,
          staffId: assignedStaff?.id,
        },
      });

      if (conflictingBooking) {
        throw new TRPCError({
          code: "CONFLICT",
          message: assignedStaff 
            ? `${assignedStaff.name} personeli bu zaman diliminde müsait değil`
            : "Bu zaman dilimi için zaten rezervasyon mevcut",
        });
      }

      // Validate add-ons if any
      if (addOns.length > 0) {
        const addOnIds = addOns.map(ao => ao.addOnId);
        const validAddOns = await ctx.prisma.addOn.findMany({
          where: {
            id: { in: addOnIds },
            isActive: true,
          },
        });

        if (validAddOns.length !== addOnIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bir veya daha fazla eklenti geçersiz",
          });
        }
      }

      // Generate booking code
      const currentYear = new Date().getFullYear();
      const lastBooking = await ctx.prisma.booking.findFirst({
        where: {
          bookingCode: {
            startsWith: `BK-${currentYear}-`,
          },
        },
        orderBy: {
          bookingCode: "desc",
        },
      });

      let nextNumber = 1;
      if (lastBooking) {
        const lastNumber = parseInt(lastBooking.bookingCode.split("-")[2]);
        nextNumber = lastNumber + 1;
      }

      const bookingCode = `BK-${currentYear}-${nextNumber.toString().padStart(4, "0")}`;

      // Create booking
      const booking = await ctx.prisma.booking.create({
        data: {
          ...bookingData,
          packageId,
          staffId: assignedStaff?.id || null,
          bookingCode,
          userId: ctx.session?.user?.id || null,
          status: "PENDING",
          paymentStatus: "PENDING",
          totalAmount: new Decimal(totalAmount),
        },
        include: {
          package: {
            include: {
              category: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              title: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          user: true,
        },
      });

      // Add booking addons
      if (addOns.length > 0) {
        const addOnDetails = await ctx.prisma.addOn.findMany({
          where: { id: { in: addOns.map(ao => ao.addOnId) } },
        });

        await ctx.prisma.bookingAddOn.createMany({
          data: addOns.map(ao => {
            const addOnDetail = addOnDetails.find(ad => ad.id === ao.addOnId);
            return {
              bookingId: booking.id,
              addOnId: ao.addOnId,
              quantity: ao.quantity,
              price: addOnDetail?.price || new Decimal(0),
            };
          }),
        });
      }

      return booking;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: {
          package: {
            include: {
              category: true,
            },
          },
          user: true,
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
              addOn: true,
            },
          },
          payments: true,
          review: true,
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
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rezervasyon bulunamadı",
        });
      }

      return booking;
    }),

  // Protected procedures (require authentication)
  myBookings: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input;

      const where: any = {
        userId: ctx.session.user.id,
      };
      if (status) where.status = status;

      const items = await ctx.prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          package: {
            include: {
              category: true,
            },
          },
          addOns: {
            include: {
              addOn: true,
            },
          },
          payments: true,
          review: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  update: protectedProcedure
    .input(updateBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, addOns, ...data } = input;

      // Check if booking exists and belongs to user or is admin
      const existingBooking = await ctx.prisma.booking.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingBooking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rezervasyon bulunamadı",
        });
      }

      const isOwner = existingBooking.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu rezervasyonu güncelleme yetkiniz yok",
        });
      }

      // Don't allow status changes by regular users
      if (!isAdmin && data.status) {
        delete data.status;
      }

      // Update booking
      const booking = await ctx.prisma.booking.update({
        where: { id },
        data,
        include: {
          package: {
            include: {
              category: true,
            },
          },
          user: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      });

      // Update add-ons if provided
      if (addOns) {
        // Remove existing add-ons
        await ctx.prisma.bookingAddOn.deleteMany({
          where: { bookingId: id },
        });

        // Add new add-ons
        if (addOns.length > 0) {
          await ctx.prisma.bookingAddOn.createMany({
            data: addOns.map(ao => ({
              bookingId: id,
              addOnId: ao.addOnId,
              quantity: ao.quantity,
              price: new Decimal(ao.price),
            })),
          });
        }
      }

      return booking;
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rezervasyon bulunamadı",
        });
      }

      const isOwner = booking.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu rezervasyonu iptal etme yetkiniz yok",
        });
      }

      if (booking.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Rezervasyon zaten iptal edilmiş",
        });
      }

      if (booking.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tamamlanmış rezervasyon iptal edilemez",
        });
      }

      const updatedBooking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: {
          status: "CANCELLED",
          specialNotes: input.reason ? `İptal nedeni: ${input.reason}` : booking.specialNotes,
        },
        include: {
          package: true,
          user: true,
        },
      });

      return updatedBooking;
    }),

  // Admin procedures
  list: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
        paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        packageId: z.string().optional(),
        userId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["startTime", "created", "updated", "total"]).default("startTime"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, paymentStatus, startDate, endDate, packageId, userId, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {};
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = startDate;
        if (endDate) where.startTime.lte = endDate;
      }
      if (packageId) where.packageId = packageId;
      if (userId) where.userId = userId;

      const orderBy: any = {};
      switch (sortBy) {
        case "startTime":
          orderBy.startTime = sortOrder;
          break;
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "updated":
          orderBy.updatedAt = sortOrder;
          break;
        case "total":
          orderBy.totalAmount = sortOrder;
          break;
      }

      const items = await ctx.prisma.booking.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          package: {
            include: {
              category: true,
            },
          },
          user: true,
          location: true,
          staff: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
          payments: true,
          review: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
        specialNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rezervasyon bulunamadı",
        });
      }

      const updatedBooking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: {
          status: input.status,
          specialNotes: input.specialNotes || booking.specialNotes,
        },
        include: {
          package: true,
          user: true,
        },
      });

      return updatedBooking;
    }),

  stats: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
      ] = await Promise.all([
        ctx.prisma.booking.count({ where }),
        ctx.prisma.booking.count({ where: { ...where, status: "PENDING" } }),
        ctx.prisma.booking.count({ where: { ...where, status: "CONFIRMED" } }),
        ctx.prisma.booking.count({ where: { ...where, status: "CANCELLED" } }),
        ctx.prisma.booking.count({ where: { ...where, status: "COMPLETED" } }),
      ]);

      const revenueStats = await ctx.prisma.booking.aggregate({
        where: {
          ...where,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      });

      const popularPackages = await ctx.prisma.booking.groupBy({
        by: ["packageId"],
        where: {
          ...where,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _count: { packageId: true },
        orderBy: {
          _count: {
            packageId: "desc",
          },
        },
        take: 5,
      });

      return {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
        totalRevenue: revenueStats._sum.totalAmount?.toNumber() || 0,
        averageBookingValue: revenueStats._avg.totalAmount?.toNumber() || 0,
        popularPackages,
      };
    }),

  calendar: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, status } = input;

      const where: any = {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      };
      if (status) where.status = status;

      const bookings = await ctx.prisma.booking.findMany({
        where,
        orderBy: [{ startTime: "asc" }],
        include: {
          package: {
            select: {
              id: true,
              name: true,
              categoryId: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return bookings;
    }),
});
