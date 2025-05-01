import { Hono } from 'hono'
import { PrismaClient } from '../../prisma/app/generated/prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user: {
            id: string;
            username: string;
            email: string;
        }
    }
}>();

const jwtPayloadSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string()
});

const updateProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional()
});

const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";

    try {
        const payload = await verify(authHeader, c.env.JWT_SECRET);
        const parsedPaylod = jwtPayloadSchema.parse(payload);

        if (payload) {
            c.set("user", parsedPaylod)
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }

    }
    catch (e) {
        console.log(e);
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
})

userRouter.get("/:username", async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const username = c.req.param("username");

    try {

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                profileImage: true,
                createdAt: true,
                blogs: {
                    where: { published: true },
                    orderBy: { publishedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        featuredImage: true,
                        publishedAt: true
                    }
                }
            }
        })

        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

    }
    catch (e) {
        console.log(e);
        return c.json({
            error: "error while getting the user detials"
        }, 500)
    }
})

userRouter.put("/updateProfile", authMiddleware, async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = c.get("user");

    try {

        const body = await c.req.json();
        const validation = updateProfileSchema.safeParse(body);

        if(!validation.success){
            return c.json({ error: "invalid input data", details: validation.error.errors}, 400);
        }

        const updateData = validation.data;

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                bio: true,
                profileImage: true
            }
        });

        return c.json({
            message: "profile updated successfully",
            user: updatedUser
        })

    }
    catch (e) {
        console.log(e);
        return c.json({
            error: "error while updating data"
        }, 500);
    }

})
