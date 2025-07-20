import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../index";
import { AnnouncementType, UserRole } from "@prisma/client";

export const announcementRouter = createTRPCRouter({
  // Aktif duyuruları getir (public)
  getActive: publicProcedure
    .input(
      z.object({
        page: z.string().optional().default("/"),
        role: z.nativeEnum(UserRole).optional().default("CUSTOMER"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const announcements = await ctx.prisma.announcement.findMany({
        where: {
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: now } }
          ],
          AND: [
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } }
              ]
            },
            {
              OR: [
                { targetRoles: { isEmpty: true } }, // Tüm roller
                { targetRoles: { has: input.role } }      // Spesifik rol
              ]
            },
            {
              OR: [
                { targetPages: { isEmpty: true } }, // Tüm sayfalar
                { targetPages: { has: input.page } }      // Spesifik sayfa
              ]
            }
          ]
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Frontend formatına çevir
      return announcements.map(announcement => ({
        id: announcement.id,
        type: announcement.type.toLowerCase() as "info" | "warning" | "success" | "promotion",
        message: announcement.message,
        actionText: announcement.actionText,
        actionLink: announcement.actionLink,
        dismissible: announcement.dismissible,
        autoHide: announcement.autoHide,
        duration: announcement.duration,
        priority: announcement.priority
      }));
    }),

  // Tüm duyuruları getir (admin only)
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
        search: z.string().optional(),
        type: z.nativeEnum(AnnouncementType).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { page, limit, search, type, isActive } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } }
          ]
        }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive })
      };

      const [announcements, total] = await Promise.all([
        ctx.prisma.announcement.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { priority: "desc" },
            { createdAt: "desc" }
          ],
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        ctx.prisma.announcement.count({ where })
      ]);

      return {
        announcements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }),

  // Tek duyuru getir
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const announcement = await ctx.prisma.announcement.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!announcement) {
        throw new Error("Announcement not found");
      }

      return announcement;
    }),

  // Yeni duyuru oluştur (admin only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
        type: z.nativeEnum(AnnouncementType).default("INFO"),
        priority: z.number().default(0),
        actionText: z.string().optional(),
        actionLink: z.string().optional(),
        dismissible: z.boolean().default(true),
        autoHide: z.boolean().default(false),
        duration: z.number().optional(),
        targetRoles: z.array(z.nativeEnum(UserRole)).default([]),
        targetPages: z.array(z.string()).default([]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Validation
      if (input.autoHide && !input.duration) {
        throw new Error("Duration is required when autoHide is true");
      }

      if (input.startDate && input.endDate && input.startDate >= input.endDate) {
        throw new Error("End date must be after start date");
      }

      const announcement = await ctx.prisma.announcement.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return announcement;
    }),

  // Duyuru güncelle (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
        type: z.nativeEnum(AnnouncementType).optional(),
        priority: z.number().optional(),
        actionText: z.string().optional(),
        actionLink: z.string().optional(),
        dismissible: z.boolean().optional(),
        autoHide: z.boolean().optional(),
        duration: z.number().optional(),
        targetRoles: z.array(z.nativeEnum(UserRole)).optional(),
        targetPages: z.array(z.string()).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id, ...updateData } = input;

      // Duyuru var mı kontrol et
      const existingAnnouncement = await ctx.prisma.announcement.findUnique({
        where: { id }
      });

      if (!existingAnnouncement) {
        throw new Error("Announcement not found");
      }

      // Validation
      if (updateData.autoHide && !updateData.duration) {
        throw new Error("Duration is required when autoHide is true");
      }

      if (updateData.startDate && updateData.endDate && updateData.startDate >= updateData.endDate) {
        throw new Error("End date must be after start date");
      }

      const announcement = await ctx.prisma.announcement.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return announcement;
    }),

  // Duyuru sil (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Duyuru var mı kontrol et
      const existingAnnouncement = await ctx.prisma.announcement.findUnique({
        where: { id: input.id }
      });

      if (!existingAnnouncement) {
        throw new Error("Announcement not found");
      }

      await ctx.prisma.announcement.delete({
        where: { id: input.id }
      });

      return { success: true, message: "Announcement deleted successfully" };
    }),

  // Duyuru aktif/pasif (admin only)
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const announcement = await ctx.prisma.announcement.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return announcement;
    }),

  // Duyuru öncelik güncelle (admin only)
  updatePriority: protectedProcedure
    .input(z.object({ id: z.string(), priority: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const announcement = await ctx.prisma.announcement.update({
        where: { id: input.id },
        data: { priority: input.priority },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return announcement;
    }),
});
