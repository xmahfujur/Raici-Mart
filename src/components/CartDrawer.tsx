import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore, useUIStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQuantity, addItem } = useCartStore();
  const { loading: ordersLoading } = useOrders();
  const { products } = useProducts();
  const navigate = useNavigate();

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const suggestedProducts = React.useMemo(() => {
    return products
      .filter(p => !items.find(i => i.id === p.id) && p.isActive)
      .slice(0, 2);
  }, [products, items]);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#e4e6eb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-black" />
                <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">Your Cart</h2>
                <span className="bg-[#f0f2f5] text-[11px] font-black px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-[#f0f2f5] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-black">Your cart is empty</h3>
                    <p className="text-[14px] text-[#8d949e]">Looks like you haven't added anything yet.</p>
                  </div>
                  <Button 
                    onClick={() => setCartOpen(false)}
                    className="bg-black text-white px-8 h-11"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                      <div className="w-20 h-24 bg-[#f0f2f5] rounded-lg overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-[14px] font-bold text-black line-clamp-1">{item.name}</h4>
                              <button 
                                onClick={() => removeItem(item.id, item.selectedSize)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {item.selectedSize && (
                              <p className="text-[11px] font-bold text-[#8d949e] uppercase mt-0.5">Size: {item.selectedSize}</p>
                            )}
                            <p className="text-[14px] font-bold text-black mt-1">{formatPrice(item.price)}</p>
                          </div>
                        
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[#e4e6eb] rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                className="p-1.5 hover:bg-[#f0f2f5] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-[13px] font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                className="p-1.5 hover:bg-[#f0f2f5] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          <p className="text-[13px] font-bold text-black">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {items.length > 0 && suggestedProducts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#f0f2f5]">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-[#ffa940]" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-[#8c8c8c]">You Might Also Like</h3>
                  </div>
                  <div className="space-y-4">
                    {suggestedProducts.map((p) => (
                      <div key={p.id} className="flex gap-4 p-3 rounded-2xl hover:bg-[#f9fafb] transition-colors group">
                        <div className="w-16 h-20 bg-[#f0f2f5] rounded-xl overflow-hidden shrink-0">
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[13px] font-bold text-black line-clamp-1">{p.title}</h4>
                          <p className="text-[12px] font-bold text-[#8d949e] mt-0.5">{formatPrice(p.discountedPrice || p.price)}</p>
                          <button
                            onClick={() => {
                              addItem({
                                id: p.id!,
                                name: p.title,
                                price: p.discountedPrice || p.price,
                                image: p.images[0] || '',
                                quantity: 1
                              });
                            }}
                            className="text-[11px] font-black uppercase tracking-widest text-[#262626] mt-2 hover:underline text-left"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
            <div className="p-6 border-t border-[#e4e6eb] bg-[#f9fafb] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#4b4f56]">Subtotal</span>
                <span className="text-[18px] font-bold text-black">{formatPrice(total)}</span>
              </div>
              <p className="text-[12px] text-[#8d949e]">Shipping and taxes calculated at checkout.</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout}
                  disabled={ordersLoading}
                  className="w-full h-12 bg-black text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
                >
                  {ordersLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <Link 
                  to="/cart" 
                  onClick={() => setCartOpen(false)}
                  className="block w-full text-center text-[13px] font-bold text-[#8d949e] hover:text-black transition-colors py-2"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
