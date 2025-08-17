import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { z } from 'zod';
import { JwtPayloadSchema } from "@gopiyadav989/unpolished"
import { authMiddleware, semiAuthMiddleware } from '../middlewares/autMiddleware';

export const profileRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user: JwtPayloadSchema
    }
}>();

// GET /api/v1/profile/:username - Get user profile by username
profileRouter.get('/:username', semiAuthMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const username = c.req.param('username');
        const currentUser = c.get("user");

        // Determine if this is the profile owner
        const isOwnProfile = currentUser?.username === username;

        // Optimize: Single query - we'll handle email filtering after the main query

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                firstName: isOwnProfile, // so that he can edit
                lastName: isOwnProfile,
                bio: true,
                profileImage: true,
                coverImage: true,
                website: true,
                location: true,
                twitterHandle: true,
                linkedinUrl: true,
                githubUrl: true,
                instagramUrl: true,
                createdAt: true,
                isAuthor: true,
                email: true, // Always include email, we'll filter it later based on showEmail
                // Private data only for profile owner
                emailNotifications: isOwnProfile,
                pushNotifications: isOwnProfile,
                dateOfBirth: isOwnProfile,
                authorProfile: {
                    select: {
                        tagline: true,
                        expertise: true,
                        totalViews: true,
                        totalLikes: true,
                        totalFollowers: true,
                        showEmail: true
                    }
                }
            }
        });

        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

        // Get comprehensive counts
        const [blogCount, draftCount, followerCount, followingCount, commentCount, likeCount, bookmarkCount] = await Promise.all([
            prisma.blog.count({
                where: {
                    authorId: user.id,
                    status: 'PUBLISHED'
                }
            }),
            // Draft count only for profile owner
            isOwnProfile ? prisma.blog.count({
                where: {
                    authorId: user.id,
                    status: 'DRAFT'
                }
            }) : Promise.resolve(0),
            prisma.follow.count({
                where: { followingId: user.id }
            }),
            prisma.follow.count({
                where: { followerId: user.id }
            }),
            prisma.comment.count({
                where: {
                    userId: user.id,
                    status: 'APPROVED'
                }
            }),
            prisma.blogLike.count({
                where: { userId: user.id }
            }),
            prisma.bookmark.count({
                where: { userId: user.id }
            })
        ]);

        // Check if current user follows this profile
        let isFollowing = false;
        if (currentUser && currentUser.id !== user.id) {
            const followRelation = await prisma.follow.findFirst({
                where: {
                    followerId: currentUser.id,
                    followingId: user.id
                }
            });
            isFollowing = !!followRelation;
        }

        // Get recent published blogs
        const recentBlogs = await prisma.blog.findMany({
            where: {
                authorId: user.id,
                status: 'PUBLISHED'
            },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                featuredImage: true,
                publishedAt: true,
                readingTime: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
                status: true
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: 6
        });

        // Prepare response data with proper email filtering
        const responseData = {
            ...user,
            // Only include email if it's own profile OR if author has enabled showEmail
            email: (isOwnProfile || user.authorProfile?.showEmail) ? user.email : undefined,
            isFollowing,
            _count: {
                blogs: blogCount,
                drafts: draftCount,
                followers: followerCount,
                following: followingCount,
                comments: commentCount,
                likes: likeCount,
                bookmarks: bookmarkCount
            },
            recentBlogs
        };

        return c.json({
            user: responseData
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return c.json({ error: 'Failed to fetch profile' }, 500);
    }
});

