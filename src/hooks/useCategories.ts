import { useState, useEffect } from 'react';
import { categoryService, Category } from '@/features/categories/categoryService';
import { useCategoriesStore } from '@/store/useStore';

export const useCategories = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categories, setCategories } = useCategoriesStore();

  useEffect(() => {
    const unsubscribe = categoryService.subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCategories]);

  return {
    categories,
    loading,
    error
  };
};
