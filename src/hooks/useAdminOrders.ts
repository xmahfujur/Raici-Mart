import { useState, useEffect } from 'react';
import { orderService, Order } from '@/features/orders/orderService';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = orderService.subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      return true;
    } catch (err: any) {
      console.error('[useAdminOrders] Update status error:', err);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      return true;
    } catch (err: any) {
      console.error('[useAdminOrders] Delete order error:', err);
      throw err;
    }
  };

  return { orders, loading, error, updateStatus, deleteOrder };
};
