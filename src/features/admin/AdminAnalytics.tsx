import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MetricCard } from './AdminComponents';
import { Banknote, ShoppingCart, TrendingUp, Target, Users } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { orderService, Order } from '@/features/orders/orderService';
import { useAnalytics } from '@/hooks/useAnalytics';

const COLORS = ['#000000', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#ec4899', '#06b6d4'];

export const AdminAnalytics: React.FC = () => {
  const { products } = useProducts();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = orderService.subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const analytics = useAnalytics(orders, products);

  if (loading || !analytics) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        <p className="text-[14px] font-medium text-[#8d949e]">Calculating statistics...</p>
      </div>
    );
  }

  const avgOrderValue = analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-black mb-1">Analytics</h1>
        <p className="text-[#8d949e] text-[14px]">Deep dive into your store's performance and customer behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Avg. Order Value" value={`৳${avgOrderValue.toFixed(2)}`} icon={Banknote} />
        <MetricCard title="Total Customers" value={analytics.uniqueCustomers.toString()} icon={Users} />
        <MetricCard title="Total Orders" value={analytics.totalOrders.toString()} icon={ShoppingCart} />
        <MetricCard title="Total Revenue" value={`৳${analytics.totalRevenue.toLocaleString()}`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Units Sold (Top Products)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#8d949e' }} 
                  hide={analytics.topProducts.length > 5}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8d949e' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]} barSize={40}>
                  {analytics.topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Sales by Category (%)</h3>
          <div className="h-[350px] w-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="sales"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold text-black">{analytics.totalOrders}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8d949e]">Total Orders</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {analytics.categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[13px] text-[#4b4f56] font-medium">{cat.name} ({cat.sales}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
