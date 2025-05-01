import { z } from "zod";
export declare const signupInput: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    username: string;
    password: string;
    name?: string | undefined;
}>;
export declare const signinInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const jwtPayloadSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    id: string;
}, {
    email: string;
    username: string;
    id: string;
}>;
export declare const createPostSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    featuredImage: z.ZodOptional<z.ZodString>;
    published: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    published?: boolean | undefined;
}, {
    title: string;
    content: string;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    published?: boolean | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    profileImage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
}, {
    name?: string | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
}>;
export declare const updatePostSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    featuredImage: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    published: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title?: string | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    published?: boolean | undefined;
}, {
    id: string;
    title?: string | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    published?: boolean | undefined;
}>;
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type JwtPayloadSchema = z.infer<typeof jwtPayloadSchema>;
export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
