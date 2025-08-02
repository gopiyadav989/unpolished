import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { z } from 'zod';
import { createCommentSchema, updateCommentSchema, JwtPayloadSchema } from "../../../common/src/index"
import { authMiddleware, semiAuthMiddleware } from '../middlewares/autMiddleware';
import { CommentStatus } from '@prisma/client';

export const commentRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user: JwtPayloadSchema
    }
}>();

const paginationSchema = z.object({
    limit: z.coerce.number().int().positive().max(50).default(20),
    offset: z.coerce.number().int().min(0).default(0)
});





// GET /api/v1/comments/:blogId - Fetch comments for a blog
commentRouter.get('/:blogId', semiAuthMiddleware, async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const blogId = c.req.param('blogId');
        const query = c.req.query();

        const { limit, offset } = paginationSchema.parse({
            limit: query.limit,
            offset: query.offset
        });

        // check for blog existance
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            select: { 
                id: true, 
                status: true, 
                authorId: true,
                allowComments: true 
            }
        });

        if (!blog) {
            return c.json({ error: "Blog not found" }, 404);
        }

        if (!blog.allowComments) {
            return c.json({ error: "Comments are disabled for this blog" }, 403);
        }

        const user = c.get("user");
        
        // if blog is not published then, then only the owner can access it
        if (blog.status !== 'PUBLISHED' && (!user || user.id !== blog.authorId)) {
            return c.json({ error: "Blog not accessible" }, 403);
        }

        const isOwner = user && user.id === blog.authorId;
        const whereClause = {
            blogId,
            parentId: null,
            ...(isOwner ? {} : { status: CommentStatus.APPROVED })
          };
          
          const nestedStatusFilter = isOwner ? {} : { status: CommentStatus.APPROVED };

        // Fetch top-level comments with their replies (nested)
        const comments = await prisma.comment.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profileImage: true
                    }
                },
                replies: {
                    where: nestedStatusFilter,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                profileImage: true
                            }
                        },
                        replies: {
                            where: nestedStatusFilter,
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                        profileImage: true
                                    }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit
        });

        // Get total count for pagination
        const totalCount = await prisma.comment.count({
            where: whereClause
        });

        return c.json({
            comments,
            pagination: {
                limit,
                offset,
                total: totalCount,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
    }
});



// POST /api/v1/comments/:blogId - Create a new comment
commentRouter.post('/blog/:blogId/comments', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        
        const blogId = c.req.param('blogId');
        const user = c.get("user");
        const body = await c.req.json();
        
        const validation = createCommentSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ 
                error: "Invalid input data", 
                details: validation.error.errors 
            }, 400);
        }

        const { content, parentId } = validation.data;

        // Verify blog exists and allows comments
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            select: { 
                id: true, 
                status: true, 
                authorId: true,
                allowComments: true 
            }
        });

        if (!blog) {
            return c.json({ error: "Blog not found" }, 404);
        }

        if (!blog.allowComments) {
            return c.json({ error: "Comments are disabled for this blog" }, 403);
        }

        // Check if blog is accessible
        if (blog.status !== 'PUBLISHED' && user.id !== blog.authorId) {
            return c.json({ error: "Cannot comment on unpublished blog" }, 403);
        }

        // If parentId is provided, verify the parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { id: true, blogId: true, parentId: true }
            });

            if (!parentComment) {
                return c.json({ error: "Parent comment not found" }, 404);
            }

            if (parentComment.blogId !== blogId) {
                return c.json({ error: "Parent comment belongs to different blog" }, 400);
            }


            // allowing nested comment upto 3 coz, recursion lagega
            if (parentComment.parentId) {
                const grandParent = await prisma.comment.findUnique({
                    where: { id: parentComment.parentId },
                    select: { parentId: true }
                });
                
                if (grandParent?.parentId) {
                    return c.json({ error: "Maximum nesting level reached" }, 400);
                }
            }
        }

        // creating comment
        const comment = await prisma.comment.create({
            data: {
                content,
                blogId,
                userId: user.id,
                parentId: parentId || null,
                status: 'APPROVED'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profileImage: true
                    }
                }
            }
        });


        await prisma.blog.update({
            where: { id: blogId },
            data: {
                commentCount: {
                    increment: 1
                }
            }
        });

        return c.json({
            message: "Comment created successfully",
            comment
        }, 201);

    } catch (error) {
        console.error('Error creating comment:', error);
        return c.json({ error: 'Failed to create comment' }, 500);
    }
});


// DELETE /api/v1/comments/:commentId - Delete a comment
commentRouter.delete('/comments/:commentId', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const commentId = c.req.param('commentId');
        const user = c.get("user");

        // getting the comment
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                blog: {
                    select: {
                        id: true,
                        authorId: true
                    }
                }
            }
        });

        if (!comment) {
            return c.json({ error: "Comment not found" }, 404);
        }

        // only comment's author or blog's author can delete
        const canDelete = comment.userId === user.id || comment.blog.authorId === user.id;
        
        if (!canDelete) {
            return c.json({ error: "Not authorized to delete this comment" }, 403);
        }

        // Count replies that will be deleted (for updating blog comment count)
        const replyCount = await prisma.comment.count({
            where: {
                OR: [
                    { parentId: commentId },                 // Direct replies
                    { parent: { parentId: commentId } }      // Replies to replies
                  ]
            }
        });

        // Delete the comment (CASCADE will delete all replies)
        await prisma.comment.delete({
            where: { id: commentId }
        });

        // Update blog comment count (subtract 1 for the comment + reply count)
        await prisma.blog.update({
            where: { id: comment.blogId },
            data: {
                commentCount: {
                    decrement: 1 + replyCount
                }
            }
        });

        return c.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return c.json({ error: 'Failed to delete comment' }, 500);
    }
});



// PUT /api/v1/comments/:commentId 
commentRouter.put('/comments/:commentId', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const commentId = c.req.param('commentId');
        const user = c.get("user");
        const body = await c.req.json();
        
        const validation = updateCommentSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ 
                error: "Invalid input data", 
                details: validation.error.errors 
            }, 400);
        }

        const { content } = validation.data;

        // Find the comment
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true }
        });

        if (!comment) {
            return c.json({ error: "Comment not found" }, 404);
        }

        // Only comment author can edit
        if (comment.userId !== user.id) {
            return c.json({ error: "Not authorized to edit this comment" }, 403);
        }

        // Update the comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { 
                content,
                updatedAt: new Date()
            },
            include: {
                user: {
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
            message: "Comment updated successfully",
            comment: updatedComment
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        return c.json({ error: 'Failed to update comment' }, 500);
    }
});