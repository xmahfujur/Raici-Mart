import React from 'react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

interface InvoiceProps {
  order: any;
  storeSettings: any;
}

export const OrderInvoice: React.FC<InvoiceProps> = ({ order, storeSettings }) => {
  return (
    <div className="invoice-container bg-white p-8 text-black font-sans leading-tight border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">{storeSettings.storeName}</h1>
          <p className="text-xs text-gray-500 font-bold">OFFICIAL INVOICE</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">Order #{order.id?.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-500">{format(order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(), 'dd MMM yyyy, HH:mm')}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Billed To</h2>
          <p className="text-sm font-bold">{order.customerName}</p>
          <p className="text-xs text-gray-600">{order.phone}</p>
          <p className="text-xs text-gray-600 mt-1 max-w-[200px]">{order.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Payment Mode</h2>
          <p className="text-sm font-bold uppercase">{order.paymentMethod || 'Cash on Delivery'}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Location: {order.deliveryLocation || 'N/A'}</p>
          <p className="text-xs text-green-600 font-bold uppercase mt-1">{order.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2 text-[10px] font-black uppercase tracking-widest">Description</th>
            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-right">Price</th>
            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.items.map((item: any, index: number) => (
            <tr key={index}>
              <td className="py-3">
                <p className="text-[13px] font-bold">{item.name || item.title}</p>
                {item.selectedSize && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Size: {item.selectedSize}</p>
                )}
              </td>
              <td className="py-3 text-center text-[13px]">{item.quantity}</td>
              <td className="py-3 text-right text-[13px]">{formatPrice(item.price)}</td>
              <td className="py-3 text-right text-[13px] font-bold">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end border-t-2 border-black pt-4">
        <div className="w-48 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.totalAmount - (order.deliveryCharge || 0))}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Delivery Fee</span>
            <span>{formatPrice(order.deliveryCharge || 0)}</span>
          </div>
          <div className="flex justify-between text-base font-black border-t pt-2">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-dashed text-center">
        <p className="text-[10px] font-bold text-gray-400 italic">Thank you for shopping with Raici Mart!</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .invoice-container, .invoice-container * { visibility: visible; }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 48%; /* To fit 2 on one A4 */
            border: none;
            padding: 40px;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};
