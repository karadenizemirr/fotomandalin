import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createServiceCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  image: z.string().optional(), // Remove .url() to allow empty strings
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updateServiceCategorySchema = createServiceCategorySchema.partial().extend({
  id: z.string(),
});

export const serviceCategoryRouter = router({
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

      const items = await ctx.prisma.serviceCategory.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          packages: {
            where: { isActive: true },
            select: { id: true, name: true, basePrice: true, discountPrice: true },
          },
          _count: {
            select: { packages: true },
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
      const category = await ctx.prisma.serviceCategory.findUnique({
        where: { slug: input.slug },
        include: {
          packages: {
            where: { isActive: true },
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
            include: {
              addOns: {
                include: {
                  addOn: true,
                },
              },
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori bulunamadı",
        });
      }

      return category;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.serviceCategory.findUnique({
        where: { id: input.id },
        include: {
          packages: {
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
          },
          _count: {
            select: { packages: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori bulunamadı",
        });
      }

      return category;
    }),

  // Admin procedures
  create: adminProcedure
    .input(createServiceCategorySchema)
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existingCategory = await ctx.prisma.serviceCategory.findUnique({
        where: { slug: input.slug },
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu slug zaten kullanılmaktadır",
        });
      }

      const category = await ctx.prisma.serviceCategory.create({
        data: input,
      });

      return category;
    }),

  update: adminProcedure
    .input(updateServiceCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if category exists
      const existingCategory = await ctx.prisma.serviceCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori bulunamadı",
        });
      }

      // Check slug uniqueness if being updated
      if (data.slug && data.slug !== existingCategory.slug) {
        const slugExists = await ctx.prisma.serviceCategory.findUnique({
          where: { slug: data.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu slug zaten kullanılmaktadır",
          });
        }
      }

      const category = await ctx.prisma.serviceCategory.update({
        where: { id },
        data,
      });

      return category;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has packages
      const packagesCount = await ctx.prisma.package.count({
        where: { categoryId: input.id },
      });

      if (packagesCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kategoride paketler bulunduğu için silinemez",
        });
      }

      await ctx.prisma.serviceCategory.delete({
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
      // Use transaction to update all sort orders
      await ctx.prisma.$transaction(
        input.items.map((item) =>
          ctx.prisma.serviceCategory.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return { success: true };
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, inactive] = await Promise.all([
      ctx.prisma.serviceCategory.count(),
      ctx.prisma.serviceCategory.count({ where: { isActive: true } }),
      ctx.prisma.serviceCategory.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }),
});
