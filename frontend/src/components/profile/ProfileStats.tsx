// components/Profile/ProfileStats.tsx
import { Users, FileText, Heart, MessageCircle, Bookmark, Edit } from 'lucide-react';
import { UserProfile } from './Profile';

interface ProfileStatsProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export function ProfileStats({ profile, isOwnProfile }: ProfileStatsProps) {
  const formatNumber = (num: number | undefined) => {
    if (typeof num !== 'number') return '0'; // or handle it differently if needed
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };
  

  // Public stats (visible to everyone)
  const publicStats = [
    {
      icon: FileText,
      label: 'Published',
      value: formatNumber(profile._count.blogs),
      color: 'text-blue-600'
    },
    {
      icon: Users,
      label: 'Followers',
      value: formatNumber(profile._count.followers),
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'Following',
      value: formatNumber(profile._count.following),
      color: 'text-purple-600'
    }
  ];

  // Private stats (only for profile owner)
  const privateStats = [
    {
      icon: Edit,
      label: 'Drafts',
      value: formatNumber(profile._count.drafts),
      color: 'text-orange-600'
    },
    {
      icon: Heart,
      label: 'Liked',
      value: formatNumber(profile._count.likes),
      color: 'text-red-600'
    },
    {
      icon: MessageCircle,
      label: 'Comments',
      value: formatNumber(profile._count.comments),
      color: 'text-blue-500'
    },
    {
      icon: Bookmark,
      label: 'Bookmarks',
      value: formatNumber(profile._count.bookmarks),
      color: 'text-yellow-600'
    }
  ];

  const displayStats = isOwnProfile ? [...publicStats, ...privateStats] : publicStats;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className={`grid gap-6 ${isOwnProfile ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7' : 'grid-cols-3'}`}>
        {displayStats.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
        
        {/* Author specific stats */}
        {profile.authorProfile && (
          <>
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(profile.authorProfile.totalViews)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(profile.authorProfile.totalLikes)}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
