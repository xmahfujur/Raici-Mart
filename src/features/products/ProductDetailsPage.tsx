import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ChevronLeft, Star, ShieldCheck, Truck, RotateCcw, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/Container';
import { useProductDetails } from '@/hooks/useProductDetails';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { useCartStore, useUIStore } from '@/store/useStore';
import { Loader } from '@/components/Loader';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useReviews } from '@/hooks/useReviews';
import { ReviewList } from '@/features/reviews/ReviewList';
import { ReviewForm } from '@/features/reviews/ReviewForm';

import { cn, formatPrice } from '@/lib/utils';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProductDetails(id);
  const { reviews, loading: reviewsLoading } = useReviews(id);
  const { products: allProducts } = useProducts();
  const { getProductDiscount } = useCampaigns();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useUIStore();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!", "success");
  };

  const campaignDiscount = product ? getProductDiscount(product) : null;
  const basePrice = product?.price || 0;
  const hasCampaign = !!campaignDiscount;
  
  const finalPrice = hasCampaign 
    ? basePrice * (1 - (campaignDiscount || 0) / 100)
    : (product?.discountedPrice || product?.price || 0);
    
  const hasDiscount = hasCampaign || !!product?.discountedPrice;

  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id && p.isActive)
      .slice(0, 4);
  }, [product, allProducts]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizeType !== 'none' && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    // Check stock for selected size
    if (product.sizeType !== 'none' && selectedSize) {
      const sizeInfo = product.sizes?.find(s => s.name === selectedSize);
      if (!sizeInfo || sizeInfo.stock <= 0) {
        showToast('This size is out of stock', 'error');
        return;
      }
    } else if (product.stock <= 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    addItem({
      id: product.id!,
      name: product.title,
      price: finalPrice,
      image: product.images[0] || '',
      quantity: 1,
      selectedSize: selectedSize || undefined,
      deliveryType: product.deliveryType,
      deliveryChargeInsideDhaka: product.deliveryChargeInsideDhaka,
      deliveryChargeOutsideDhaka: product.deliveryChargeOutsideDhaka
    });

    showToast('Product added to cart!', 'success');
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;
  if (error || !product) {
    return (
      <Container className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </Container>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#8d949e] hover:text-black transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Collections
        </Link>

        {/* Product Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Image Gallery - Left (60% Desktop) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-h-[500px] scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken-thumb/200/300';
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] bg-[#f0f2f5] rounded-2xl overflow-hidden relative group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken-main/600/800';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Product Info - Right (40% Desktop) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-8">
              <h3 className="text-[12px] text-[#8d949e] font-black uppercase tracking-[0.2em] mb-4">
                {product.category}
              </h3>
              <h1 className="text-[32px] md:text-[36px] font-bold text-black leading-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-[#ffc107] text-[#ffc107]' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-[13px] font-bold text-[#8d949e]">
                  {product.rating?.toFixed(1) || '0.0'} ({product.totalReviews || 0} Reviews)
                </span>
                <span className="text-[13px] font-bold text-[#8d949e] border-l border-gray-200 pl-4">
                  {product.soldCount || 0} Sold
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-[32px] font-black",
                  hasCampaign ? "text-red-500" : "text-black"
                )}>
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-[20px] text-[#8d949e] line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
                {hasCampaign ? (
                  <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">
                    Campaign {campaignDiscount}% OFF
                  </span>
                ) : product.discountedPrice && (
                  <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">
                    Save {Math.round((1 - product.discountedPrice / product.price) * 100)}%
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[#4b4f56] text-[15px] leading-relaxed mb-6">
                {product.description}
              </p>
              
              <div className="p-4 bg-[#f9f9f9] rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedSize 
                      ? (product.sizes?.find(s => s.name === selectedSize)?.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                      : product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-[14px] font-bold text-black">
                    {selectedSize 
                      ? (product.sizes?.find(s => s.name === selectedSize)?.stock || 0) > 0 
                        ? `Size In Stock (${product.sizes?.find(s => s.name === selectedSize)?.stock} units)` 
                        : 'Size Out of Stock'
                      : product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#8d949e]" />
                  <span className="text-[14px] text-black">
                    Inside Dhaka: <b>1-2 days</b>, Outside Dhaka: <b>2-4 days</b>
                  </span>
                </div>
              </div>
            </div>

            {product.sizeType !== 'none' && product.sizes && product.sizes.length > 0 && (
              <div className="mb-10 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-black uppercase tracking-widest text-[#8d949e]">Select Size</label>
                  {selectedSize && (
                    <span className="text-[12px] font-bold text-black">
                      Selected: <span className="uppercase">{selectedSize}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={size.stock <= 0}
                      className={cn(
                        "px-5 py-3 rounded-xl border-2 text-[13px] font-black uppercase transition-all",
                        selectedSize === size.name 
                          ? "bg-black border-black text-white" 
                          : size.stock > 0 
                            ? "bg-white border-[#f0f2f5] text-black hover:border-[#8d949e]" 
                            : "bg-[#f9f9f9] border-[#f9f9f9] text-[#bfbfbf] line-through cursor-not-allowed"
                      )}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 mb-12">
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 h-14 bg-black text-white hover:bg-gray-800 rounded-xl font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="h-14 px-6 border-[#e4e6eb] rounded-xl flex items-center justify-center"
                  title="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#52c41a]" />
                <span className="text-[12px] font-bold text-[#52c41a]">Cash on Delivery Available</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-[#e4e6eb]">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-black" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8d949e]">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-5 h-5 text-black" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8d949e]">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8d949e]">100% Original</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h3 className="text-[#8d949e] text-[11px] font-black uppercase tracking-[0.2em] mb-2">Customer Feedback</h3>
                <h2 className="text-[28px] font-bold text-black">Product Reviews</h2>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[#ffc107] text-[#ffc107]" />
                <span className="text-[18px] font-black text-black">{product.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-[14px] text-[#8d949e]">({product.totalReviews || 0})</span>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="py-12 flex justify-center"><Loader /></div>
            ) : (
              <ReviewList reviews={reviews} productId={product.id!} />
            )}
          </div>
          
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <ReviewForm productId={product.id!} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h3 className="text-[#8d949e] text-[11px] font-black uppercase tracking-[0.2em] mb-2">You might also like</h3>
                <h2 className="text-[28px] font-bold text-black">Related Products</h2>
              </div>
              <Link to="/" className="text-[13px] font-bold text-black hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
