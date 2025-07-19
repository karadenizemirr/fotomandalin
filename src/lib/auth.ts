import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Login validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    phone?: string | null;
  }

  interface Session {
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
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    phone?: string | null;
    provider?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gereklidir");
        }

        // Validate input
        const validatedFields = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validatedFields.success) {
          throw new Error("Geçersiz giriş bilgileri");
        }

        const { email, password } = validatedFields.data;

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              role: true,
              phone: true,
              emailVerified: true,
            },
          });

          if (!user || !user.password) {
            throw new Error("Geçersiz email veya şifre");
          }

          // Email doğrulama kontrolü kaldırıldı - artık zorunlu değil

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            throw new Error("Geçersiz email veya şifre");
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            phone: user.phone,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Giriş işlemi başarısız");
        }
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: "CUSTOMER", // Default role for OAuth users
          phone: null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.provider = account?.provider;
      }

      // Refresh user data on subsequent requests
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              phone: true,
            },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.phone = dbUser.phone;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.provider = token.provider;
      }

      return session;
    },

    async signIn({ user, account }) {
      // Allow credentials sign in
      if (account?.provider === "credentials") {
        return true;
      }

      // Handle OAuth sign in
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user exists, update their info
          if (existingUser) {
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name,
                image: user.image,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new user for OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "CUSTOMER",
                emailVerified: new Date(),
              },
            });
          }

          return true;
        } catch (error) {
          console.error("OAuth sign in error:", error);
          return false;
        }
      }

      return false;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account }) {
      console.warn(`User signed in: ${user.email} via ${account?.provider}`);
      
      // Log sign in event
      if (user.id) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "USER_LOGIN",
              entity: "User",
              entityId: user.id,
              changes: {
                provider: account?.provider,
                userAgent: "NextAuth",
                timestamp: new Date().toISOString(),
              },
            },
          });
        } catch (error) {
          console.error("Error logging sign in event:", error);
        }
      }
    },

    async signOut({ session, token }) {
      console.warn(`User signed out: ${session?.user?.email || token?.email}`);
      
      // Log sign out event
      if (token?.sub) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: token.sub,
              action: "USER_LOGOUT",
              entity: "User",
              entityId: token.sub,
              changes: {
                timestamp: new Date().toISOString(),
              },
            },
          });
        } catch (error) {
          console.error("Error logging sign out event:", error);
        }
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
  
  secret: process.env.NEXTAUTH_SECRET,
};
