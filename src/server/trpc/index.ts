import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from "next-auth/next";
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/prisma/client';

// Extend the Session type
interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    phone?: string | null;
    provider?: string;
  };
}

// Context interface
export interface Context {
  session: ExtendedSession | null;
  prisma: typeof prisma;
  req?: NextRequest;
}

// Create context function
export const createContext = async (opts: { req?: NextRequest }): Promise<Context> => {
  let session = null;

  try {
    // Get session from NextAuth - only if we have headers (avoid unnecessary calls)
    if (opts.req?.headers) {
      session = await getServerSession(authOptions) as ExtendedSession | null;
    }
  } catch (error) {
    console.error('Error getting session:', error);
    // Don't throw, just continue with null session for public routes
  }

  // Return context with shared prisma instance
  return {
    session,
    prisma, // This uses the singleton instance
    req: opts.req,
  };
};

// Initialize TRPC
export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause
            : null,
      },
    };
  },
});

// Export router and procedures
export const createTRPCRouter = t.router;
export const router = t.router;
export const middleware = t.middleware;

// Simple base procedure without complex middleware
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Giriş yapmanız gerekiyor',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

// Admin middleware
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Giriş yapmanız gerekiyor',
    });
  }

  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Bu işlem için admin yetkisi gerekiyor',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

// Protected procedures - sadece auth kontrolü
export const protectedProcedure = publicProcedure.use(isAuthed);
export const adminProcedure = publicProcedure.use(isAdmin);
