import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schemas
const createPackageSchema = z.object({
  name: z.string().min(1, "Paket adı gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Fiyat 0'dan büyük olmalıdır"), // Use coerce
  discountPrice: z.coerce.number().min(0).optional(), // Use coerce
  currency: z.string().default("TRY"),
  durationInMinutes: z.coerce.number().int().min(1, "Süre en az 1 dakika olmalıdır"), // Use coerce
  photoCount: z.coerce.number().int().min(0).optional(), // Use coerce
  videoIncluded: z.boolean().default(false),
  albumIncluded: z.boolean().default(false),
  features: z.any().optional(),
  images: z.array(z.string()).default([]), // Remove .url() requirement
  coverImage: z.string().optional(), // Remove .url() to allow empty strings
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0), // Use coerce
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string(),
});

const updatePackageSchema = createPackageSchema.partial().extend({
  id: z.string(),
});

export const packageRouter = router({
  // Public procedures
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        includeInactive: z.boolean().default(false),
        featured: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["price", "popularity", "name", "created"]).default("popularity"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, includeInactive, featured, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {};
      if (!includeInactive) where.isActive = true;
      if (categoryId) where.categoryId = categoryId;
      if (featured !== undefined) where.isPopular = featured;

      const orderBy: any = {};
      switch (sortBy) {
        case "price":
          orderBy.basePrice = sortOrder;
          break;
        case "popularity":
          orderBy.isPopular = "desc";
          break;
        case "name":
          orderBy.name = sortOrder;
          break;
        case "created":
          orderBy.createdAt = sortOrder;
          break;
      }

      const items = await ctx.prisma.package.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          category: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
          _count: {
            select: { bookings: true },
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

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const pkg = await ctx.prisma.package.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
          bookings: {
            where: { status: "COMPLETED" },
            include: {
              review: {
                where: { isPublished: true },
              },
            },
            take: 5,
          },
        },
      });

      if (!pkg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı",
        });
      }

      return pkg;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pkg = await ctx.prisma.package.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
      });

      if (!pkg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı",
        });
      }

      return pkg;
    }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(10).default(4) }))
    .query(async ({ ctx, input }) => {
      const packages = await ctx.prisma.package.findMany({
        where: {
          isActive: true,
          isPopular: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: input.limit,
        include: {
          category: true,
        },
      });

      return packages;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        categoryId: z.string().optional(),
        priceMin: z.number().min(0).optional(),
        priceMax: z.number().min(0).optional(),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, categoryId, priceMin, priceMax, limit } = input;

      const where: any = {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { shortDesc: { contains: query, mode: "insensitive" } },
        ],
      };

      if (categoryId) where.categoryId = categoryId;
      if (priceMin !== undefined || priceMax !== undefined) {
        where.basePrice = {};
        if (priceMin !== undefined) where.basePrice.gte = new Decimal(priceMin);
        if (priceMax !== undefined) where.basePrice.lte = new Decimal(priceMax);
      }

      const packages = await ctx.prisma.package.findMany({
        where,
        take: limit,
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        include: {
          category: true,
        },
      });

      return packages;
    }),

  // Admin procedures
  create: adminProcedure
    .input(createPackageSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existingPackage = await ctx.prisma.package.findUnique({
        where: { slug: input.slug },
      });

      if (existingPackage) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu slug zaten kullanılmaktadır",
        });
      }

      // Check if category exists
      const category = await ctx.prisma.serviceCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori bulunamadı",
        });
      }

      const { basePrice, discountPrice, ...rest } = input;

      const pkg = await ctx.prisma.package.create({
        data: {
          ...rest,
          basePrice: new Decimal(basePrice),
          discountPrice: discountPrice ? new Decimal(discountPrice) : null,
        },
        include: {
          category: true,
        },
      });

      return pkg;
    }),

  update: adminProcedure
    .input(updatePackageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, basePrice, discountPrice, ...data } = input;

      // Check if package exists
      const existingPackage = await ctx.prisma.package.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı",
        });
      }

      // Check slug uniqueness if being updated
      if (data.slug && data.slug !== existingPackage.slug) {
        const slugExists = await ctx.prisma.package.findUnique({
          where: { slug: data.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu slug zaten kullanılmaktadır",
          });
        }
      }

      const updateData: any = { ...data };
      if (basePrice !== undefined) updateData.basePrice = new Decimal(basePrice);
      if (discountPrice !== undefined) {
        updateData.discountPrice = discountPrice ? new Decimal(discountPrice) : null;
      }

      const pkg = await ctx.prisma.package.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      });

      return pkg;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if package has bookings
      const bookingsCount = await ctx.prisma.booking.count({
        where: { packageId: input.id },
      });

      if (bookingsCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu pakette rezervasyonlar bulunduğu için silinemez",
        });
      }

      await ctx.prisma.package.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  reorder: adminProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            sortOrder: z.number().int(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.items.map((item) =>
          ctx.prisma.package.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return { success: true };
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, inactive, popular] = await Promise.all([
      ctx.prisma.package.count(),
      ctx.prisma.package.count({ where: { isActive: true } }),
      ctx.prisma.package.count({ where: { isActive: false } }),
      ctx.prisma.package.count({ where: { isPopular: true } }),
    ]);

    const avgPrice = await ctx.prisma.package.aggregate({
      _avg: { basePrice: true },
      where: { isActive: true },
    });

    return {
      total,
      active,
      inactive,
      popular,
      averagePrice: avgPrice._avg.basePrice?.toNumber() || 0,
    };
  }),

  duplicate: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const originalPackage = await ctx.prisma.package.findUnique({
        where: { id: input.id },
        include: {
          addOns: true,
        },
      });

      if (!originalPackage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paket bulunamadı",
        });
      }

      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, addOns, features, ...packageData } = originalPackage;
      const newName = input.name || `${packageData.name} - Kopya`;
      const newSlug = `${packageData.slug}-kopya-${Date.now()}`;

      const newPackage = await ctx.prisma.package.create({
        data: {
          ...packageData,
          name: newName,
          slug: newSlug,
          isActive: false, // Kopya paketler varsayılan olarak pasif
          features: features as any,
        },
      });

      // Copy add-ons
      if (addOns.length > 0) {
        await ctx.prisma.packageAddOn.createMany({
          data: addOns.map((addOn) => ({
            packageId: newPackage.id,
            addOnId: addOn.addOnId,
          })),
        });
      }

      return newPackage;
    }),
});
