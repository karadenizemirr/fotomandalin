import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../index";
import { ContactMessageStatus } from "@prisma/client";

// Contact form submission schema
const contactSubmissionSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
});

// Status update schema
const statusUpdateSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ContactMessageStatus),
  adminNotes: z.string().optional(),
});

// Get messages schema
const getMessagesSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const contactRouter = router({
  // Submit contact form (public endpoint)
  submit: publicProcedure
    .input(contactSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const contactMessage = await ctx.prisma.contactMessage.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            subject: input.subject,
            message: input.message,
            status: ContactMessageStatus.PENDING,
          },
        });

        return {
          success: true,
          message: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
          data: contactMessage,
        };
      } catch (error) {
        console.error("Contact form submission error:", error);
        throw new Error("Mesaj gönderilemedi. Lütfen tekrar deneyiniz.");
      }
    }),

  // Get contact messages (admin only)
  getMessages: protectedProcedure
    .input(getMessagesSchema)
    .query(async ({ ctx, input }) => {
      const where = input.status ? { status: input.status } : {};

      const [messages, total] = await Promise.all([
        ctx.prisma.contactMessage.findMany({
          where,
          orderBy: { submittedAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.contactMessage.count({ where }),
      ]);

      return {
        messages,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Update message status (admin only)
  updateStatus: protectedProcedure
    .input(statusUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.adminNotes !== undefined) {
        updateData.adminNotes = input.adminNotes;
      }

      if (input.status === ContactMessageStatus.REPLIED && !updateData.repliedAt) {
        updateData.repliedAt = new Date();
      }

      const updatedMessage = await ctx.prisma.contactMessage.update({
        where: { id: input.id },
        data: updateData,
      });

      return {
        success: true,
        message: "Mesaj durumu güncellendi",
        data: updatedMessage,
      };
    }),

  // Get message by ID (admin only)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const message = await ctx.prisma.contactMessage.findUnique({
        where: { id: input.id },
      });

      if (!message) {
        throw new Error("Mesaj bulunamadı");
      }

      return message;
    }),

  // Delete message (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.contactMessage.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Mesaj silindi",
      };
    }),

  // Get statistics (admin only)
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [total, pending, replied, resolved] = await Promise.all([
        ctx.prisma.contactMessage.count(),
        ctx.prisma.contactMessage.count({ where: { status: ContactMessageStatus.PENDING } }),
        ctx.prisma.contactMessage.count({ where: { status: ContactMessageStatus.REPLIED } }),
        ctx.prisma.contactMessage.count({ where: { status: ContactMessageStatus.RESOLVED } }),
      ]);

      // Get recent messages (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentMessages = await ctx.prisma.contactMessage.count({
        where: {
          submittedAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      return {
        total,
        pending,
        replied,
        resolved,
        recentMessages,
      };
    }),
});