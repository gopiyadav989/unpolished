import { useState, useEffect, useCallback} from 'react';
import { Search, BookOpen } from 'lucide-react';
import BlogCard from './BlogCard';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { InterestBar } from './InterestBar';
import cacheService from '../cacheService';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  published: boolean;
  updatedAt: string;
  content: string,
  author: {
    id: string;
    name?: string;
    username: string;
    profileImage?: string;
  };
}

interface BlogFeedProps {
  initialBlogs?: Blog[];
}




export function BlogFeed({ initialBlogs = [] }: BlogFeedProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isLoading, setIsLoading] = useState(!initialBlogs.length);
  const [currentInterest, setCurrentInterest] = useState<string>('');
  const [error, setError] = useState<string | null>(null);


  // get blogs from backend
  const fetchBlogsForInterest = useCallback(async (interest: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

      const res = await axios.get(`${BACKEND_URL}/blog/bulk`, {
        params: { interest: interest !== 'For You' ? interest : undefined },
        headers: token ? { Authorization: token } : {}
      });

      const data = res.data;

      if (data.blogs) {
        await cacheService.cacheBlogs(interest, data.blogs);
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.error(`Error fetching blogs for interest ${interest}:`, e);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  // get blogs from db store
  const handleInterestChange = useCallback(async (interest: string) => {
    setCurrentInterest(interest);

    try {
      setIsLoading(true);

      const cachedBlogs = await cacheService.getCachedBlogs(interest);

      if (cachedBlogs) {
        setBlogs(cachedBlogs);
        setIsLoading(false);
      } else {
        await fetchBlogsForInterest(interest);
      }
    } catch (e) {
      console.error(`Error handling interest change to ${interest}:`, e);
      setError('Failed to load articles. Please try again later.');
      setIsLoading(false);
    }
  }, [fetchBlogsForInterest]);





  // Retry loading blogs
  const handleRetry = useCallback(() => {
    if (currentInterest) {
      fetchBlogsForInterest(currentInterest);
    } else {
      handleInterestChange('For You');
    }
  }, [currentInterest]);



  // get fresh data when user pressed ctrl/cmd + r
  useEffect(() => {

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        await fetchBlogsForInterest(currentInterest);

      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Interest Bar with handler for interest changes */}
      <InterestBar onInterestChange={handleInterestChange} />

      {/* Blog List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col gap-8 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="md:w-1/3 h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="mb-4 text-gray-400">
            <BookOpen size={48} className="mx-auto" />
          </div>
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : blogs.length > 0 ? (
        <div>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.slug}
              {...blog}
              readTime={Math.floor(blog.content.length / 200) || 3}
              commentCount={Math.floor(Math.random() * 20)} // Mock data
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4 text-gray-400">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-gray-700 font-medium">No articles found</p>
          <p className="text-gray-500">
            {currentInterest && `No articles available for ${currentInterest}. Check back later.`}
          </p>
        </div>
      )}
    </div>
  );
}