import { useState, useEffect, useMemo } from 'react';
import { campaignService, Campaign } from '@/features/campaigns/campaignService';
import { Product } from '@/features/products/productService';
import { isWithinInterval } from 'date-fns';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = campaignService.subscribeToCampaigns((data) => {
      setCampaigns(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns.filter(c => {
      if (!c.isActive) return false;
      const start = c.startDate?.seconds ? new Date(c.startDate.seconds * 1000) : new Date(c.startDate);
      const end = c.endDate?.seconds ? new Date(c.endDate.seconds * 1000) : new Date(c.endDate);
      return isWithinInterval(now, { start, end });
    });
  }, [campaigns]);

  const getProductDiscount = (product: Product) => {
    if (!product.id) return null;
    
    // Find matching campaigns
    const relevantCampaigns = activeCampaigns.filter(c => {
      // Direct product match
      if (c.productIds.includes(product.id!)) return true;
      
      // Category match
      if (c.categoryIds && c.categoryIds.some(catName => {
        return product.category.toLowerCase() === catName.toLowerCase();
      })) return true;
      
      // Collection match
      if (c.collectionIds && c.collectionIds.some(colId => {
        return product.collectionId === colId;
      })) return true;

      return false;
    });

    if (relevantCampaigns.length === 0) return null;
    
    // Return max discount among relevant campaigns
    return Math.max(...relevantCampaigns.map(c => c.discountPercentage));
  };

  return { campaigns, activeCampaigns, getProductDiscount, loading };
};
