"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.updateProfileSchema = exports.createPostSchema = exports.jwtPayloadSchema = exports.signinInput = exports.signupInput = void 0;
const zod_1 = require("zod");
exports.signupInput = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(20),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional()
});
exports.signinInput = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
exports.jwtPayloadSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    email: zod_1.z.string()
});
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    content: zod_1.z.string().min(10),
    excerpt: zod_1.z.string().optional(),
    featuredImage: zod_1.z.string().optional(),
    published: zod_1.z.boolean().optional()
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().optional()
});
exports.updatePostSchema = exports.createPostSchema.partial().extend({
    id: zod_1.z.string().uuid()
});
