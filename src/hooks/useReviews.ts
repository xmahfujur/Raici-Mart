import { useState, useEffect } from 'react';
import { reviewService, Review } from '@/features/reviews/reviewService';

export const useReviews = (productId: string | undefined) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    const unsubscribe = reviewService.subscribeToProductReviews(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  return { reviews, loading };
};
