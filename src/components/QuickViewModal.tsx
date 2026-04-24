import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore, useCartStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, showToast } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState<string>('');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  const handleAddToCart = () => {
    if (product.sizeType !== 'none' && product.sizes?.length && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    // Check stock for selected size if applicable
    if (product.sizeType !== 'none' && selectedSize) {
      const sizeInfo = product.sizes?.find((s: any) => s.name === selectedSize);
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
      price: product.discountedPrice || product.price,
      image: product.images[0] || '',
      quantity: 1,
      selectedSize: selectedSize || undefined,
      deliveryType: product.deliveryType,
      deliveryChargeInsideDhaka: product.deliveryChargeInsideDhaka,
      deliveryChargeOutsideDhaka: product.deliveryChargeOutsideDhaka
    });
    showToast('Added to bag', 'success');
  };

  const handleViewDetails = () => {
    setQuickViewProduct(null);
    navigate(`/product/${product.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Gallery */}
          <div className="md:w-1/2 relative bg-[#f9f9f9]">
            <div className="aspect-[4/5] relative">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all p-1 bg-white",
                    selectedImage === idx ? "border-black shadow-md" : "border-transparent opacity-60"
                  )}
                >
                  <img src={img} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < Math.floor(product.rating || 0) ? "fill-[#ffa940] text-[#ffa940]" : "text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-bold text-[#8c8c8c] uppercase tracking-widest">{product.category}</span>
              </div>
              <h2 className="text-[28px] font-bold text-black leading-tight mb-4">{product.title}</h2>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[24px] font-black text-[#f5222d]">{formatPrice(product.discountedPrice || product.price)}</span>
                {product.discountedPrice && (
                  <span className="text-[16px] text-[#bfbfbf] line-through font-medium">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <p className="text-[#8c8c8c] text-[14px] leading-relaxed mb-8 line-clamp-3">
                {product.description}
              </p>
            </div>

            {product.sizeType !== 'none' && product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8c8c8c] mb-4 block">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: any) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={size.stock <= 0}
                      className={cn(
                        "h-12 min-w-[3rem] px-4 rounded-xl border-2 transition-all font-bold text-[13px] uppercase",
                        selectedSize === size.name 
                          ? "border-black bg-black text-white shadow-lg" 
                          : size.stock > 0 
                            ? "border-[#f0f0f0] text-[#262626] hover:border-black"
                            : "bg-[#f9f9f9] border-[#f9f9f9] text-[#bfbfbf] line-through cursor-not-allowed"
                      )}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full h-14 bg-black text-white hover:bg-[#262626] rounded-2xl font-black text-[14px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl shadow-black/10"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Bag
              </Button>
              <button
                onClick={handleViewDetails}
                className="w-full h-14 bg-[#f9f9f9] text-black hover:bg-black hover:text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.1em] transition-all"
              >
                View Full Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
