import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();

  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-[32px] font-black text-black uppercase tracking-tight">Order Placed Successfully!</h1>
          <p className="text-[#8d949e] text-[16px]">
            Thank you for your purchase. Your order <span className="text-black font-bold">#{orderId?.slice(0, 8).toUpperCase()}</span> has been received and is being processed.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white p-6 rounded-2xl border border-[#e4e6eb] text-left space-y-4">
            <div className="w-10 h-10 bg-[#f0f2f5] rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-black">Track Order</h3>
              <p className="text-[13px] text-[#8d949e]">You can track your order status in your profile.</p>
            </div>
            <Link to="/orders" className="inline-flex items-center gap-2 text-[13px] font-bold text-black hover:gap-3 transition-all">
              View My Orders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e4e6eb] text-left space-y-4">
            <div className="w-10 h-10 bg-[#f0f2f5] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-black">Keep Shopping</h3>
              <p className="text-[13px] text-[#8d949e]">Check out our latest arrivals and trending products.</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-black hover:gap-3 transition-all">
              Back to Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-[#e4e6eb]"
        >
          <p className="text-[14px] text-[#8d949e]">
            A confirmation email has been sent to your registered email address.
          </p>
        </motion.div>
      </div>
    </Container>
  );
};
