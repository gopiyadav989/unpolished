// components/Profile/ProfileStats.tsx
import { Users, FileText } from 'lucide-react';
import { UserProfile } from '../../types/profile';

interface ProfileStatsProps {
  profile: UserProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {

  const formatNumber = (num?: number): string => {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString();
  };


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

  const displayStats = publicStats;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className={`grid gap-6 grid-cols-3`}>

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

      </div>
    </div>
  );
}
