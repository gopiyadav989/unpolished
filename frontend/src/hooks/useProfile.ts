// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { UserProfile } from '../types/profile'; 

export function useProfile(username?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      const response = await axios.get(`${BACKEND_URL}/profile/${username}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      setProfile(response.data.user);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
