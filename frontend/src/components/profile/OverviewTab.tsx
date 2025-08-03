// components/Profile/OverviewTab.tsx
import { ArticleGrid } from './ArticleGrid';
import { ActivityTimeline } from './ActivityTimeline';
import { UserProfile } from './Profile';

interface OverviewTabProps {
  profile: UserProfile;
  onNavigate: (path: string) => void;
  isOwnProfile: boolean;
}

export function OverviewTab({ profile, onNavigate, isOwnProfile }: OverviewTabProps) {
  // Only show last 3 published articles
  const recentArticles = profile.recentBlogs
    .filter(blog => blog.status === 'PUBLISHED')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Recent Articles - Only 3 */}
      <ArticleGrid
        articles={recentArticles}
        onNavigate={onNavigate}
        isOwnProfile={isOwnProfile}
        title="Recent Articles"
        showViewAll={profile._count.blogs > 3}
        onViewAll={() => {/* Navigate to articles tab */}}
      />

      {/* Activity Timeline - Meaningful replacement for Profile Information */}
      <ActivityTimeline 
        profile={profile} 
        isOwnProfile={isOwnProfile} 
        onNavigate={onNavigate}
      />
    </div>
  );
}
