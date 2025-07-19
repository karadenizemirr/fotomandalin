import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schemas
const createAddOnSchema = z.object({
  name: z.string().min(1, "Eklenti adı gereklidir"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan büyük olmalıdır"), // Use coerce to convert string to number
  currency: z.string().default("TRY"),
  isActive: z.boolean().default(true),
  durationInMinutes: z.coerce.number().int().min(1).optional(), // Use coerce to convert string to number
});

const updateAddOnSchema = createAddOnSchema.partial().extend({
  id: z.string(),
});

export const addOnRouter = router({
  // Public procedures
  list: publicProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { includeInactive, limit, cursor } = input;

      const where: any = {};
      if (!includeInactive) where.isActive = true;

      const items = await ctx.prisma.addOn.findMany({
        where,
        orderBy: [{ name: "asc" }],
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          packages: {
            include: {
              package: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  isActive: true,
                },
              },
            },
          },
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

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const addOn = await ctx.prisma.addOn.findUnique({
        where: { id: input.id },
        include: {
          packages: {
            include: {
              package: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!addOn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Eklenti bulunamadı",
        });
      }

      return addOn;
    }),

  getByPackage: publicProcedure
    .input(z.object({ packageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const addOns = await ctx.prisma.addOn.findMany({
        where: {
          isActive: true,
          packages: {
            some: {
              packageId: input.packageId,
            },
          },
        },
        orderBy: [{ name: "asc" }],
        include: {
          packages: {
            where: {
              packageId: input.packageId,
            },
          },
        },
      });

      return addOns;
    }),

  // Admin procedures
  create: adminProcedure
    .input(createAddOnSchema)
    .mutation(async ({ ctx, input }) => {
      const { price, ...rest } = input;

      const addOn = await ctx.prisma.addOn.create({
        data: {
          ...rest,
          price: new Decimal(price),
        },
      });

      return addOn;
    }),

  update: adminProcedure
    .input(updateAddOnSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, price, ...data } = input;

      // Check if addon exists
      const existingAddOn = await ctx.prisma.addOn.findUnique({
        where: { id },
      });

      if (!existingAddOn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Eklenti bulunamadı",
        });
      }

      const updateData: any = { ...data };
      if (price !== undefined) updateData.price = new Decimal(price);

      const addOn = await ctx.prisma.addOn.update({
        where: { id },
        data: updateData,
      });

      return addOn;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if addon is used in any packages
      const packageCount = await ctx.prisma.packageAddOn.count({
        where: { addOnId: input.id },
      });

      if (packageCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu eklenti paketlerde kullanıldığı için silinemez",
        });
      }

      // Check if addon is used in any bookings
      const bookingCount = await ctx.prisma.bookingAddOn.count({
        where: { addOnId: input.id },
      });

      if (bookingCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu eklenti rezervasyonlarda kullanıldığı için silinemez",
        });
      }

      await ctx.prisma.addOn.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  assignToPackage: adminProcedure
    .input(
      z.object({
        addOnId: z.string(),
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if addon exists
      const addOn = await ctx.prisma.addOn.findUnique({
        where: { id: input.addOnId },
      });

      if (!addOn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Eklenti bulunamadı",
        });
      }

      // Check if package exists
      const pkg = await ctx.prisma.package.findUnique({
        where: { id: input.packageId },
      });

      if (!pkg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı",
        });
      }

      // Check if already assigned
      const existing = await ctx.prisma.packageAddOn.findUnique({
        where: {
          packageId_addOnId: {
            packageId: input.packageId,
            addOnId: input.addOnId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu eklenti zaten pakete eklenmiş",
        });
      }

      const assignment = await ctx.prisma.packageAddOn.create({
        data: {
          packageId: input.packageId,
          addOnId: input.addOnId,
        },
        include: {
          addOn: true,
          package: true,
        },
      });

      return assignment;
    }),

  removeFromPackage: adminProcedure
    .input(
      z.object({
        addOnId: z.string(),
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await ctx.prisma.packageAddOn.findUnique({
        where: {
          packageId_addOnId: {
            packageId: input.packageId,
            addOnId: input.addOnId,
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bu eklenti pakete eklenmemiş",
        });
      }

      await ctx.prisma.packageAddOn.delete({
        where: {
          packageId_addOnId: {
            packageId: input.packageId,
            addOnId: input.addOnId,
          },
        },
      });

      return { success: true };
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, inactive] = await Promise.all([
      ctx.prisma.addOn.count(),
      ctx.prisma.addOn.count({ where: { isActive: true } }),
      ctx.prisma.addOn.count({ where: { isActive: false } }),
    ]);

    const avgPrice = await ctx.prisma.addOn.aggregate({
      _avg: { price: true },
      where: { isActive: true },
    });

    const mostUsed = await ctx.prisma.addOn.findMany({
      take: 5,
      orderBy: {
        packages: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });

    return {
      total,
      active,
      inactive,
      averagePrice: avgPrice._avg.price?.toNumber() || 0,
      mostUsed,
    };
  }),

  duplicate: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const originalAddOn = await ctx.prisma.addOn.findUnique({
        where: { id: input.id },
      });

      if (!originalAddOn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Eklenti bulunamadı",
        });
      }

      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...addOnData } = originalAddOn;
      const newName = input.name || `${addOnData.name} - Kopya`;

      const newAddOn = await ctx.prisma.addOn.create({
        data: {
          ...addOnData,
          name: newName,
          isActive: false, // Kopya eklentiler varsayılan olarak pasif
        },
      });

      return newAddOn;
    }),
});
