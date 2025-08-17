// components/Profile/ProfileTabs.tsx
import { ArticleGrid } from './ArticleGrid';
import { PersonalActivity } from './PersonalActivity';
import { UserProfile } from '../../types/profile'; 

interface ProfileTabsProps {
  profile: UserProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
  onNavigate: (path: string) => void;
}

export function ProfileTabs({ 
  profile, 
  activeTab, 
  onTabChange, 
  isOwnProfile, 
  onNavigate 
}: ProfileTabsProps) {

  console.log(profile);

  
  const publicTabs = [
    { id: 'articles', label: 'Articles', count: profile._count.blogs }
  ];

  const privateTabs = [
    { id: 'drafts', label: 'Drafts', count: profile._count.drafts },
    { id: 'bookmarks', label: 'Bookmarks', count: profile._count.bookmarks },
    { id: 'liked', label: 'Liked', count: profile._count.likes },
    { id: 'comments', label: 'Comments', count: profile._count.comments }
  ];

  const tabs = isOwnProfile ? [...publicTabs, ...privateTabs] : publicTabs;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-100 overflow-x-auto">
        <nav className="flex space-x-8 px-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== null && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        
        {activeTab === 'articles' && (
          <ArticleGrid
            articles={profile.recentBlogs.filter(blog => blog.status === 'PUBLISHED')}
            onNavigate={onNavigate}
            isOwnProfile={isOwnProfile}
            title="Published Articles"
          />
        )}
        
        {isOwnProfile && activeTab === 'drafts' && (
          <PersonalActivity
            type="drafts"
            userId={profile.id}
            onNavigate={onNavigate}
          />
        )}
        
        {isOwnProfile && activeTab === 'bookmarks' && (
          <PersonalActivity
            type="bookmarks"
            userId={profile.id}
            onNavigate={onNavigate}
          />
        )}
        
        {isOwnProfile && activeTab === 'liked' && (
          <PersonalActivity
            type="liked"
            userId={profile.id}
            onNavigate={onNavigate}
          />
        )}
        
        {isOwnProfile && activeTab === 'comments' && (
          <PersonalActivity
            type="comments"
            userId={profile.id}
            onNavigate={onNavigate}
          />
        )}


      </div>
    </div>
  );
}
