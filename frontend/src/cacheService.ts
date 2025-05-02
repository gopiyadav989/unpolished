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

// CachedInterest record stored per interest
interface CachedInterest {
    interest: string;
    blogs: Blog[];
    lastFetched: number;
}

// Active interest record
interface ActiveInterest {
    id: 'current';
    interest: string;
}

// IndexedDB schema definition
interface BlogCacheDB extends DBSchema {
    cachedInterests: {
        key: string; // interest name
        value: CachedInterest;
    };
    activeInterest: {
        key: string; // always 'current'
        value: ActiveInterest;
    };
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
            },
        });
    }

    // Store blogs for a specific interest
    async cacheBlogs(interest: string, blogs: Blog[]): Promise<void> {
        try {
            await this.init();
            if (!this.db) return;

            const cachedInterest: CachedInterest = {
                interest,
                blogs,
                lastFetched: Date.now(),
            };

            const tx = this.db.transaction('cachedInterests', 'readwrite');
            await tx.store.put(cachedInterest);
            await tx.done;
        } catch (error) {
            console.error(`Failed to cache blogs for interest '${interest}':`, error);
        }
    }




    // Get cached blogs for a specific interest if fresh
    async getCachedBlogs(interest: string): Promise<Blog[] | null> {
        try {
            await this.init();
            if (!this.db) return null;

            const cachedInterest = await this.db.get('cachedInterests', interest);
            if (!cachedInterest) return null;

            const now = Date.now();
            if (now - cachedInterest.lastFetched > this.CACHE_EXPIRY) {
                return null;
            }

            return cachedInterest.blogs;
        } catch (error) {
            console.error(`Failed to get cached blogs for interest '${interest}':`, error);
            return null;
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



    // Clear all cached interests
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
    async shouldRefreshCache(interest: string): Promise<boolean> {
        try {
            await this.init();
            if (!this.db) return true;

            const cachedInterest = await this.db.get('cachedInterests', interest);
            if (!cachedInterest) return true;

            return Date.now() - cachedInterest.lastFetched > this.CACHE_EXPIRY;
        } catch (error) {
            console.error(`Failed to check refresh need for interest '${interest}':`, error);
            return true;
        }
    }





}

// Export singleton
const cacheService = new BlogCacheService();
export default cacheService;
