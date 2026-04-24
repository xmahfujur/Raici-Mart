import React from 'react';
import { 
  Banknote, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { MetricCard, AdminTable } from './AdminComponents';
import { cn, formatPrice } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { orderService, Order } from '@/features/orders/orderService';
import { format } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const COLORS = ['#000000', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'];

export const AdminDashboard: React.FC = () => {
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
  const recentOrders = orders.slice(0, 5);

  if (loading || !analytics) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        <p className="text-[14px] font-medium text-[#8d949e]">Analyzing store data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-black mb-1">Dashboard</h1>
        <p className="text-[#8d949e] text-[14px]">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={formatPrice(analytics.totalRevenue)} 
          icon={Banknote} 
        />
        <MetricCard 
          title="Total Orders" 
          value={analytics.totalOrders.toString()} 
          icon={ShoppingBag} 
        />
        <MetricCard 
          title="Unique Customers" 
          value={analytics.uniqueCustomers.toString()} 
          icon={Users} 
        />
        <MetricCard 
          title="Active Products" 
          value={products.filter(p => p.isActive).length.toString()} 
          icon={TrendingUp} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-black">Sales (Last 7 Days)</h3>
            <button className="text-[12px] font-bold text-black flex items-center gap-1 hover:underline">
              View Report <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesOverTime}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8d949e' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8d949e' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  formatter={(value) => [formatPrice(Number(value)), 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#000" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Top Categories</h3>
          <div className="space-y-6">
            {analytics.categoryData.length > 0 ? analytics.categoryData.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-[#4b4f56]">{cat.name}</span>
                  <span className="font-bold text-black">{cat.sales}%</span>
                </div>
                <div className="w-full h-2 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", cat.color)} 
                    style={{ width: `${cat.sales}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-[#8d949e] text-[14px]">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Units Sold (Top Products)</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#8d949e' }} 
                    interval={0}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#8d949e' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8f9fa' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                  />
                  <Bar dataKey="quantity" radius={[6, 6, 0, 0]} barSize={32}>
                    {analytics.topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-[#8d949e] text-[14px]">No sales data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products List */}
        <div className="bg-white p-6 rounded-xl border border-[#e4e6eb] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Top Products Revenue</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center text-[12px] font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-black line-clamp-1">{p.name}</p>
                    <p className="text-[12px] text-[#8d949e]">{p.quantity} units sold</p>
                  </div>
                </div>
                <p className="text-[14px] font-bold text-black">{formatPrice(p.revenue)}</p>
              </div>
            ))}
            {analytics.topProducts.length === 0 && (
              <p className="text-center py-10 text-[#8d949e]">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-black">Recent Orders</h3>
          <button className="text-[14px] font-bold text-black hover:underline">View All</button>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {recentOrders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[14px] font-bold text-black">#{order.id?.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-[#8d949e]">
                    {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : '...'}
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  order.status === 'delivered' ? "bg-green-100 text-green-700" :
                  order.status === 'shipped' ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#4b4f56]">{order.items.length} items</span>
                <span className="font-bold text-black">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block bg-white rounded-xl border border-[#e4e6eb] overflow-hidden">
          <AdminTable headers={['Order ID', 'Customer ID', 'Items', 'Amount', 'Status', 'Date']}>
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                <td className="px-6 py-4 text-[14px] font-bold text-black">#{order.id?.slice(0, 8).toUpperCase()}</td>
                <td className="px-6 py-4 text-[14px] text-[#4b4f56]">{order.userId.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-[14px] text-[#4b4f56]">{order.items.length} items</td>
                <td className="px-6 py-4 text-[14px] font-bold text-black">{formatPrice(order.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    order.status === 'delivered' ? "bg-green-100 text-green-700" :
                    order.status === 'shipped' ? "bg-orange-100 text-orange-700" :
                    order.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                    order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[14px] text-[#8d949e]">
                  {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : '...'}
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </div>
    </div>
  );
};
