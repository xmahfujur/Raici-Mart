import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from './productService';
import { useCartStore, useUIStore } from '@/store/useStore';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn, formatPrice } from '@/lib/utils';
import { useCampaigns } from '@/hooks/useCampaigns';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useUIStore();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getProductDiscount } = useCampaigns();
  const isWishlisted = isInWishlist(product.id!);
  
  const campaignDiscount = getProductDiscount(product);
  const basePrice = product.price;
  const hasCampaign = !!campaignDiscount;
  
  const finalPrice = hasCampaign 
    ? basePrice * (1 - (campaignDiscount || 0) / 100)
    : (product.discountedPrice || product.price);
    
  const hasDiscount = hasCampaign || !!product.discountedPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes, open quick view instead of adding immediately
    if (product.sizeType && product.sizeType !== 'none' && product.sizes && product.sizes.length > 0) {
      useUIStore.getState().setQuickViewProduct(product);
      return;
    }

    if (product.stock <= 0) {
      showToast("Out of stock", "error");
      return;
    }

    addItem({
      id: product.id!,
      name: product.title,
      price: finalPrice,
      image: product.images[0] || '',
      quantity: 1,
      deliveryType: product.deliveryType,
      deliveryChargeInsideDhaka: product.deliveryChargeInsideDhaka,
      deliveryChargeOutsideDhaka: product.deliveryChargeOutsideDhaka
    });
    showToast("Added to bag", "success");
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id!);
      showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full group">
        <div className="bg-white border border-[#f0f0f0] rounded-2xl h-full flex flex-col overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
          <div className="relative w-full aspect-[4/5] bg-[#f9f9f9] overflow-hidden">
            <img 
              src={product.images[0] || 'https://picsum.photos/seed/placeholder/400/600'} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken-p/400/600';
              }}
            />
            
            <button
              onClick={handleToggleWishlist}
              className={cn(
                "absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10",
                isWishlisted 
                  ? "bg-[#ff4d4f] text-white shadow-lg shadow-[#ff4d4f]/20" 
                  : "bg-white/90 text-[#8c8c8c] hover:text-[#ff4d4f] hover:bg-white"
              )}
            >
              <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
            </button>

            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                useUIStore.getState().setQuickViewProduct(product);
              }}
              className="absolute top-16 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#8c8c8c] hover:text-black hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden md:block shadow-sm translate-x-4 group-hover:translate-x-0"
              title="Quick View"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {product.rating >= 4.5 && (
              <div className="absolute top-3 left-3 bg-[#ffa940] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                TOP RATED
              </div>
            )}
            
            {hasCampaign ? (
              <div className={cn(
                "absolute top-3 left-3 bg-[#f5222d] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg",
                product.rating >= 4.5 && "top-11"
              )}>
                {campaignDiscount}% OFF
              </div>
            ) : product.discountedPrice && (
              <div className={cn(
                "absolute top-3 left-3 bg-[#141414] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg",
                product.rating >= 4.5 && "top-11"
              )}>
                SAVE ৳{Math.round(product.price - product.discountedPrice)}
              </div>
            )}
            
            {/* Quick Add Button Mobile friendly */}
            <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
              <Button 
                onClick={handleAddToCart}
                className="w-full h-10 bg-black text-white hover:bg-[#262626] rounded-lg font-bold text-[12px] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Quick Add
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col flex-grow p-4 md:p-5">
            <div className="mb-4">
              <p className="text-[11px] text-[#8c8c8c] font-medium uppercase tracking-wider mb-1">
                {product.category}
              </p>
              <h2 className="text-[15px] font-semibold text-[#262626] line-clamp-1 mb-2">
                {product.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[17px] font-bold",
                  hasDiscount ? "text-[#f5222d]" : "text-[#141414]"
                )}>
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-[13px] text-[#bfbfbf] line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
            
            {/* BD-specific Trust Tag */}
            <div className="mt-auto mb-4 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#52c41a]" />
              <span className="text-[11px] font-medium text-[#52c41a]">Cash on Delivery</span>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full h-11 bg-black text-white hover:bg-[#262626] rounded-xl font-bold text-[12px] md:hidden"
            >
              Add to Bag
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
