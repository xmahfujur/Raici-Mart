import React from 'react';
import { useUIStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Toast: React.FC = () => {
  const { toast } = useUIStore();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border pointer-events-auto min-w-[300px]",
              toast.type === 'success' ? "bg-white border-green-100 text-green-700" :
              toast.type === 'error' ? "bg-white border-red-100 text-red-700" :
              "bg-white border-[#e4e6eb] text-black"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            
            <p className="text-[14px] font-bold flex-1">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
