// components/Profile/AboutSection.tsx
import { UserProfile } from './Profile';

interface AboutSectionProps {
  profile: UserProfile;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Bio Section */}
      {profile.bio && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Username</dt>
            <dd className="text-gray-900">@{profile.username}</dd>
          </div>
          
          {profile.name && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
              <dd className="text-gray-900">{profile.name}</dd>
            </div>
          )}
          
          {profile.location && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Location</dt>
              <dd className="text-gray-900">{profile.location}</dd>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Member Since</dt>
            <dd className="text-gray-900">{formatDate(profile.createdAt)}</dd>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Account Type</dt>
            <dd className="flex items-center gap-2">
              <span className="text-gray-900">
                {profile.isAuthor ? 'Author' : 'Reader'}
              </span>
              {profile.isAuthor && (
                <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </dd>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Articles Published</dt>
            <dd className="text-gray-900">{profile._count.blogs}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