// PUT /api/v1/profile - Update current user's profile
profileRouter.put('/', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");
        const body = await c.req.json();

        // Enhanced validation schema for complete profile update
        const enhancedProfileSchema = z.object({
            name: z.string().max(100).optional(),
            firstName: z.string().max(50).optional(),
            lastName: z.string().max(50).optional(),
            bio: z.string().max(500).optional(),
            profileImage: z.string().url().optional().or(z.literal('')),
            coverImage: z.string().url().optional().or(z.literal('')),
            website: z.string().url().optional().or(z.literal('')),
            location: z.string().max(100).optional(),
            twitterHandle: z.string().max(50).optional(),
            linkedinUrl: z.string().url().optional().or(z.literal('')),
            githubUrl: z.string().url().optional().or(z.literal('')),
            instagramUrl: z.string().url().optional().or(z.literal('')),
            emailNotifications: z.boolean().optional(),
            pushNotifications: z.boolean().optional(),
            dateOfBirth: z.string().optional().transform((val) => {
                if (!val) return undefined;
                // Handle both date string (YYYY-MM-DD) and datetime string
                const date = new Date(val);
                return isNaN(date.getTime()) ? undefined : date.toISOString();
            })
        });

        const validation = enhancedProfileSchema.safeParse(body);
        if (!validation.success) {
            return c.json({
                error: "Invalid input data",
                details: validation.error.errors
            }, 400);
        }

        const data = validation.data;

        // Update user profile with all fields
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio,
                profileImage: data.profileImage || null,
                coverImage: data.coverImage || null,
                website: data.website || null,
                location: data.location,
                twitterHandle: data.twitterHandle,
                linkedinUrl: data.linkedinUrl || null,
                githubUrl: data.githubUrl || null,
                instagramUrl: data.instagramUrl || null,
                emailNotifications: data.emailNotifications,
                pushNotifications: data.pushNotifications,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                updatedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                name: true,
                firstName: true,
                lastName: true,
                bio: true,
                profileImage: true,
                coverImage: true,
                website: true,
                location: true,
                twitterHandle: true,
                linkedinUrl: true,
                githubUrl: true,
                instagramUrl: true,
                emailNotifications: true,
                pushNotifications: true,
                dateOfBirth: true,
                updatedAt: true,
                isAuthor: true
            }
        });

        return c.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return c.json({ error: 'Failed to update profile' }, 500);
    }
});

// POST /api/v1/profile/author - Create or update author profile
profileRouter.post('/author', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");
        const body = await c.req.json();

        const authorSchema = z.object({
            tagline: z.string().max(200).optional(),
            expertise: z.array(z.string()).max(10).optional(),
            showEmail: z.boolean().optional()
        });

        const validation = authorSchema.safeParse(body);
        if (!validation.success) {
            return c.json({
                error: "Invalid input data",
                details: validation.error.errors
            }, 400);
        }

        const { tagline, expertise, showEmail } = validation.data;

        // Create or update author profile (don't automatically make user an author)
        // They become an author when they publish their first blog
        const authorProfile = await prisma.authorProfile.upsert({
            where: { userId: user.id },
            update: {
                tagline,
                expertise: expertise || [],
                showEmail: showEmail ?? false,
                updatedAt: new Date()
            },
            create: {
                userId: user.id,
                tagline,
                expertise: expertise || [],
                showEmail: showEmail ?? false
            }
        });

        return c.json({
            message: "Author profile updated successfully",
            authorProfile
        });

    } catch (error) {
        console.error('Error updating author profile:', error);
        return c.json({ error: 'Failed to update author profile' }, 500);
    }
});

// POST /api/v1/profile/:userId/follow - Follow a user
profileRouter.post('/:userId/follow', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const userId = c.req.param('userId');
        const currentUser = c.get("user");

        if (userId === currentUser.id) {
            return c.json({ error: "Cannot follow yourself" }, 400);
        }

        // Check if user exists
        const userToFollow = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!userToFollow) {
            return c.json({ error: "User not found" }, 404);
        }

        // Check if already following
        const existingFollow = await prisma.follow.findFirst({
            where: {
                followerId: currentUser.id,
                followingId: userId
            }
        });

        if (existingFollow) {
            return c.json({ error: "Already following this user" }, 400);
        }

        // Create follow relationship
        await prisma.follow.create({
            data: {
                followerId: currentUser.id,
                followingId: userId
            }
        });

        return c.json({ message: "Successfully followed user" });

    } catch (error) {
        console.error('Error following user:', error);
        return c.json({ error: 'Failed to follow user' }, 500);
    }
});

