import React, { useState } from 'react';
import { Bell, Package, Tag, Info, Check, Circle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-blue-500" />;
      case 'promotion': return <Tag className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer relative hover:bg-[#f0f2f5] transition-colors"
      >
        <Bell className="w-5 h-5 text-black" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 w-2 h-2 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#e4e6eb] overflow-hidden z-50 origin-top-right"
            >
              <div className="p-4 border-b border-[#f0f2f5] flex items-center justify-between">
                <h3 className="text-[14px] font-black uppercase tracking-widest text-black">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto" />
                    <p className="text-[13px] text-[#8d949e]">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id!);
                        if (!n.link) setIsOpen(false);
                      }}
                      className={cn(
                        "p-4 border-b border-[#f0f2f5] last:border-0 hover:bg-[#f9fafb] transition-colors cursor-pointer relative",
                        !n.isRead && "bg-blue-50/30"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1 space-y-1">
                          <p className={cn("text-[13px] leading-tight", !n.isRead ? "font-bold text-black" : "text-[#4b4f56]")}>
                            {n.title}
                          </p>
                          <p className="text-[12px] text-[#8d949e] line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-medium text-[#8d949e]">
                            {n.createdAt?.seconds ? format(new Date(n.createdAt.seconds * 1000), 'MMM d, h:mm a') : '...'}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                        )}
                      </div>
                      {n.link && (
                        <Link 
                          to={n.link} 
                          className="absolute inset-0 z-10" 
                          onClick={() => setIsOpen(false)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-[#f9fafb] text-center">
                <button className="text-[12px] font-bold text-black hover:underline">View All Activity</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
