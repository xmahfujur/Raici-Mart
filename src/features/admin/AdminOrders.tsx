import React, { useState } from 'react';
import { Search, Filter, Download, Eye, MoreHorizontal, ShoppingCart, X, MapPin, Phone, CreditCard, User, Printer, Trash2, AlertCircle } from 'lucide-react';
import { AdminTable } from './AdminComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import { Order } from '@/features/orders/orderService';
import { format } from 'date-fns';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { motion, AnimatePresence } from 'motion/react';
import { OrderInvoice } from '../invoice/OrderInvoice';
import { useSettings } from '@/hooks/useSettings';
import { useUIStore } from '@/store/useStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AdminOrders: React.FC = () => {
  const { orders, loading, updateStatus, deleteOrder } = useAdminOrders();
  const { settings } = useSettings();
  const { showToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(search.toLowerCase()) ||
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    failed: orders.filter(o => o.status === 'failed_delivery').length,
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      case 'failed_delivery': return 'bg-red-100 text-red-900 font-bold';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateStatus(orderId, newStatus);
      showToast('Order status updated', 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!isDeletingId) return;
    try {
      await deleteOrder(isDeletingId);
      showToast('Order deleted successfully', 'success');
      setIsDeletingId(null);
    } catch (err) {
      showToast('Failed to delete order', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-[28px] font-bold text-black mb-1">Orders</h1>
          <p className="text-[#8d949e] text-[14px]">Track, manage and fulfill customer orders in {settings.currency} ({settings.currency === 'BDT' ? '৳' : settings.currency === 'EUR' ? '€' : '$'}).</p>
        </div>
        <Button variant="outline" className="h-11 px-6 border-[#e4e6eb] flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
        {[
          { label: 'Pending', count: stats.pending, color: 'bg-gray-400' },
          { label: 'Confirmed', count: stats.confirmed, color: 'bg-blue-500' },
          { label: 'Shipped', count: stats.shipped, color: 'bg-orange-500' },
          { label: 'Delivered', count: stats.delivered, color: 'bg-green-500' },
          { label: 'Failed', count: stats.failed, color: 'bg-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#e4e6eb] flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-[#8d949e] uppercase mb-1">{stat.label}</p>
              <p className="text-[20px] font-bold text-black">{stat.count}</p>
            </div>
            <div className={cn("w-2 h-8 rounded-full", stat.color)} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm print:hidden">
        <div className="relative w-full sm:max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by Order ID or Customer..." 
            className="pl-10 h-10 bg-[#f0f2f5] border-none rounded-lg text-[14px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List/Table */}
      <div className="print:hidden">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#e4e6eb] flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#e4e6eb] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">No orders found</h3>
              <p className="text-sm text-gray-500">Orders will appear here once customers start purchasing.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-bold text-black">#{order.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[12px] text-[#4b4f56] font-medium">{order.customerName}</p>
                      <p className="text-[11px] text-[#8d949e]">
                        {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : '...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-black">{formatPrice(order.totalAmount)}</p>
                      <p className="text-[11px] text-[#8d949e]">{order.items.length} items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#f0f2f5]">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id!, e.target.value as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-[#e4e6eb] outline-none cursor-pointer",
                        getStatusColor(order.status)
                      )}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="failed_delivery">Failed Delivery</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 bg-[#f0f2f5] rounded-xl hover:bg-[#e4e6eb] transition-colors"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </button>
                      {(order.status === 'cancelled' || order.status === 'failed_delivery') && (
                        <button 
                          onClick={() => setIsDeletingId(order.id!)}
                          className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block bg-white rounded-xl border border-[#e4e6eb] overflow-hidden shadow-sm">
              <AdminTable headers={['Order ID', 'Customer', 'Total', 'Status', 'Actions']}>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 text-[14px] font-bold text-black">#{order.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[14px] text-[#4b4f56] font-medium">
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-black">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id!, e.target.value as any)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer",
                          getStatusColor(order.status)
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed_delivery">Failed Delivery</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-[#f0f2f5] rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {(order.status === 'cancelled' || order.status === 'failed_delivery') && (
                          <button 
                            onClick={() => setIsDeletingId(order.id!)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal with Invoice Preview */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0 print:static print:z-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] print:h-auto print:shadow-none print:rounded-none"
            >
              <div className="p-6 border-b border-[#f0f2f5] flex items-center justify-between shrink-0 print:hidden">
                <h2 className="text-[20px] font-bold text-black">Review Order</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#f0f2f5] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#8d949e]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 print:p-0">
                {/* Print View Wrapper */}
                <div className="bg-[#f0f2f5] p-8 rounded-xl print:bg-white print:p-0">
                  <OrderInvoice order={selectedOrder} storeSettings={settings} />
                </div>
              </div>

              <div className="p-6 bg-[#f9fafb] border-t border-[#f0f2f5] flex items-center justify-between shrink-0 print:hidden">
                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="h-11 px-8">Close</Button>
                <Button onClick={handlePrint} className="h-11 px-8 bg-black text-white flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Invoice
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <Dialog open={!!isDeletingId} onOpenChange={open => !open && setIsDeletingId(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
               <AlertCircle className="w-5 h-5" /> Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600">Are you sure you want to delete this order? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeletingId(null)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleDelete}>Delete Permanently</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

