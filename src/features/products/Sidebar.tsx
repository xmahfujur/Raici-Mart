import React from 'react';
import { cn } from '@/lib/utils';
import { useCollectionsStore, useCategoriesStore } from '@/store/useStore';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeCollectionId: string | null;
  onCollectionChange: (id: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  showInStockOnly: boolean;
  onInStockChange: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onCategoryChange,
  activeCollectionId,
  onCollectionChange,
  priceRange,
  onPriceRangeChange,
  showInStockOnly,
  onInStockChange
}) => {
  const { collections } = useCollectionsStore();
  const { categories } = useCategoriesStore();

  return (
    <aside className="hidden md:flex flex-col gap-10 w-[220px] shrink-0 sticky top-32 h-fit">
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#8d949e] mb-6">
          Collections
        </h3>
        <ul className="flex flex-col gap-1">
          <li 
            onClick={() => {
              onCollectionChange(null);
              onCategoryChange('All Products');
            }}
            className={cn(
              "px-0 py-2 text-[14px] cursor-pointer transition-all duration-200 hover:translate-x-1 flex items-center gap-3",
              (!activeCollectionId && activeCategory === 'All Products')
                ? "font-bold text-black" 
                : "text-[#4b4f56] hover:text-black"
            )}
          >
            {(!activeCollectionId && activeCategory === 'All Products') && (
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            )}
            All Products
          </li>
          
          {collections.map((collection) => (
            <li 
              key={collection.id}
              onClick={() => {
                onCollectionChange(collection.id!);
                onCategoryChange(''); // Clear category when collection is selected
              }}
              className={cn(
                "px-0 py-2 text-[14px] cursor-pointer transition-all duration-200 hover:translate-x-1 flex items-center gap-3",
                activeCollectionId === collection.id 
                  ? "font-bold text-black" 
                  : "text-[#4b4f56] hover:text-black"
              )}
            >
              {activeCollectionId === collection.id && (
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              )}
              {collection.name}
            </li>
          ))}
        </ul>

        <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#8d949e] mt-10 mb-6">
          Categories
        </h3>
        <ul className="flex flex-col gap-1">
          {categories.map((category) => (
            <li 
              key={category.id}
              onClick={() => {
                onCategoryChange(category.name);
                onCollectionChange(null); // Clear collection when category is selected
              }}
              className={cn(
                "px-0 py-2 text-[14px] cursor-pointer transition-all duration-200 hover:translate-x-1 flex items-center gap-3",
                activeCategory === category.name 
                  ? "font-bold text-black" 
                  : "text-[#4b4f56] hover:text-black"
              )}
            >
              {activeCategory === category.name && (
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              )}
              {category.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#8d949e] mb-6">
          Price Range
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8d949e]">৳</span>
              <input 
                type="number" 
                placeholder="Min"
                value={isNaN(priceRange[0]) || priceRange[0] === 0 ? '' : priceRange[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  onPriceRangeChange([val === '' ? 0 : Number(val), priceRange[1]]);
                }}
                className="w-full h-9 bg-[#f0f2f5] border-none rounded-md pl-6 pr-2 text-[13px] focus:ring-1 focus:ring-black/5"
              />
            </div>
            <span className="text-[#8d949e]">—</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8d949e]">৳</span>
              <input 
                type="number" 
                placeholder="Max"
                value={isNaN(priceRange[1]) || priceRange[1] === 0 ? '' : priceRange[1]}
                onChange={(e) => {
                  const val = e.target.value;
                  onPriceRangeChange([priceRange[0], val === '' ? 0 : Number(val)]);
                }}
                className="w-full h-9 bg-[#f0f2f5] border-none rounded-md pl-6 pr-2 text-[13px] focus:ring-1 focus:ring-black/5"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#8d949e] mb-4">
          Availability
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div 
            onClick={() => onInStockChange(!showInStockOnly)}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              showInStockOnly ? "bg-black border-black" : "border-[#e4e6eb] group-hover:border-black"
            )}
          >
            {showInStockOnly && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <span className="text-[14px] text-[#4b4f56] group-hover:text-black transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      <div className="pt-10 border-t border-[#e4e6eb]">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#8d949e] mb-4">
          Raici Mart
        </h3>
        <p className="text-[12px] text-[#8d949e] leading-relaxed">
          Premium clothing and lifestyle essentials for the modern individual.
        </p>
      </div>
    </aside>
  );
};
