import { z } from "zod";
import { router, adminProcedure } from "../index";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createAuditLogSchema = z.object({
  action: z.string().min(1, "Aksiyon gereklidir"),
  entity: z.string().min(1, "Varlık gereklidir"), 
  entityId: z.string().optional(),
  changes: z.any().optional(),
  userId: z.string().optional(),
  userRole: z.enum(["CUSTOMER", "ADMIN", "PHOTOGRAPHER"]).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const auditLogRouter = router({
  // Admin procedures only - audit logs are for admin monitoring
  list: adminProcedure
    .input(
      z.object({
        action: z.string().optional(),
        entity: z.string().optional(),
        userId: z.string().optional(),
        userRole: z.enum(["CUSTOMER", "ADMIN", "PHOTOGRAPHER"]).optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
        sortBy: z.enum(["created", "action", "entity"]).default("created"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        action, 
        entity, 
        userId, 
        userRole, 
        dateFrom, 
        dateTo, 
        limit, 
        cursor, 
        sortBy, 
        sortOrder 
      } = input;

      const where: any = {};
      if (action) where.action = { contains: action, mode: "insensitive" };
      if (entity) where.entity = { contains: entity, mode: "insensitive" };
      if (userId) where.userId = userId;
      if (userRole) where.userRole = userRole;
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orderBy: any = {};
      switch (sortBy) {
        case "created":
          orderBy.createdAt = sortOrder;
          break;
        case "action":
          orderBy.action = sortOrder;
          break;
        case "entity":
          orderBy.entity = sortOrder;
          break;
      }

      const items = await ctx.prisma.auditLog.findMany({
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

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const auditLog = await ctx.prisma.auditLog.findUnique({
        where: { id: input.id },
      });

      if (!auditLog) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Denetim kaydı bulunamadı",
        });
      }

      return auditLog;
    }),

  create: adminProcedure
    .input(createAuditLogSchema)
    .mutation(async ({ ctx, input }) => {
      const auditLog = await ctx.prisma.auditLog.create({
        data: input,
      });

      return auditLog;
    }),

  // Varlık bazlı denetim kayıtları
  getByEntity: adminProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.string(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { entity, entityId, limit, cursor } = input;

      const items = await ctx.prisma.auditLog.findMany({
        where: {
          entity,
          entityId,
        },
        orderBy: { createdAt: "desc" },
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

  // Kullanıcı bazlı denetim kayıtları
  getByUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const items = await ctx.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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

  // Son aktiviteler
  recentActivity: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return items;
    }),

  // İstatistikler
  stats: adminProcedure
    .input(
      z.object({
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { dateFrom, dateTo } = input;

      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [
        total,
        byAction,
        byEntity,
        byUserRole,
        recent24h,
        recentWeek,
      ] = await Promise.all([
        // Toplam kayıt sayısı
        ctx.prisma.auditLog.count({ where }),

        // Aksiyona göre dağılım
        ctx.prisma.auditLog.groupBy({
          by: ["action"],
          where,
          _count: { action: true },
          orderBy: { _count: { action: "desc" } },
          take: 10,
        }),

        // Varlığa göre dağılım
        ctx.prisma.auditLog.groupBy({
          by: ["entity"],
          where,
          _count: { entity: true },
          orderBy: { _count: { entity: "desc" } },
          take: 10,
        }),

        // Kullanıcı rolüne göre dağılım
        ctx.prisma.auditLog.groupBy({
          by: ["userRole"],
          where,
          _count: { userRole: true },
        }),

        // Son 24 saat
        ctx.prisma.auditLog.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Son hafta
        ctx.prisma.auditLog.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        total,
        recent24h,
        recentWeek,
        byAction: byAction.map(item => ({
          action: item.action,
          count: item._count.action,
        })),
        byEntity: byEntity.map(item => ({
          entity: item.entity,
          count: item._count.entity,
        })),
        byUserRole: byUserRole.map(item => ({
          userRole: item.userRole,
          count: item._count.userRole,
        })),
      };
    }),

  // Günlük aktivite trendi
  dailyTrend: adminProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const { days } = input;
      const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const logs = await ctx.prisma.auditLog.findMany({
        where: {
          createdAt: { gte: dateFrom },
        },
        select: {
          createdAt: true,
          action: true,
        },
      });

      // Günlük gruplama
      const dailyStats = logs.reduce((acc, log) => {
        const date = log.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count++;
        return acc;
      }, {} as Record<string, { date: string; count: number }>);

      return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
    }),

  // Temizlik işlemi (eski kayıtları sil)
  cleanup: adminProcedure
    .input(
      z.object({
        olderThanDays: z.number().int().min(30).max(365).default(90),
        dryRun: z.boolean().default(true), // Önce test modu
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { olderThanDays, dryRun } = input;
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      if (dryRun) {
        // Sadece silinecek kayıt sayısını döndür
        const count = await ctx.prisma.auditLog.count({
          where: {
            createdAt: { lt: cutoffDate },
          },
        });

        return {
          success: true,
          dryRun: true,
          recordsToDelete: count,
          cutoffDate,
        };
      } else {
        // Gerçek silme işlemi
        const result = await ctx.prisma.auditLog.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
          },
        });

        return {
          success: true,
          dryRun: false,
          deletedRecords: result.count,
          cutoffDate,
        };
      }
    }),

  // Toplu silme
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.auditLog.deleteMany({
        where: {
          id: { in: input.ids },
        },
      });

      return {
        success: true,
        deletedCount: result.count,
      };
    }),
});
