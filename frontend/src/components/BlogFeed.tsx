import { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import BlogCard from './BlogCard';
import { InterestBar } from './InterestBar';
import cacheService from '../cacheService';
import { ToastContainer } from './ui/Toast';
import { semiAuthenticatedGet } from '../utils/api';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  content: string;
  
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  
  // Status and publishing
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt?: string;
  scheduledFor?: string;
  
  // Engagement stats
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  
  // Reading time in minutes
  readingTime?: number;
  
  // Content settings
  allowComments: boolean;
  isPremium: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
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

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}




export function BlogFeed({ initialBlogs = [] }: BlogFeedProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isLoading, setIsLoading] = useState(!initialBlogs.length);
  const [currentInterest, setCurrentInterest] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });


  // get blogs from backend
  const fetchBlogsForInterest = useCallback(async (interest: string, page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await semiAuthenticatedGet(`/blog/bulk`, {
        params: {
          interest: interest !== 'For You' ? interest : undefined,
          page,
          limit: pagination.limit
        }
      });

      const data = res.data;

      if (data.blogs && data.pagination) {
        await cacheService.cacheBlogs(interest, data.blogs, data.pagination);
        setBlogs(data.blogs);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(`error fetching blogs for ${interest}:`, e);
      window.toast.error("Failed to load articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);


  // get blogs from db store
  const handleInterestChange = useCallback(async (interest: string) => {
    setCurrentInterest(interest);

    try {
      setIsLoading(true);

      const cachedBlogs = await cacheService.getCachedBlogs(interest, 1);

      if (cachedBlogs) {
        setBlogs(cachedBlogs.blogs);
        setPagination(cachedBlogs.pagination);
        setIsLoading(false);
      } else {
        await fetchBlogsForInterest(interest, 1);
      }
    } catch (e) {
      console.error(`Error handling interest change to ${interest}:`, e);
      setError('Failed to load articles. Please try again later.');
      setIsLoading(false);
    }
  }, [fetchBlogsForInterest]);


  //page change
  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage === pagination.page) return;

    try {
      setIsLoading(true);
      const cachedData = await cacheService.getCachedBlogs(currentInterest, newPage);

      if (cachedData && cachedData.blogs) {
        setBlogs(cachedData.blogs);
        setPagination(cachedData.pagination);
        setIsLoading(false);
      }
      else {
        await fetchBlogsForInterest(currentInterest, newPage);
      }

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 50);
    }
    catch (e) {
      console.error(`error in changing to ${newPage}: `, e);
      window.toast.error("failed to load more blogs");
      setIsLoading(false);
    }

  }, [currentInterest, pagination.page])


  // Retry loading blogs
  const handleRetry = useCallback(() => {
    if (currentInterest) {
      fetchBlogsForInterest(currentInterest, pagination.page);
    } else {
      handleInterestChange('For You');
    }
  }, [currentInterest, pagination.page]);



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
            className="mt-4 px-4 py-2 bg-black text-white rounded-full"
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`p-2 rounded-full ${pagination.hasPrev? 'bg-gray-200 hover:bg-gray-300 text-gray-700': 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(pageNum => {
                    const currentPage = pagination.page;
                    return ( pageNum === 1 || pageNum === pagination.totalPages ||Math.abs(pageNum - currentPage) <= 1);
                  })
                  .map((pageNum, index, array) => {
                    const previousPage = index > 0 ? array[index - 1] : null;
                    const showEllipsis = previousPage && pageNum - previousPage > 1;

                    return (
                      <div key={pageNum} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full ${pageNum === pagination.page? 'bg-black text-white': 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`p-2 rounded-full ${pagination.hasNext ? 'bg-gray-200 hover:bg-gray-300 text-gray-700': 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

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

      <ToastContainer />
    </div>
  );
}