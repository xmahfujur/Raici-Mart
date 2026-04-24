import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Megaphone, 
  Settings, 
  ArrowLeft,
  Layers,
  Tag
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Layers, label: 'Collections', path: '/admin/collections' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Megaphone, label: 'Campaigns', path: '/admin/campaigns' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

interface AdminSidebarProps {
  isMobile?: boolean;
  onMobileSelect?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobile, onMobileSelect }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onMobileSelect) {
      onMobileSelect();
    }
  };

  return (
    <aside className={cn(
      "h-full bg-white flex flex-col",
      !isMobile && "w-[260px] border-r border-[#e4e6eb] fixed left-0 top-0 h-screen"
    )}>
      {!isMobile && (
        <div className="h-16 flex items-center px-6 border-b border-[#e4e6eb]">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
            <span className="text-[18px] font-extrabold tracking-tight text-black">
              Raici Admin
            </span>
          </Link>
        </div>
      )}

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all",
                isActive 
                  ? "bg-black text-white shadow-md" 
                  : "text-[#4b4f56] hover:bg-[#f0f2f5] hover:text-black"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#e4e6eb]">
        <div className="bg-[#f0f2f5] p-4 rounded-xl">
          <p className="text-[12px] font-bold text-black mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] text-[#8d949e]">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
