import React from 'react';
import { X, Layers, Tag, Home, User, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore, useCollectionsStore, useCategoriesStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export const MobileMenu: React.FC = () => {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { collections } = useCollectionsStore();
  const { categories } = useCategoriesStore();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop All', path: '/' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ];

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-[#e4e6eb] shrink-0">
              <span className="text-[18px] font-black uppercase tracking-tighter">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f2f5] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              {/* Navigation */}
              <div className="px-3 space-y-1 mb-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#f0f2f5] transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[15px] font-bold text-black">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Collections */}
              {collections.length > 0 && (
                <div className="px-6 mb-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-4">Collections</h3>
                  <div className="space-y-1">
                    {collections.map(collection => (
                      <Link
                        key={collection.id}
                        to={`/?collection=${collection.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-[14px] font-bold text-black hover:opacity-70 transition-opacity"
                      >
                        <Layers className="w-4 h-4 text-gray-400" />
                        {collection.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="px-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-4">Categories</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/?category=${category.name}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-[14px] font-bold text-black hover:opacity-70 transition-opacity"
                    >
                      <Tag className="w-4 h-4 text-gray-400" />
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e4e6eb] bg-[#f9fafb]">
              <p className="text-[12px] font-bold text-[#8d949e] mb-1 italic">Welcome to Raici Mart</p>
              <p className="text-[11px] text-[#4b4f56]">Premium lifestyle curators.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
