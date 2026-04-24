import React from 'react';
import { ShoppingCart, Menu, User, LogOut, Shield, Heart, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore, useUserStore, useUIStore } from '@/store/useStore';
import { authService } from '@/features/auth/authService';
import { NotificationsDropdown } from '@/features/notifications/NotificationsDropdown';
import { useWishlist } from '@/hooks/useWishlist';
import { useNotifications } from '@/hooks/useNotifications';

export const Navbar: React.FC = () => {
  const cartItems = useCartStore((state) => state.items);
  const { user } = useUserStore();
  const { 
    setCartOpen, 
    setMobileMenuOpen,
    setSearchOpen
  } = useUIStore();
  const { wishlistItems } = useWishlist();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-[60] w-full h-20 bg-white/80 backdrop-blur-md border-b border-[#e4e6eb] flex items-center">
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 hover:bg-[#f0f2f5] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6 text-black" />
          </button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-[22px] font-black tracking-tighter text-black uppercase group-hover:opacity-70 transition-opacity">
              Raici Mart
            </span>
          </Link>
        </div>

        {/* Search Trigger */}
        <div 
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-[400px] hidden md:flex items-center gap-3 bg-[#f0f2f5] hover:bg-[#ebedf0] px-6 h-11 rounded-full cursor-pointer transition-colors group"
        >
          <Search className="w-4 h-4 text-[#8d949e] group-hover:text-black transition-colors" />
          <span className="text-[14px] text-[#8d949e] group-hover:text-black transition-colors">Search products...</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#f0f2f5] transition-colors"
            >
              <Search className="w-5 h-5 text-black" />
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist"
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer relative hover:bg-[#f0f2f5] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-black" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-2 right-2 bg-black text-white text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && <NotificationsDropdown />}

            {/* Cart */}
            <div 
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer relative hover:bg-[#f0f2f5] transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-black" />
              <span className="hidden lg:block text-[13px] font-bold text-black uppercase tracking-wider">Cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-[#f0f2f5] transition-colors group" title="Admin Panel">
                    <Shield className="w-5 h-5 text-black" />
                    <span className="hidden lg:block text-[13px] font-bold text-black uppercase tracking-wider">Admin</span>
                  </Link>
                )}
                <Link to="/profile" className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden hover:bg-[#f0f2f5] transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-black" />
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link to="/login">
                  <Button className="h-10 px-6 bg-black text-white hover:bg-[#222] rounded-md font-bold text-[12px] uppercase tracking-wider">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
