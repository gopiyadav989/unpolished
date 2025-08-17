// components/Profile/EditProfileModal.tsx
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import { UserProfile } from '../../types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: () => void;
}

export function EditProfileModal({ isOpen, onClose, profile, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    location: '',
    dateOfBirth: '',
    twitterHandle: '',
    linkedinUrl: '',
    githubUrl: '',
    instagramUrl: '',
    profileImage: '',
    coverImage: '',
    emailNotifications: true,
    pushNotifications: true,
    // Author specific (available to all users for future author upgrade)
    tagline: '',
    expertise: [] as string[],
    showEmail: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        twitterHandle: profile.twitterHandle || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        instagramUrl: profile.instagramUrl || '',
        profileImage: profile.profileImage || '',
        coverImage: profile.coverImage || '',
        emailNotifications: profile.emailNotifications ?? true,
        pushNotifications: profile.pushNotifications ?? true,
        tagline: profile.authorProfile?.tagline || '',
        expertise: profile.authorProfile?.expertise || [],
        showEmail: profile.authorProfile?.showEmail || false
      });
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // API Call: PUT /api/v1/profile
      // Sending: Complete profile update data
      // Expected Response: { message: string, user: UpdatedUser }
      await axios.put(`${BACKEND_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Always update author profile data (for future author upgrade or existing authors)
      // Update if there's any author-related data or if showEmail setting has changed
      if (formData.tagline || formData.expertise.length > 0 || formData.showEmail !== (profile.authorProfile?.showEmail || false)) {
        // API Call: POST /api/v1/profile/author
        // Sending: { tagline, expertise, showEmail }
        // Expected Response: { message: string, authorProfile: UpdatedAuthorProfile }
        await axios.post(`${BACKEND_URL}/profile/author`, {
          tagline: formData.tagline,
          expertise: formData.expertise,
          showEmail: formData.showEmail
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      onUpdate(); // Refresh profile data
      onClose();
      // Show success toast
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.expertise.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Tell people about yourself..."
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </div>
              </div>


            </div>

            {/* Professional Information - Available to all users */}
            <div className="space-y-6 border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                {!profile.isAuthor && (
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    Ready for when you become an author
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Full-stack Developer & Tech Writer"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Areas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Add a skill"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm border border-teal-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showEmail"
                  checked={formData.showEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, showEmail: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="showEmail" className="ml-3 text-sm text-gray-700">
                  Show email address on public profile
                  {!profile.isAuthor && (
                    <span className="text-xs text-gray-500 ml-2">(Available when you become an author)</span>
                  )}
                </label>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6 border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Username
                  </label>
                  <input
                    type="text"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="username or full URL"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter just your username or the full LinkedIn URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="username"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter just your GitHub username</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Username
                  </label>
                  <input
                    type="text"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="username"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter just your Instagram username</p>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-6 border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="emailNotifications" className="ml-3 text-sm text-gray-700">
                    Receive email notifications for likes, comments, and follows
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={formData.pushNotifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="pushNotifications" className="ml-3 text-sm text-gray-700">
                    Receive push notifications for important updates
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}





