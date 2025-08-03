// components/Profile/ArticleGrid.tsx
import { ArticleCard } from './ArticleCard';
import { UserProfile } from './Profile';

interface ArticleGridProps {
  articles: UserProfile['recentBlogs'];
  onNavigate: (path: string) => void;
  isOwnProfile: boolean;
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function ArticleGrid({ 
  articles, 
  onNavigate, 
  isOwnProfile,
  title,
  showViewAll = false, 
  onViewAll 
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isOwnProfile ? "You haven't published any articles yet" : "No articles published yet"}
        </h3>
        <p className="text-gray-500">
          {isOwnProfile ? "Start writing to showcase your expertise" : "Check back later for new content"}
        </p>
        {isOwnProfile && (
          <button
            onClick={() => onNavigate('/write')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Write your first article
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {title || (showViewAll ? 'Recent Articles' : 'All Articles')}
        </h3>
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            View all articles
          </button>
        )}
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
