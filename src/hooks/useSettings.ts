import { useState, useEffect } from 'react';
import { settingsService, AppSettings } from '@/features/settings/settingsService';
import { useSettingsStore } from '@/store/useStore';

export const useSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, setSettings } = useSettingsStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const unsubscribe = settingsService.subscribeToSettings((data) => {
      if (data) {
        setSettings(data);
      }
      setLoading(false);
      if (timer) clearTimeout(timer);
    });

    // Fallback: resolution after 5 seconds if no response from Firestore
    timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [setSettings]);

  const updateGlobalSettings = async (data: Partial<AppSettings>) => {
    try {
      await settingsService.updateSettings(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateGlobalSettings
  };
};
