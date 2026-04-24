import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/Container';
import { formatPrice } from '@/lib/utils';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#f0f0f0]">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[24px] font-bold text-black">Your bag is empty</h1>
            <p className="text-[#8c8c8c] text-[15px]">Looks like you haven't added anything to your cart yet.</p>
          </div>
          <Link to="/">
            <Button className="bg-black text-white px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[12px]">
              Shop Now
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="text-[32px] font-bold text-black mb-10">Shopping Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="bg-white p-6 rounded-2xl border border-[#f0f0f0] flex gap-6 group">
              <div className="w-24 h-32 bg-[#f9f9f9] rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[16px] font-bold text-black">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-[12px] font-bold text-[#8c8c8c] uppercase mt-0.5">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.selectedSize)}
                      className="p-2 text-[#bfbfbf] hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[14px] font-bold text-[#8c8c8c] mt-1">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center bg-[#f9f9f9] rounded-lg p-1 border border-[#f0f0f0]">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3 text-[#595959]" />
                    </button>
                    <span className="w-10 text-center text-[14px] font-bold text-black">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3 text-[#595959]" />
                    </button>
                  </div>
                  <p className="text-[16px] font-bold text-black">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-green-600" />
             <span className="text-[13px] text-gray-600 font-medium">Cash on Delivery & Easy Returns available on all items.</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-[#f0f0f0] shadow-sm sticky top-24 space-y-8">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[15px]">
                <span className="text-[#8c8c8c]">Subtotal</span>
                <span className="font-bold text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-[#8c8c8c]">Delivery Charge</span>
                <span className="text-[#52c41a] font-bold underline decoration-dotted underline-offset-4">FREE</span>
              </div>
              <div className="pt-6 border-t border-[#f0f0f0] flex justify-between items-center">
                <span className="text-[16px] font-bold text-black">Estimated Total</span>
                <span className="text-[28px] font-black text-black">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/checkout')}
              className="w-full h-14 bg-black text-white hover:bg-[#262626] font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
            >
              Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="pt-2 text-center">
              <Link to="/" className="text-[13px] font-bold text-[#8c8c8c] hover:text-black transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
