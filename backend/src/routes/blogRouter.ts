import { Hono } from 'hono'
import { PrismaClient } from '../../prisma/app/generated/prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { z } from 'zod';
import slugify from 'slugify';
import { createPostSchema, updatePostSchema } from '@gopiyadav989/unpolished';

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user: z.infer<typeof jwtPayloadSchema>
    }
}>();

export const jwtPayloadSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string()
});

blogRouter.use("/*", async (c, next) => {
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
});

blogRouter.post("/", async (c) => {

    const user = c.get("user");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    

    try {

        const body = await c.req.json();
        console.log(body);
        const validation = createPostSchema.safeParse(body);

        if (!validation.success) {
            return c.json({ error: "invalid input data", details: validation.error.errors }, 400);
        }

        const { title, content, excerpt, featuredImage, published = false } = validation.data;
        const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                excerpt,
                featuredImage,
                published,
                slug,
                authorId: user.id,
                publishedAt: published ? new Date() : null
            }
        });

        return c.json({
            message: "blog created successfully",
            blog
        }, 201)

    }
    catch (e) {
        console.log(e);
        return c.json({
            error: "error in creating blog",
        }, 500)
    }
})

blogRouter.put('/', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const data = await c.req.json();
    const user = c.get("user");

    if (!data || !data.id) {
        return c.json({ error: "Blog ID and data are required" }, 400);
    }

    try {

        const body = await c.req.json();
        const validation = updatePostSchema.safeParse(body);

        if (!validation.success) {
            return c.json({ error: 'Invalid input data', details: validation.error.errors }, 400);
        }

        const data = validation.data;
        const { id } = data;

        const existingBlog = await prisma.blog.findUnique({
            where: {
                id,
                authorId: user.id
            },
        });

        if (!existingBlog) {
            return c.json({ error: "Blog not found or you don't have permission to edit it" }, 404);
        }

        const updateData = {
            ...existingBlog,  // Existing blog data
            ...data,          // New data to update (overwrites fields)
            updatedAt: new Date(),  // Set the updated timestamp
        };

        if (!existingBlog) {
            return c.json({ error: "Blog not found" }, 404);
        }

        let publishedAt = existingBlog.publishedAt;
        if (data.published === true && !existingBlog.published) {
            publishedAt = new Date();
        }


        const updatedBlog = await prisma.blog.update({
            where: {
                id
            },
            data: {
                ...data,
                publishedAt,
                updatedAt: new Date()
            }
        })

        return c.json({
            message: "blog updated successfully",
            blog: updatedBlog
        }, 201);

    }
    catch (e) {

        console.error("Error updating blog:", e);
        return c.json({ error: "Failed to update the blog" }, 500);

    }
})

blogRouter.get('/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = c.get("user")

    try {

        const blogs = await prisma.blog.findMany({
            where: {
                authorId: user.id
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return c.json({
            message: "blogs fetched successfully",
            blogs
        }, 200)

    }
    catch (e) {
        console.error("Error updating blog:", e);
        return c.json({ error: "Failed to update the blog" }, 500);

    }

})

blogRouter.get('/:slug', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const slug = c.req.param('slug');

    try {

        const blog = await prisma.blog.findUnique({
            where: {
                slug
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profileImage: true
                    }
                }
            }
        });

        if (!blog) {
            return c.json({ error: "Blog not found" }, 404);
        }

        console.log(blog)

        return c.json({
            blog
        }, 200)

    }
    catch (e) {

        console.error('Error fetching blog:', e);
        return c.json({ error: 'Failed to fetch post' }, 500);

    }
})

blogRouter.delete('/:slug', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const slug = c.req.param('slug');
    const user = c.get("user");

    try {

        const existingBlog = await prisma.blog.findFirst({
            where: {
                slug,
                authorId: user.id
            }
        });

        if (!existingBlog) {
            return c.json({ error: "Blog not found or you don't have permission to delete it" }, 404);
        }

        // Delete post
        await prisma.blog.delete({
            where: {slug}
        });

        return c.json({
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return c.json({ error: 'Failed to delete post' }, 500);
    }
});