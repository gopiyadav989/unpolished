import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { z } from 'zod';

import { authMiddleware } from '../middlewares/autMiddleware';

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

const updateProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional()
});

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
                    where: { status: 'PUBLISHED' },
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

        return c.json({
            message: "User found successfully",
            user
        }, 200);

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
