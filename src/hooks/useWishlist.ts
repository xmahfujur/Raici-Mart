import { useState, useEffect } from 'react';
import { wishlistService, WishlistItem } from '@/features/wishlist/wishlistService';
import { useUserStore } from '@/store/useStore';

export const useWishlist = () => {
  const { user } = useUserStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = wishlistService.subscribeToUserWishlist(user.uid, (items) => {
      setWishlistItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) throw new Error('You must be logged in to manage your wishlist');
    return wishlistService.toggleWishlist(user.uid, productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return { wishlistItems, toggleWishlist, isInWishlist, loading };
};
