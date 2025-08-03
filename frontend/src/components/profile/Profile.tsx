// components/Profile/Profile.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileTabs } from './ProfileTabs';
import { EditProfileModal } from './EditProfileModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { useProfile } from '../../hooks/useProfile';
import { useFollow } from '../../hooks/useFollow';

export interface UserProfile {
  id: string;
  username: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  website?: string;
  location?: string;
  dateOfBirth?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  createdAt: string;
  isAuthor: boolean;
  isFollowing: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  _count: {
    blogs: number;
    followers: number;
    following: number;
    drafts: number;
    bookmarks: number;
    comments: number;
    likes: number;
  };
  recentBlogs: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    featuredImage?: string;
    publishedAt: string;
    readingTime?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    status: string;
  }>;
  authorProfile?: {
    tagline?: string;
    expertise: string[];
    totalViews: number;
    totalLikes: number;
    showEmail: boolean;
  };
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { profile, isLoading, error, refetch } = useProfile(username);
  const { isFollowing, followLoading, handleFollow } = useFollow(profile?.id);

  const currentUserId = localStorage.getItem('userId');
  const isOwnProfile = currentUserId === profile?.id;
  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return <ErrorDisplay error={error} onGoHome={() => navigate('/')} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Cover Section */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-gray-800 via-gray-900 to-black">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 pb-8">
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              isLoggedIn={isLoggedIn}
              isFollowing={isFollowing}
              followLoading={followLoading}
              onFollow={handleFollow}
              onNavigate={navigate}
              onEdit={() => setShowEditModal(true)}
            />
            
            <ProfileStats profile={profile} isOwnProfile={isOwnProfile} />
            
            <ProfileTabs
              profile={profile}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOwnProfile={isOwnProfile}
              onNavigate={navigate}
            />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdate={refetch}
      />
    </>
  );
}
