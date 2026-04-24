import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn, formatPrice } from '@/lib/utils';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, loading, fetchUserOrders } = useOrders();

  React.useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <Container className="py-12">
      <h1 className="text-[32px] font-bold text-black mb-10">My Orders</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#f0f0f0] text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-black mb-2">No orders yet</h2>
          <p className="text-[#8c8c8c] text-[15px] mb-8">You haven't placed any orders yet. Start exploring our collections!</p>
          <Link to="/">
            <Button className="bg-black text-white px-10 h-14 rounded-2xl font-bold uppercase tracking-widest text-[12px] transition-all hover:bg-[#262626] active:scale-[0.98]">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-[#f0f0f0] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
              <div className="p-6 md:p-8 border-b border-[#f0f0f0] bg-gray-50/50 flex flex-wrap justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-8">
                  <div>
                    <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em] mb-1.5">Order ID</p>
                    <p className="text-[14px] font-bold text-black">#{order.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em] mb-1.5">Ordered On</p>
                    <p className="text-[14px] font-bold text-black">
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : '...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em] mb-1.5">Total Amount</p>
                    <p className="text-[16px] font-black text-black">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2",
                  order.status === 'delivered' ? "bg-green-100 text-green-700" :
                  order.status === 'shipped' ? "bg-orange-100 text-orange-700" :
                  order.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                  order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {order.status === 'delivered' && <CheckCircle className="w-3.5 h-3.5" />}
                  {order.status === 'shipped' && <Truck className="w-3.5 h-3.5" />}
                  {order.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                  {order.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                  {order.status}
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em]">Shipping Details</p>
                    <div className="text-[14px] text-[#595959] leading-relaxed bg-[#f9f9f9] p-4 rounded-2xl border border-[#f0f0f0]">
                       <p className="font-bold text-black mb-1">{order.customerName}</p>
                       <p className="mb-2 font-medium">{order.phone}</p>
                       <p>{order.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em]">Payment Method</p>
                    <div className="flex items-center gap-3 bg-[#f9f9f9] p-4 rounded-2xl border border-[#f0f0f0]">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-[10px]">৳</div>
                       <p className="text-[14px] font-bold text-black">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <p className="text-[10px] font-black text-[#bfbfbf] uppercase tracking-[0.2em]">Items Summary</p>
                  <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5">
                      <div className="w-14 h-18 bg-[#f9f9f9] rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-black truncate">{item.name}</p>
                        <p className="text-[13px] text-[#8c8c8c]">
                          {item.selectedSize && <span className="font-bold text-black uppercase mr-2">SIZE: {item.selectedSize}</span>}
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-[15px] font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  </div>
                  
                  <div className="pt-6 border-t border-[#f0f0f0] flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4 text-[13px] text-[#8c8c8c]">
                      <span>Subtotal</span>
                      <span className="font-bold text-black">{formatPrice(order.totalAmount - (order.deliveryCharge || 0))}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[13px] text-[#8c8c8c]">
                      <span>Delivery Fee ({order.deliveryLocation || 'Free'})</span>
                      <span className="font-bold text-black">{formatPrice(order.deliveryCharge || 0)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[18px] font-black text-black pt-2">
                      <span>Total</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};
