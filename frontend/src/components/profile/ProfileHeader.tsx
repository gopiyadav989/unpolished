// components/Profile/ProfileHeader.tsx
import { UserPlus, UserMinus, Loader2, Edit3, Mail, MapPin, Globe, Calendar, Award } from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { SocialLinks } from './SocialLinks';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollow: () => void;
  onEdit: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  isLoggedIn,
  isFollowing,
  followLoading,
  onFollow,
  onEdit
}: ProfileHeaderProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

          {/* Profile Image */}
          <div className="relative -mt-20 md:-mt-24 flex-shrink-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white p-1 shadow-lg">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name || profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-gray-600">
                    {(profile.name || profile.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {profile.isAuthor && (
              <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <Award className="w-3 h-3" />
                Author
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Name and Username */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {profile.name || profile.username}
              </h1>
              <p className="text-base text-gray-600">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Author tagline */}
            {profile.authorProfile?.tagline && (
              <p className="text-teal-600 font-medium italic">
                "{profile.authorProfile.tagline}"
              </p>
            )}

            {/* Meta Information Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}

              {/* Show email if available */}
              {profile.email && (isOwnProfile || profile.authorProfile?.showEmail) && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {profile.email}
                  </a>
                  {!isOwnProfile && profile.authorProfile?.showEmail && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Public
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Social Links Row */}
            <SocialLinks profile={profile} />

            {/* Expertise Tags */}
            {profile.authorProfile?.expertise && profile.authorProfile.expertise.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {profile.authorProfile.expertise.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.authorProfile.expertise.length > 5 && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      +{profile.authorProfile.expertise.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            {isOwnProfile ? (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : isLoggedIn ? (
              <button
                onClick={onFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

