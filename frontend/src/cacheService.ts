import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the structure of a blog
export interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    featuredImage?: string;
    publishedAt?: string;
    published: boolean;
    updatedAt: string;
    content: string;
    author: {
        id: string;
        name?: string;
        username: string;
        profileImage?: string;
    };
}


export interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface CachedPage {
    blogs: Blog[];
    pagination: PaginationData;
    lastFetched: number;
}

interface CachedInterest {
    interest: string;
    pages: {
        [pageNumber: number]: CachedPage;
    };
}

interface ActiveInterest {
    id: 'current';
    interest: string;
}

interface RecentlyEdited {
    slug: string,
    blog: Blog
}

interface RecentlyOpened {
    slug: string,
    blog: Blog,
    accessedAt: Date;
}




// IndexedDB schema 
interface BlogCacheDB extends DBSchema {
    cachedInterests: {
        key: string; // interest name
        value: CachedInterest;
    };
    activeInterest: {
        key: string; // -> 'current'
        value: ActiveInterest;
    };
    recentlyEdited: {
        key: string;  // -> 'i-still-miss-her'
        value: RecentlyEdited;
    };
    recentlyOpened: {
        key: string,
        value: RecentlyOpened
    }


}



class BlogCacheService {
    private db: IDBPDatabase<BlogCacheDB> | null = null;
    private readonly DB_NAME = 'unpolishedIndexDB';
    private readonly DB_VERSION = 1;
    private readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

    // Initialize the database and object stores
    private async init(): Promise<void> {
        if (this.db) return;
        this.db = await openDB<BlogCacheDB>(this.DB_NAME, this.DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('cachedInterests')) {
                    db.createObjectStore('cachedInterests', { keyPath: 'interest' });
                }
                if (!db.objectStoreNames.contains('activeInterest')) {
                    db.createObjectStore('activeInterest', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('recentlyEdited')) {
                    db.createObjectStore('recentlyEdited', { keyPath: 'slug' });
                }
                if (!db.objectStoreNames.contains('recentlyOpened')) {
                    db.createObjectStore('recentlyOpened', { keyPath: 'slug' })
                }
            },
        });
    }




    async cacheBlogs(interest: string, blogs: Blog[], pagination: PaginationData | undefined): Promise<void> {
        try {
            await this.init();
            if (!this.db) return;

            if (!pagination) {
                console.error("Pagination data is undefined");
                return;
            }    

            const tx = this.db.transaction('cachedInterests', 'readwrite');
            const store = tx.store;

            const existingData = await store.get(interest);

            const updatedPage : CachedPage =  {
                blogs,
                pagination,
                lastFetched: Date.now()
            }

            const cachedInterest: CachedInterest = {
                interest,
                pages: {
                    ...existingData?.pages,
                    [pagination.page]: updatedPage
                }
            };

            await store.put(cachedInterest);
            await tx.done;
        } catch (error) {
            console.error(`Failed to cache blogs for interest '${interest}':`, error);
        }
    }

    async getCachedBlogs(interest: string, page: number): Promise<{ blogs: Blog[], pagination: PaginationData } | null> {
        try {
            await this.init();
            if (!this.db) return null;

            const cachedInterest = await this.db.get('cachedInterests', interest);

            const pageData = cachedInterest?.pages?.[page];
            if (!pageData) return null;

            if (Date.now() - pageData.lastFetched > this.CACHE_EXPIRY) {
                return null;
            }

            return {
                blogs: pageData.blogs,
                pagination: pageData.pagination
            }
        }
        catch (e) {
            console.error(`Failed to get cached blogs for interest '${interest}':`, e);
            return null;
        }
    }

    async clearCache(): Promise<void> {
        try {
            await this.init();
            if (!this.db) return;

            const tx = this.db.transaction('cachedInterests', 'readwrite');
            await tx.store.clear();
            await tx.done;
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    // Check if cache for an interest needs refresh
    async shouldRefreshCache(interest: string, page: number = 1): Promise<boolean> {
        try {
            await this.init();
            if (!this.db) return true;

            const cachedInterest = await this.db.get('cachedInterests', interest);
            if (!cachedInterest) return true;

            return Date.now() - cachedInterest.pages[page].lastFetched > this.CACHE_EXPIRY;
        } catch (error) {
            console.error(`Failed to check refresh need for interest '${interest}':`, error);
            return true;
        }
    }


    // Set the active interest
    async setActiveInterest(interest: string): Promise<void> {
        try {
            await this.init();
            if (!this.db) return;

            const record: ActiveInterest = { id: 'current', interest };
            const tx = this.db.transaction('activeInterest', 'readwrite');
            await tx.store.put(record);
            await tx.done;
        } catch (error) {
            console.error(`Failed to set active interest '${interest}':`, error);
        }
    }

    // Get the active interest
    async getActiveInterest(): Promise<string | null> {
        try {
            await this.init();
            if (!this.db) return null;

            const record = await this.db.get('activeInterest', 'current');
            return record ? record.interest : null;
        } catch (error) {
            console.error('Failed to get active interest:', error);
            return null;
        }
    }


    async cacheRecentlyEditedBlog(blog: Blog): Promise<void> {
        try {

            await this.init();
            if (!this.db) return;

            if (blog.slug == "i-still-miss-her") {
                const tx = this.db.transaction('recentlyEdited', 'readwrite');
                const recentlyEditedBlog: RecentlyEdited = { slug: "i-still-miss-her", blog };
                await tx.store.put(recentlyEditedBlog);
                await tx.done;
            }

        }
        catch (e) {
            console.log("failed to cache recetly edited blog", e);
        }
    }

    async getRecentlyEditedBlog(): Promise<Blog | null> {
        try {
            await this.init();
            if (!this.db) return null;

            const recenltyEditedBlog = await this.db.get('recentlyEdited', 'i-still-miss-her');
            return recenltyEditedBlog ? recenltyEditedBlog.blog : null;
        }
        catch (e) {
            console.log("failed to get recently cached data: ", e);
            return null;
        }
    }



    async cacheRecentlyOpenedBlog(blog: Blog): Promise<void> {
        try {

            await this.init();
            if (!this.db) return;

            const tx = this.db.transaction('recentlyOpened', 'readwrite');
            const store = tx.store;

            const allEntries = await store.getAll();
            const filtered = allEntries.filter(entry => entry.slug !== blog.slug);
            filtered.unshift({ blog, accessedAt: new Date(), slug: blog.slug });

            const topFive = filtered.slice(0, 5);


            await store.clear();
            await Promise.all(
                topFive.map(entry => store.put(entry))
            )
            await tx.done;

        }
        catch (e) {
            console.log("failed to cache recenlty opene blog", e);
        }
    }

    async getRecentlyOpenedBlog(slug: string): Promise<Blog | null> {
        try {
            await this.init();
            if (!this.db) return null;

            const recentlyOpenedBlog = await this.db.get('recentlyOpened', slug);
            return recentlyOpenedBlog ? recentlyOpenedBlog.blog : null;

        }
        catch (e) {
            console.error('Failed to get recently opened blogs:', e);
            return null;
        }
    }



}

// Export singleton
const cacheService = new BlogCacheService();
export default cacheService;
