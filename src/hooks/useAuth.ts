import { useEffect } from 'react';
import { useUserStore } from '@/store/useStore';
import { authService } from '@/features/auth/authService';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useUserStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((profile) => {
      setUser(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, loading };
};
