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

export const createPostSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    published: z.boolean().optional()
});

export const updateProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional()
});

export const updatePostSchema = createPostSchema.partial().extend({
    id: z.string().uuid()
});

export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type JwtPayloadSchema = z.infer<typeof jwtPayloadSchema>
export type CreatePostSchema = z.infer<typeof createPostSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type UpdatePostSchema = z.infer<typeof updatePostSchema>