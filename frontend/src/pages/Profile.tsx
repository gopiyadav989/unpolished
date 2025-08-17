// components/Profile/Profile.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { LoadingSpinner } from '../components/profile/LoadingSpinner';
import { ErrorDisplay } from '../components/profile/ErrorDisplay';
import { useProfile } from '../hooks/useProfile';
import { useFollow } from '../hooks/useFollow';


export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('articles');
  const [showEditModal, setShowEditModal] = useState(false);

  const { profile, isLoading, error, refetch } = useProfile(username);
  const { isFollowing, followLoading, handleFollow } = useFollow(profile?.id, profile?.isFollowing);


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
              isFollowing={isFollowing || false}
              followLoading={followLoading}
              onFollow={handleFollow}
              onEdit={() => setShowEditModal(true)}
            />

            <ProfileStats profile={profile} />

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
