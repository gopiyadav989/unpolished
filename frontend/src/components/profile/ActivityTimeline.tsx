// components/Profile/ActivityTimeline.tsx
import { Calendar, FileText, TrendingUp } from 'lucide-react';
import { UserProfile } from './Profile';

interface ActivityTimelineProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onNavigate: (path: string) => void;
}

export function ActivityTimeline({ profile, isOwnProfile }: ActivityTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Sample activity data - in real app, this comes from API
  const activities = [
    {
      id: '1',
      type: 'achievement',
      icon: TrendingUp,
      title: 'Milestone Reached',
      description: `Reached ${profile._count.followers} followers`,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: '2', 
      type: 'publish',
      icon: FileText,
      title: 'Published Article',
      description: profile.recentBlogs[0]?.title || 'Latest article',
      timestamp: profile.recentBlogs[0]?.publishedAt || profile.createdAt,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: '3',
      type: 'join',
      icon: Calendar,
      title: 'Joined Platform',
      description: 'Started their journey',
      timestamp: profile.createdAt,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {isOwnProfile ? 'Your Activity Timeline' : 'Activity Timeline'}
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className={`p-2 rounded-lg border ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1">
                {activity.title}
              </h4>
              <p className="text-gray-600 text-sm mb-2">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {profile.authorProfile && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
          <h4 className="font-semibold text-gray-900 mb-4">Author Insights</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {((profile.authorProfile.totalViews / Math.max(profile._count.blogs, 1)) || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Avg. Views/Article</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((profile.authorProfile.totalLikes / Math.max(profile._count.blogs, 1)) || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg. Likes/Article</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
