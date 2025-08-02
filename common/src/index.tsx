import { z } from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    name: z.string().optional()
});

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string()
});

export const jwtPayloadSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string()
});

// Blog status enum to match database schema
export const BlogStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']);

export const createPostSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.union([z.string().min(10), z.any()]), // Allowing both string and JSON for BlockNote content
    excerpt: z.string(),
    featuredImage: z.string().optional(),
    status: BlogStatus.optional().default('DRAFT'),
    metaTitle: z.string().max(150).optional(),
    metaDescription: z.string().max(300).optional(),
    isPremium: z.boolean().optional().default(false),
    allowComments: z.boolean().optional().default(true),
    readingTime: z.number().optional()
});

export const updateProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional()
});

export const updatePostSchema = createPostSchema.partial().extend({
    id: z.string().uuid()
});

// Additional schemas for future features
export const createCategorySchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    parentId: z.string().uuid().optional()
});

export const createTagSchema = z.object({
    name: z.string().min(1).max(30),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

// Enhanced blog schema with SEO fields
export const createPostWithSEOSchema = createPostSchema.extend({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    scheduledFor: z.string().datetime().optional()
});

export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type JwtPayloadSchema = z.infer<typeof jwtPayloadSchema>
export type BlogStatusType = z.infer<typeof BlogStatus>
export type CreatePostSchema = z.infer<typeof createPostSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type UpdatePostSchema = z.infer<typeof updatePostSchema>
export type CreateCategorySchema = z.infer<typeof createCategorySchema>
export type CreateTagSchema = z.infer<typeof createTagSchema>
export type CreatePostWithSEOSchema = z.infer<typeof createPostWithSEOSchema>