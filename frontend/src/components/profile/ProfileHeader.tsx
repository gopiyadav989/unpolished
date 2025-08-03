// components/Profile/ProfileHeader.tsx
import { BarChart3, UserPlus, UserMinus, Loader2, Edit3 } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { UserProfile } from './Profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollow: () => void;
  onNavigate: (path: string) => void;
  onEdit: () => void; // New prop for modal trigger
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  isLoggedIn,
  isFollowing,
  followLoading,
  onFollow,
  onNavigate,
  onEdit
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
        {/* Profile Image */}
        <div className="relative -mt-20 md:-mt-24">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white p-1 shadow-xl">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name || profile.username}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600">
                  {(profile.name || profile.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {profile.isAuthor && (
            <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Author
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {profile.name || profile.username}
              </h1>
              <p className="text-lg text-gray-600">@{profile.username}</p>
              
              {/* Author tagline */}
              {profile.authorProfile?.tagline && (
                <p className="text-teal-600 font-medium italic">
                  {profile.authorProfile.tagline}
                </p>
              )}
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Expertise Tags */}
              {profile.authorProfile?.expertise && profile.authorProfile.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.authorProfile.expertise.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full border border-teal-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.authorProfile.expertise.length > 4 && (
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                      +{profile.authorProfile.expertise.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </>
              ) : isLoggedIn ? (
                <button
                  onClick={onFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Meta Info & Social Links */}
          <div className="mt-6 space-y-4">
            <SocialLinks profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
