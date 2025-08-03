// hooks/useFollow.ts
import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export function useFollow(profileId?: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!profileId) return;

    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      // Navigate to signin
      return;
    }

    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');

      if (isFollowing) {
        await axios.delete(`${BACKEND_URL}/profile/${profileId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);
        // Show success toast
      } else {
        await axios.post(`${BACKEND_URL}/profile/${profileId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(true);
        // Show success toast
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);
      // Show error toast
    } finally {
      setFollowLoading(false);
    }
  };

  return { isFollowing, followLoading, handleFollow, setIsFollowing };
}
