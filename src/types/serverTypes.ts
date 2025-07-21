
// 📋 Input Validation Schemas
import {z} from "zod";

export const serviceCategoryListSchema = z.object({
    includeInactive: z.boolean().default(false),
    limit: z.number().int().min(1).max(100).default(50),
    cursor: z.string().optional(),
});

export const portfolioListSchema = z.object({
    featured: z.boolean().optional(),
    tag: z.string().optional(),
    limit: z.number().int().min(1).max(50).default(20),
    cursor: z.string().optional(),
    sortBy: z.enum(["created", "updated", "eventDate"]).default("eventDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const announcementListSchema = z.object({
    page: z.string().optional().default("/"),
    role: z.enum(["CUSTOMER", "ADMIN"]).default("CUSTOMER"),
});