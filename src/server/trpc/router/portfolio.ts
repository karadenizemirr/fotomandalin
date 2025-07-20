import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createPortfolioSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  coverImage: z.string().url("Geçerli bir URL giriniz"),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  eventDate: z.string().transform((val, ctx) => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Geçersiz tarih formatı",
      });
      return z.NEVER;
    }
    return date;
  }).optional(),
  location: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updatePortfolioSchema = createPortfolioSchema.partial().extend({
  id: z.string(),
});

export const portfolioRouter = router({
  // Public procedures
  list: publicProcedure
    .input(
      z.object({
        featured: z.boolean().optional(),
        tag: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["created", "updated", "eventDate"]).default("created"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { featured, tag, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {
        isPublished: true,
      };
      if (featured !== undefined) where.isFeatured = featured;
      if (tag) where.tags = { has: tag };

      const orderBy: any = {};
      switch (sortBy) {
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "updated":
          orderBy.updatedAt = sortOrder;
          break;
        case "eventDate":
          orderBy.eventDate = sortOrder;
          break;
      }

      const items = await ctx.prisma.portfolio.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
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
      const portfolio = await ctx.prisma.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!portfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      if (!portfolio.isPublished) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      return portfolio;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const portfolio = await ctx.prisma.portfolio.findUnique({
        where: { slug: input.slug },
      });

      if (!portfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      if (!portfolio.isPublished) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      return portfolio;
    }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.portfolio.findMany({
        where: {
          isPublished: true,
          isFeatured: true,
        },
        orderBy: [{ createdAt: "desc" }],
        take: input.limit,
      });

      return items;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      const where: any = {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      };

      const items = await ctx.prisma.portfolio.findMany({
        where,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      });

      return items;
    }),

  tags: publicProcedure.query(async ({ ctx }) => {
    const portfolios = await ctx.prisma.portfolio.findMany({
      where: { isPublished: true },
      select: { tags: true },
    });

    const allTags = portfolios.flatMap(p => p.tags);
    const uniqueTags = [...new Set(allTags)];

    return uniqueTags.map(tag => ({
      name: tag,
      count: allTags.filter(t => t === tag).length,
    }));
  }),

  // Admin procedures
  adminList: adminProcedure
    .input(
      z.object({
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        tag: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["created", "updated", "title", "eventDate"]).default("created"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { isPublished, isFeatured, tag, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {};
      if (isPublished !== undefined) where.isPublished = isPublished;
      if (isFeatured !== undefined) where.isFeatured = isFeatured;
      if (tag) where.tags = { has: tag };

      const orderBy: any = {};
      switch (sortBy) {
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "updated":
          orderBy.updatedAt = sortOrder;
          break;
        case "title":
          orderBy.title = sortOrder;
          break;
        case "eventDate":
          orderBy.eventDate = sortOrder;
          break;
      }

      const items = await ctx.prisma.portfolio.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
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

  create: adminProcedure
    .input(createPortfolioSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existingPortfolio = await ctx.prisma.portfolio.findUnique({
        where: { slug: input.slug },
      });

      if (existingPortfolio) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu slug zaten kullanılmaktadır",
        });
      }

      const portfolio = await ctx.prisma.portfolio.create({
        data: input,
      });

      return portfolio;
    }),

  update: adminProcedure
    .input(updatePortfolioSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if portfolio exists
      const existingPortfolio = await ctx.prisma.portfolio.findUnique({
        where: { id },
      });

      if (!existingPortfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      // Check slug uniqueness if being updated
      if (data.slug && data.slug !== existingPortfolio.slug) {
        const slugExists = await ctx.prisma.portfolio.findUnique({
          where: { slug: data.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu slug zaten kullanılmaktadır",
          });
        }
      }

      const portfolio = await ctx.prisma.portfolio.update({
        where: { id },
        data,
      });

      return portfolio;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingPortfolio = await ctx.prisma.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!existingPortfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      await ctx.prisma.portfolio.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  togglePublish: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const portfolio = await ctx.prisma.portfolio.update({
        where: { id: input.id },
        data: { isPublished: input.isPublished },
      });

      return portfolio;
    }),

  toggleFeatured: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isFeatured: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const portfolio = await ctx.prisma.portfolio.update({
        where: { id: input.id },
        data: { isFeatured: input.isFeatured },
      });

      return portfolio;
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, published, unpublished, featured] = await Promise.all([
      ctx.prisma.portfolio.count(),
      ctx.prisma.portfolio.count({ where: { isPublished: true } }),
      ctx.prisma.portfolio.count({ where: { isPublished: false } }),
      ctx.prisma.portfolio.count({ where: { isFeatured: true } }),
    ]);

    return {
      total,
      published,
      unpublished,
      featured,
    };
  }),

  duplicate: adminProcedure
    .input(z.object({ id: z.string(), title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const originalPortfolio = await ctx.prisma.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!originalPortfolio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portfolio öğesi bulunamadı",
        });
      }

      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...portfolioData } = originalPortfolio;
      const newTitle = input.title || `${portfolioData.title} - Kopya`;
      const newSlug = `${portfolioData.slug}-kopya-${Date.now()}`;

      const newPortfolio = await ctx.prisma.portfolio.create({
        data: {
          ...portfolioData,
          title: newTitle,
          slug: newSlug,
          isPublished: false, // Kopya portfolyolar varsayılan olarak pasif
        },
      });

      return newPortfolio;
    }),
});
