// components/Profile/ArticleCard.tsx
import { Heart, MessageCircle, Eye, Clock } from 'lucide-react';
import { UserProfile } from '../../types/profile';

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
      className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300 h-full flex flex-col"
      onClick={() => onNavigate(`/${article.slug}`)}
    >
      {/* Title - Fixed height */}
      <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 mb-3 line-clamp-2 leading-tight text-base h-12 overflow-hidden">
        {article.title}
      </h4>

      {/* Excerpt - Fixed height */}
      <div className="mb-4 h-16 overflow-hidden">
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {article.excerpt || 'No excerpt available...'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
        {/* Date and reading time */}
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

        {/* Stats */}
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
    </article>
  );
}
