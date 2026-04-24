import { useMemo } from 'react';
import { Order } from '@/features/orders/orderService';
import { Product } from '@/features/products/productService';
import { format, startOfDay, subDays, isWithinInterval } from 'date-fns';

export const useAnalytics = (orders: Order[], products: Product[]) => {
  const analytics = useMemo(() => {
    if (!orders.length) return {
      totalRevenue: 0,
      totalOrders: 0,
      uniqueCustomers: 0,
      salesOverTime: Array.from({ length: 7 }, (_, i) => ({
        name: format(subDays(new Date(), 6 - i), 'EEE'),
        sales: 0
      })),
      topProducts: [],
      categoryData: []
    };

    // Filter out cancelled orders for revenue/sales stats
    const validOrders = orders.filter(o => o.status !== 'cancelled');

    // 1. Total Revenue
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // 2. Total Customers (Unique User IDs in valid orders)
    const uniqueCustomers = new Set(validOrders.map(o => o.userId)).size;

    // 3. Sales Over Time (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date,
        formatted: format(date, 'EEE'),
        sales: 0
      };
    }).reverse();

    validOrders.forEach(order => {
      if (!order.createdAt?.seconds) return;
      const orderDate = new Date(order.createdAt.seconds * 1000);
      const dayData = last7Days.find(d => 
        format(d.date, 'yyyy-MM-dd') === format(orderDate, 'yyyy-MM-dd')
      );
      if (dayData) {
        dayData.sales += order.totalAmount;
      }
    });

    // 4. Top Selling Products
    const productStats: Record<string, { id: string, name: string, quantity: number, revenue: number }> = {};
    
    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 5. Category Distribution
    const categoryStats: Record<string, number> = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        // We might need to fetch product to get category, or store category in order item
        // For now, let's assume we can map it back if we have products list
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'Uncategorized';
        categoryStats[category] = (categoryStats[category] || 0) + item.quantity;
      });
    });

    const totalSoldItems = Object.values(categoryStats).reduce((acc, val) => acc + val, 0);
    const categoryColors = [
      'bg-blue-500', 
      'bg-purple-500', 
      'bg-pink-500', 
      'bg-amber-500', 
      'bg-emerald-500', 
      'bg-rose-500', 
      'bg-indigo-500',
      'bg-cyan-500'
    ];

    const categoryData = Object.entries(categoryStats).map(([name, count], index) => ({
      name,
      sales: Math.round((count / totalSoldItems) * 100),
      color: categoryColors[index % categoryColors.length]
    })).sort((a, b) => b.sales - a.sales).slice(0, 4);

    return {
      totalRevenue,
      totalOrders: orders.length,
      uniqueCustomers,
      salesOverTime: last7Days.map(d => ({ name: d.formatted, sales: d.sales })),
      topProducts,
      categoryData
    };
  }, [orders, products]);

  return analytics;
};
