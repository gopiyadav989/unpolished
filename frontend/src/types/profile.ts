export interface UserProfile {
    id: string;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    website?: string;
    location?: string;
    dateOfBirth?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    instagramUrl?: string;
    email?: string; // Available when showEmail is true or for profile owner
    createdAt: string;
    isAuthor: boolean;
    isFollowing: boolean;
    emailNotifications?: boolean; // Only for profile owner
    pushNotifications?: boolean; // Only for profile owner
    _count: {
      blogs: number;
      followers: number;
      following: number;
      drafts: number;
      bookmarks: number;
      comments: number;
      likes: number;
    };
    recentBlogs: Array<{
      id: string;
      slug: string;
      title: string;
      excerpt?: string;
      featuredImage?: string;
      publishedAt: string;
      readingTime?: number;
      viewCount: number;
      likeCount: number;
      commentCount: number;
      status: string;
    }>;
    authorProfile?: {
      tagline?: string;
      expertise: string[];
      totalViews: number;
      totalLikes: number;
      showEmail: boolean;
    };
  }