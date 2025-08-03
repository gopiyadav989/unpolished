// components/Profile/PersonalActivity.tsx
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Edit, Clock, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';

interface PersonalActivityProps {
  type: 'drafts' | 'bookmarks' | 'liked' | 'comments';
  userId: string;
  onNavigate: (path: string) => void;
}

interface ActivityItem {
  id: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  blog?: {
    id: string;
    title: string;
    slug: string;
    author: {
      name?: string;
      username: string;
    };
  };
  content?: string; // for comments
}

export function PersonalActivity({ type, userId, onNavigate }: PersonalActivityProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalActivity();
  }, [type, userId]);

  const fetchPersonalActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (type) {
        case 'drafts':
          endpoint = `/profile/activity/drafts`;
          break;
        case 'bookmarks':
          endpoint = `/profile/activity/bookmarks`;
          break;
        case 'liked':
          endpoint = `/profile/activity/liked`;
          break;
        case 'comments':
          endpoint = `/profile/activity/comments`;
          break;
      }
      
      // API Call: GET /api/v1/profile/activity/{type}
      // Expected Response: { items: ActivityItem[] }
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setItems(response.data.items);
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Failed to load ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'drafts': return Edit;
      case 'bookmarks': return Bookmark;
      case 'liked': return Heart;
      case 'comments': return MessageCircle;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'drafts': return 'Draft Articles';
      case 'bookmarks': return 'Bookmarked Articles';
      case 'liked': return 'Liked Articles';
      case 'comments': return 'Your Comments';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const Icon = getIcon();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {type} found
        </h3>
        <p className="text-gray-500">
          {type === 'drafts' && "Start writing to see your drafts here"}
          {type === 'bookmarks' && "Bookmark articles you want to read later"}
          {type === 'liked' && "Like articles to see them here"}
          {type === 'comments' && "Your comments on articles will appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-teal-600" />
        <h3 className="text-xl font-bold text-gray-900">{getTitle()}</h3>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            {type === 'comments' ? (
              // Comment layout
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>On:</span>
                      <button
                        onClick={() => onNavigate(`/${item.blog?.slug}`)}
                        className="text-teal-600 hover:text-teal-700 hover:underline font-medium"
                      >
                        {item.blog?.title}
                      </button>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-4" />
                </div>
              </div>
            ) : (
              // Article layout (drafts, bookmarks, liked)
              <div className="flex gap-4">
                {item.featuredImage && (
                  <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 
                        className="font-medium text-gray-900 hover:text-teal-600 cursor-pointer mb-1 line-clamp-2"
                        onClick={() => {
                          if (type === 'drafts') {
                            onNavigate(`/write/${item.id}`); // Edit draft
                          } else {
                            onNavigate(`/${item.blog?.slug || item.id}`); // View article
                          }
                        }}
                      >
                        {item.title}
                      </h4>
                      
                      {item.excerpt && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {type === 'drafts' && (
                          <>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Last edited {formatDate(item.updatedAt || item.createdAt)}</span>
                            </div>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              Draft
                            </span>
                          </>
                        )}
                        
                        {(type === 'bookmarks' || type === 'liked') && item.blog && (
                          <>
                            <span>by {item.blog.author.name || item.blog.author.username}</span>
                            <span>•</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
