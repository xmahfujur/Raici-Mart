import { useState, useEffect } from 'react';
import { collectionService, Collection } from '@/features/collections/collectionService';
import { useCollectionsStore } from '@/store/useStore';

export const useCollections = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { collections, setCollections } = useCollectionsStore();

  useEffect(() => {
    const unsubscribe = collectionService.subscribeToCollections((data) => {
      setCollections(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCollections]);

  return {
    collections,
    loading,
    error
  };
};
