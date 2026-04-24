import { useState, useEffect } from 'react';
import { orderService, Order } from '@/features/orders/orderService';
import { useUserStore, useCartStore } from '@/store/useStore';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const { items, clearCart } = useCartStore();

  const fetchUserOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await orderService.getUserOrders(user.uid);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (shippingData: { 
    name: string; 
    phone: string; 
    address: string; 
    paymentMethod: string;
    deliveryCharge: number;
    deliveryLocation: string;
  }) => {
    if (!user) throw new Error('You must be logged in to place an order.');
    if (items.length === 0) throw new Error('Your cart is empty.');

    setLoading(true);
    setError(null);

    try {
      const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const totalAmount = subtotal + shippingData.deliveryCharge;
      
      const orderData = {
        userId: user.uid,
        customerName: shippingData.name,
        phone: shippingData.phone,
        address: shippingData.address,
        paymentMethod: shippingData.paymentMethod,
        deliveryCharge: shippingData.deliveryCharge,
        deliveryLocation: shippingData.deliveryLocation,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedSize: item.selectedSize
        })),
        totalAmount
      };

      const orderId = await orderService.createOrder(orderData);
      console.log('[useOrders] Order created successfully:', orderId);
      
      clearCart();
      console.log('[useOrders] Cart cleared');
      
      return orderId;
    } catch (err: any) {
      console.error('[useOrders] Order creation failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      console.log('[useOrders] Loading state reset');
    }
  };

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    createOrder
  };
};