// DELETE /api/v1/profile/:userId/follow - Unfollow a user
profileRouter.delete('/:userId/follow', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const userId = c.req.param('userId');
        const currentUser = c.get("user");

        // Find 
        const followRelation = await prisma.follow.findFirst({
            where: {
                followerId: currentUser.id,
                followingId: userId
            }
        });

        if (!followRelation) {
            return c.json({ error: "Not following this user" }, 400);
        }

        // and delete follow relationship
        await prisma.follow.delete({
            where: {
                id: followRelation.id
            }
        });

        return c.json({ message: "Successfully unfollowed user" });

    } catch (error) {
        console.error('Error unfollowing user:', error);
        return c.json({ error: 'Failed to unfollow user' }, 500);
    }
});

// GET /api/v1/profile/activity/drafts - Get user's draft articles
profileRouter.get('/activity/drafts', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");

        const drafts = await prisma.blog.findMany({
            where: {
                authorId: user.id,
                status: 'DRAFT'
            },
            select: {
                id: true,
                title: true,
                excerpt: true,
                featuredImage: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                slug: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return c.json({
            items: drafts.map(draft => ({
                id: draft.id,
                title: draft.title,
                excerpt: draft.excerpt,
                featuredImage: draft.featuredImage,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                status: draft.status,
                slug: draft.slug
            }))
        });

    } catch (error) {
        console.error('Error fetching drafts:', error);
        return c.json({ error: 'Failed to fetch drafts' }, 500);
    }
});

// GET /api/v1/profile/activity/bookmarks - Get user's bookmarked articles
profileRouter.get('/activity/bookmarks', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                createdAt: true,
                blog: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        excerpt: true,
                        featuredImage: true,
                        publishedAt: true,
                        readingTime: true,
                        viewCount: true,
                        likeCount: true,
                        commentCount: true,
                        author: {
                            select: {
                                username: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({
            items: bookmarks.map(bookmark => ({
                id: bookmark.id,
                title: bookmark.blog.title,
                excerpt: bookmark.blog.excerpt,
                featuredImage: bookmark.blog.featuredImage,
                createdAt: bookmark.createdAt,
                blog: {
                    id: bookmark.blog.id,
                    slug: bookmark.blog.slug,
                    title: bookmark.blog.title,
                    author: bookmark.blog.author
                }
            }))
        });

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return c.json({ error: 'Failed to fetch bookmarks' }, 500);
    }
});

// GET /api/v1/profile/activity/liked - Get user's liked articles
profileRouter.get('/activity/liked', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");

        const likedBlogs = await prisma.blogLike.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                createdAt: true,
                blog: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        excerpt: true,
                        featuredImage: true,
                        publishedAt: true,
                        readingTime: true,
                        viewCount: true,
                        likeCount: true,
                        commentCount: true,
                        author: {
                            select: {
                                username: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({
            items: likedBlogs.map(like => ({
                id: like.id,
                title: like.blog.title,
                excerpt: like.blog.excerpt,
                featuredImage: like.blog.featuredImage,
                createdAt: like.createdAt,
                blog: {
                    id: like.blog.id,
                    slug: like.blog.slug,
                    title: like.blog.title,
                    author: like.blog.author
                }
            }))
        });

    } catch (error) {
        console.error('Error fetching liked articles:', error);
        return c.json({ error: 'Failed to fetch liked articles' }, 500);
    }
});

// GET /api/v1/profile/activity/comments - Get user's comments
profileRouter.get('/activity/comments', authMiddleware, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = c.get("user");

        const comments = await prisma.comment.findMany({
            where: {
                userId: user.id,
                status: 'APPROVED'
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                likeCount: true,
                blog: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        author: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({
            items: comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                likeCount: comment.likeCount,
                blog: comment.blog
            }))
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
    }
});
