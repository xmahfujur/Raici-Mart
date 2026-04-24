import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore, useCategoriesStore } from '@/store/useStore';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useUIStore();
  const { products } = useProducts();
  const { categories } = useCategoriesStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<any[]>([]);

  // Calculate dynamic trending suggestions
  const trendingSuggestions = React.useMemo(() => {
    const cats = categories.slice(0, 3).map(c => c.name);
    const trendingProducts = products
      .filter(p => p.isActive && (p.trendingScore || 0) > 0)
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 3)
      .map(p => p.title);
    
    // Combine and shuffle slightly or just unique
    return Array.from(new Set([...cats, ...trendingProducts, 'New Arrivals'])).slice(0, 6);
  }, [categories, products]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products
      .filter(p => 
        p.isActive && (
          p.title.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          p.tags?.some(t => t.toLowerCase().includes(query))
        )
      )
      .slice(0, 5);
    setResults(filtered);
  }, [searchQuery, products]);

  const handleResultClick = (id: string) => {
    setSearchOpen(false);
    setSearchQuery(''); // Clear query when navigating to a product
    navigate(`/product/${id}`);
  };

  const handleSearchAll = () => {
    setSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[200] overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="absolute inset-0 bg-white/95 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative h-full flex flex-col pt-32 px-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-6 mb-12">
              <Search className="w-8 h-8 text-black" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, categories..."
                className="w-full bg-transparent border-none text-[24px] sm:text-[32px] font-bold text-black focus:ring-0 placeholder:text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAll()}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-8 h-8 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
              {searchQuery.trim() && results.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[18px] text-gray-400 font-medium italic">No results found for "{searchQuery}"</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-8">Top Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.id!)}
                          className="flex gap-6 text-left group"
                        >
                          <div className="w-24 h-32 bg-[#f0f2f5] rounded-2xl overflow-hidden shrink-0 group-hover:shadow-xl transition-shadow">
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex flex-col pt-2">
                            <span className="text-[10px] font-black uppercase text-[#8d949e] tracking-widest mb-1">{product.category}</span>
                            <h4 className="text-[17px] font-bold text-black mb-2 line-clamp-1">{product.title}</h4>
                            <p className="text-[15px] font-black text-[#f5222d]">{formatPrice(product.discountedPrice || product.price)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {results.length >= 5 && (
                    <button
                      onClick={handleSearchAll}
                      className="flex items-center gap-3 text-[14px] font-black uppercase tracking-widest hover:gap-5 transition-all text-black"
                    >
                      View All Results <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {!searchQuery.trim() && (
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-6">Trending Searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {trendingSuggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-6 py-3 bg-gray-50 hover:bg-black hover:text-white rounded-full text-[13px] font-bold transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
