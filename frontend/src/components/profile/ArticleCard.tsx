// components/Profile/ArticleCard.tsx
import { Heart, MessageCircle, Eye, Clock } from 'lucide-react';
import { UserProfile } from './Profile';

interface ArticleCardProps {
  article: UserProfile['recentBlogs'][0];
  onNavigate: (path: string) => void;
}

export function ArticleCard({ article, onNavigate }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <article
      className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300"
      onClick={() => onNavigate(`/${article.slug}`)}
    >
      {article.featuredImage && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 mb-3 line-clamp-2 leading-tight">
          {article.title}
        </h4>
        
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(article.publishedAt)}</span>
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime} min read</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatNumber(article.viewCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(article.likeCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(article.commentCount)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
