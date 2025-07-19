import { z } from "zod";
import { router, publicProcedure, adminProcedure, protectedProcedure } from "../index";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10, "İçerik en az 10 karakter olmalıdır"),
  isPublished: z.boolean().default(false),
});

const updateReviewSchema = createReviewSchema.partial().extend({
  id: z.string(),
});

export const reviewRouter = router({
  // Public procedures
  list: publicProcedure
    .input(
      z.object({
        rating: z.number().int().min(1).max(5).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["created", "rating"]).default("created"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { rating, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {
        isPublished: true,
      };
      if (rating) where.rating = rating;

      const orderBy: any = {};
      switch (sortBy) {
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "rating":
          orderBy.rating = sortOrder;
          break;
      }

      const items = await ctx.prisma.review.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
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
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      if (!review.isPublished) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      return review;
    }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(6) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.review.findMany({
        where: {
          isPublished: true,
          rating: { gte: 4 }, // 4 ve üzeri puanlar
        },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: input.limit,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return items;
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const [total, average, ratings] = await Promise.all([
      ctx.prisma.review.count({ where: { isPublished: true } }),
      ctx.prisma.review.aggregate({
        where: { isPublished: true },
        _avg: { rating: true },
      }),
      ctx.prisma.review.groupBy({
        by: ["rating"],
        where: { isPublished: true },
        _count: { rating: true },
      }),
    ]);

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
      const ratingValue = i + 1;
      const found = ratings.find(r => r.rating === ratingValue);
      return {
        rating: ratingValue,
        count: found?._count.rating || 0,
      };
    });

    return {
      total,
      average: average._avg.rating || 0,
      distribution: ratingDistribution,
    };
  }),

  // User procedures
  myReviews: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.prisma.review.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          booking: {
            select: {
              id: true,
              customerName: true,
              startTime: true,
              package: {
                select: {
                  name: true,
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

  create: protectedProcedure
    .input(createReviewSchema.omit({ bookingId: true }).extend({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if booking belongs to user
      const booking = await ctx.prisma.booking.findFirst({
        where: {
          id: input.bookingId,
          userId: ctx.session.user.id,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rezervasyon bulunamadı",
        });
      }

      // Check if review already exists for this booking
      const existingReview = await ctx.prisma.review.findUnique({
        where: {
          bookingId: input.bookingId,
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu rezervasyon için zaten değerlendirme yapılmış",
        });
      }

      const review = await ctx.prisma.review.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return review;
    }),

  update: protectedProcedure
    .input(updateReviewSchema.omit({ bookingId: true }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if review exists and belongs to user
      const existingReview = await ctx.prisma.review.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      const review = await ctx.prisma.review.update({
        where: { id },
        data,
        include: {
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return review;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.prisma.review.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      await ctx.prisma.review.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Admin procedures
  adminList: adminProcedure
    .input(
      z.object({
        isPublished: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        rating: z.number().int().min(1).max(5).optional(),
        userId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["created", "updated", "rating"]).default("created"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { isPublished, isVerified, rating, userId, limit, cursor, sortBy, sortOrder } = input;

      const where: any = {};
      if (isPublished !== undefined) where.isPublished = isPublished;
      if (isVerified !== undefined) where.isVerified = isVerified;
      if (rating) where.rating = rating;
      if (userId) where.userId = userId;

      const orderBy: any = {};
      switch (sortBy) {
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "updated":
          orderBy.updatedAt = sortOrder;
          break;
        case "rating":
          orderBy.rating = sortOrder;
          break;
      }

      const items = await ctx.prisma.review.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              startTime: true,
              package: {
                select: {
                  name: true,
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

  adminUpdate: adminProcedure
    .input(updateReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingReview = await ctx.prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      const review = await ctx.prisma.review.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return review;
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.prisma.review.findUnique({
        where: { id: input.id },
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Değerlendirme bulunamadı",
        });
      }

      await ctx.prisma.review.delete({
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
      const review = await ctx.prisma.review.update({
        where: { id: input.id },
        data: { isPublished: input.isPublished },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return review;
    }),

  toggleVerify: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isVerified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.update({
        where: { id: input.id },
        data: { isVerified: input.isVerified },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              customerName: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return review;
    }),

  adminStats: adminProcedure.query(async ({ ctx }) => {
    const [total, published, unpublished, verified, average, recent] = await Promise.all([
      ctx.prisma.review.count(),
      ctx.prisma.review.count({ where: { isPublished: true } }),
      ctx.prisma.review.count({ where: { isPublished: false } }),
      ctx.prisma.review.count({ where: { isVerified: true } }),
      ctx.prisma.review.aggregate({
        _avg: { rating: true },
      }),
      ctx.prisma.review.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
          },
        },
      }),
    ]);

    return {
      total,
      published,
      unpublished,
      verified,
      average: average._avg.rating || 0,
      recent,
    };
  }),
});
