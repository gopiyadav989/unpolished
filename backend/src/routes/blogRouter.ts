import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { z } from 'zod';
import slugify from 'slugify';
import { createPostSchema, updatePostSchema, JwtPayloadSchema } from "@gopiyadav989/unpolished"

import { authMiddleware, semiAuthMiddleware } from '../middlewares/autMiddleware';

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user: JwtPayloadSchema
    }
}>();


const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
});



blogRouter.post("/", authMiddleware, async (c) => {

    const user = c.get("user");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const body = await c.req.json();
        const validation = createPostSchema.safeParse(body);

        if (!validation.success) {
            return c.json({ error: "invalid input data", details: validation.error.errors }, 400);
        }

        const { title, content, excerpt, featuredImage, metaTitle, metaDescription, isPremium, allowComments, status, readingTime } = validation.data;

        const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
        const finalMetaTitle = metaTitle ?? title.slice(0, 150);
        const finalMetaDescription = metaDescription ?? (excerpt  ?? title.slice(0, 150));

        // If this is the user's first published blog, make them an author and create author profile
        if (status === 'PUBLISHED') {
            const userRecord = await prisma.user.findUnique({
                where: { id: user.id },
                select: { isAuthor: true }
            });

            if (!userRecord?.isAuthor) {
                // Update user to be an author
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isAuthor: true }
                });

                // Create author profile if it doesn't exist
                await prisma.authorProfile.upsert({
                    where: { userId: user.id },
                    update: {}, // Don't update if exists
                    create: {
                        userId: user.id,
                        tagline: null,
                        expertise: [],
                        showEmail: false
                    }
                });
            }
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                excerpt,
                featuredImage,
                status,
                slug,
                authorId: user.id,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                metaTitle: finalMetaTitle,
                metaDescription: finalMetaDescription,
                isPremium,
                allowComments,
                readingTime
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profileImage: true
                    }
                }
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

blogRouter.put('/', authMiddleware, async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = c.get("user");

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
            }
        });

        if (!existingBlog) {
            return c.json({ error: "Blog not found or you don't have permission to edit it" }, 404);
        }

        let publishedAt = existingBlog.publishedAt;
        if (data.status === 'PUBLISHED' && existingBlog.status !== 'PUBLISHED') {
            publishedAt = new Date();
            
            // If this is the user's first published blog, make them an author and create author profile
            const userRecord = await prisma.user.findUnique({
                where: { id: user.id },
                select: { isAuthor: true }
            });

            if (!userRecord?.isAuthor) {
                // Update user to be an author
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isAuthor: true }
                });

                // Create author profile if it doesn't exist
                await prisma.authorProfile.upsert({
                    where: { userId: user.id },
                    update: {}, // Don't update if exists
                    create: {
                        userId: user.id,
                        tagline: null,
                        expertise: [],
                        showEmail: false
                    }
                });
            }
        } else if (data.status && data.status !== 'PUBLISHED') {
            publishedAt = null;
        }

        const updatedBlog = await prisma.blog.update({
            where: {
                id
            },
            data: {
                ...data,
                publishedAt,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profileImage: true
                    }
                }
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

    try {

        const query = c.req.query();
        const { page, limit } = paginationSchema.parse({
            page: query.page,
            limit: query.limit
        })

        const skip = (page - 1) * limit;

        const [totalCount, blogs] = await Promise.all([
            prisma.blog.count({
                where: {
                    status: 'PUBLISHED'
                }
            }),
            prisma.blog.findMany({
                where: {
                    status: 'PUBLISHED'
                },
                skip,
                take: limit,
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profileImage: true
                        }
                    }
                }
            })
        ])


        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return c.json({
            message: "blogs fetched successfully",
            blogs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext,
                hasPrev
            }
        }, 200)

    }
    catch (e) {
        console.error("Error updating blog:", e);
        return c.json({ error: "Failed to update the blog" }, 500);

    }

})



blogRouter.get('/bulkPrivate', authMiddleware, async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = c.get("user")

    try {

        const query = c.req.query();
        const { page, limit } = paginationSchema.parse({
            page: query.page,
            limit: query.limit
        });

        const skip = (page - 1) * limit;

        const [totalCount, blogs] = await Promise.all([
            prisma.blog.count({
                where: {
                    authorId: user.id
                }
            }),
            prisma.blog.findMany({
                where: {
                    authorId: user.id
                },
                skip,
                take: limit,
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profileImage: true
                        }
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return c.json({
            message: "blogs fetched successfully",
            blogs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext,
                hasPrev
            }
        }, 200)

    }
    catch (e) {
        console.error("Error updating blog:", e);
        return c.json({ error: "Failed to update the blog" }, 500);

    }

})



blogRouter.get('/:slug', semiAuthMiddleware, async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const slug = c.req.param('slug');
    const user = c.get("user");

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
            return c.json({ error: "Not found" }, 404);
        }
        if (blog.status !== 'PUBLISHED' && (!user || user.id !== blog.authorId)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        return c.json({
            blog,
        }, 200);

    }
    catch (e) {

        console.error('Error fetching blog:', e);
        return c.json({ error: 'Failed to fetch post' }, 500);

    }
})

blogRouter.delete('/:slug', authMiddleware, async (c) => {

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

        await prisma.blog.delete({
            where: { slug }
        });

        return c.json({
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return c.json({ error: 'Failed to delete post' }, 500);
    }
});