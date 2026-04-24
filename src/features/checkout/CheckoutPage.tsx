import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useUserStore, useUIStore } from '@/store/useStore';
import { useOrders } from '@/hooks/useOrders';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, Truck, ChevronLeft, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { cn, formatPrice, validateBDPhone } from '@/lib/utils';

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCartStore();
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  const { createOrder, loading } = useOrders();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    district: '',
    area: '',
    fullAddress: '',
    paymentMethod: 'COD' as 'COD' | 'bKash' | 'Nagad',
    deliveryLocation: 'Inside Dhaka' as 'Inside Dhaka' | 'Outside Dhaka'
  });

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Calculate delivery charge: pick the highest applicable charge among items for the selected location
  const deliveryCharge = items.reduce((maxCharge, item) => {
    if (item.deliveryType === 'paid') {
      const charge = formData.deliveryLocation === 'Inside Dhaka' 
        ? (item.deliveryChargeInsideDhaka || 0) 
        : (item.deliveryChargeOutsideDhaka || 0);
      return Math.max(maxCharge, charge);
    }
    return maxCharge;
  }, 0);

  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for missing fields
    if (!formData.name.trim()) {
      showToast('Please fill in your Full Name before confirming order', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please fill in your Phone Number before confirming order', 'error');
      return;
    }
    if (!formData.district.trim()) {
      showToast('Please fill in your District before confirming order', 'error');
      return;
    }
    if (!formData.area.trim()) {
      showToast('Please fill in your Area/Thana before confirming order', 'error');
      return;
    }
    if (!formData.fullAddress.trim()) {
      showToast('Please fill in your Full Address before confirming order', 'error');
      return;
    }

    if (!validateBDPhone(formData.phone)) {
      showToast('Please enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX).', 'error');
      return;
    }

    try {
      const orderId = await createOrder({
        name: formData.name,
        phone: formData.phone,
        address: `${formData.fullAddress}, ${formData.area}, ${formData.district}`,
        paymentMethod: formData.paymentMethod,
        deliveryCharge,
        deliveryLocation: formData.deliveryLocation
      });
      clearCart(); // Explicit clear cart after success
      navigate(`/order-success/${orderId}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Link to="/">
            <Button className="bg-black text-white px-8 h-12">Return to Shop</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-[#8d949e] hover:text-black transition-colors mb-6 md:mb-8 font-bold text-[13px] uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#f0f0f0] shadow-sm space-y-8">
              <h2 className="text-[20px] font-bold text-black border-b border-[#f0f0f0] pb-4">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[12px] font-bold uppercase tracking-wider text-[#8c8c8c]">Full Name</Label>
                    <Input 
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 bg-[#f9f9f9] border-none rounded-xl focus:ring-2 focus:ring-black/5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[12px] font-bold uppercase tracking-wider text-[#8c8c8c]">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bfbfbf]" />
                      <Input 
                        id="phone"
                        placeholder="e.g. 01700000000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 bg-[#f9f9f9] border-none rounded-xl pl-11 focus:ring-2 focus:ring-black/5"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-[12px] font-bold uppercase tracking-wider text-[#8c8c8c]">District</Label>
                    <Input 
                      id="district"
                      placeholder="e.g. Dhaka"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="h-12 bg-[#f9f9f9] border-none rounded-xl focus:ring-2 focus:ring-black/5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-[12px] font-bold uppercase tracking-wider text-[#8c8c8c]">Area / Thana</Label>
                    <Input 
                      id="area"
                      placeholder="e.g. Uttara / Dhanmondi"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="h-12 bg-[#f9f9f9] border-none rounded-xl focus:ring-2 focus:ring-black/5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[12px] font-bold uppercase tracking-wider text-[#8c8c8c]">Full Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#bfbfbf]" />
                    <textarea 
                      id="address"
                      placeholder="House no, Road no, Block..."
                      value={formData.fullAddress}
                      onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                      className="w-full min-h-[100px] bg-[#f9f9f9] border-none rounded-xl pl-11 p-4 shadow-none focus:ring-2 focus:ring-black/5 text-[14px] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="text-[16px] font-bold text-black">Delivery Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Inside Dhaka', 'Outside Dhaka'] as const).map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryLocation: location })}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-bold text-[14px]",
                          formData.deliveryLocation === location 
                            ? "border-black bg-black text-white" 
                            : "border-[#f0f0f0] bg-[#f9f9f9] text-[#8d949e] hover:border-black/20"
                        )}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="text-[16px] font-bold text-black flex items-center gap-2">
                    Payment Method
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded text-xs font-black uppercase tracking-tighter">SECURE</span>
                  </h3>
                  <RadioGroup 
                    value={formData.paymentMethod}
                    onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                    className="grid grid-cols-1 gap-4"
                  >
                    <div className={`flex items-center space-x-3 p-5 rounded-2xl border transition-all cursor-pointer ${formData.paymentMethod === 'COD' ? 'border-black bg-black/5' : 'border-[#f0f0f0] hover:bg-gray-50'}`}>
                      <RadioGroupItem value="COD" id="cod" className="border-black text-black" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-bold text-[15px]">Cash on Delivery (COD)</div>
                        <div className="text-[12px] text-[#8c8c8c]">Pay in cash when your order is delivered</div>
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 opacity-40 grayscale pointer-events-none">
                      <div className="flex items-center space-x-3 p-5 rounded-2xl border border-[#f0f0f0]">
                        <div className="font-bold text-[14px]">bKash</div>
                      </div>
                      <div className="flex items-center space-x-3 p-5 rounded-2xl border border-[#f0f0f0]">
                        <div className="font-bold text-[14px]">Nagad</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-center text-[#8c8c8c]">bKash & Nagad payments are coming soon!</p>
                  </RadioGroup>
                </div>
              </form>
            </div>

            {/* Delivery Info */}
            <div className="bg-[#f6ffed] p-6 rounded-2xl border border-[#b7eb8f] flex items-start gap-4">
              <Truck className="w-6 h-6 text-[#52c41a] shrink-0" />
              <div>
                <h4 className="text-[15px] font-bold text-[#237804] mb-1">Standard Delivery</h4>
                <p className="text-[13px] text-[#389e0d]">Inside Dhaka: <b>1-2 days</b>. Outside Dhaka: <b>2-4 days</b>.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-[#f0f0f0] shadow-sm sticky top-24 space-y-8">
              <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">Your Order</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="w-14 h-16 bg-[#f9f9f9] rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-black truncate mb-0.5">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-[10px] font-bold text-[#8c8c8c] uppercase">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-[12px] text-[#8c8c8c]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-[#f0f0f0]">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#8c8c8c]">Subtotal</span>
                  <span className="font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#8c8c8c]">Shipping Fee</span>
                  {deliveryCharge > 0 ? (
                    <span className="font-bold text-black">{formatPrice(deliveryCharge)}</span>
                  ) : (
                    <span className="text-[#52c41a] font-bold italic">FREE</span>
                  )}
                </div>
                <div className="pt-4 border-t border-[#f0f0f0] flex justify-between items-center">
                  <span className="text-[16px] font-bold text-black">Total to Pay</span>
                  <span className="text-[24px] font-black text-black">{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-14 bg-black text-white hover:bg-[#262626] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Confirm Order <CheckCircle2 className="w-5 h-5 flex-shrink-0" /></>
                )}
              </Button>

              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#52c41a]" />
                  <span className="text-[11px] font-bold text-[#52c41a]">100% Secure Checkout</span>
                </div>
                <p className="text-[10px] text-center text-[#8c8c8c] leading-relaxed">
                  By placing an order, you agree to Raici Mart's <span className="underline cursor-pointer font-bold">Terms of Delivery</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
