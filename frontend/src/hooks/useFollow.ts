// hooks/useFollow.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export function useFollow(profileId?: string, initialIsFollowing?: boolean) {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(undefined);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(()=> {
    if(initialIsFollowing !== undefined){
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing]);

  const handleFollow = async () => {
    if (!profileId) return;

    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      return; // Navigate to signin
    }

    try {

      setFollowLoading(true);
      const token = localStorage.getItem('token');

      if (isFollowing) {
        await axios.delete(`${BACKEND_URL}/profile/${profileId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);

      } else {
        await axios.post(`${BACKEND_URL}/profile/${profileId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(true);
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);

    } finally {
      setFollowLoading(false);
    }
  };

  return { isFollowing, followLoading, handleFollow };
}
