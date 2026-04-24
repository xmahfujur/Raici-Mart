import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/features/products/ProductGrid';
import { Sidebar } from '@/features/products/Sidebar';
import { useUIStore, useCollectionsStore } from '@/store/useStore';
import { useSearchParams } from 'react-router-dom';
import { useTitle } from '@/hooks/useTitle';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Send, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  useTitle('Premium Lifestyle Collections');
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { searchQuery, setSearchQuery, showToast } = useUIStore();
  const { collections } = useCollectionsStore();

  // Sync URL search param with store
  React.useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All Products');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(searchParams.get('collection'));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when switching categories
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('category', category);
      next.delete('search');
      return next;
    });
  };

  const handleCollectionChange = (id: string | null) => {
    setActiveCollectionId(id);
    setSearchQuery(''); // Clear search when switching collections
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (id) next.set('collection', id);
      else next.delete('collection');
      next.set('category', '');
      next.delete('search');
      return next;
    });
  };

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(p => {
        if (!p.isActive) return false;
        
        // Collection Filter
        if (activeCollectionId && p.collectionId !== activeCollectionId) return false;
        
        // Category Filter
        if (activeCategory !== 'All Products' && activeCategory !== '' && p.category !== activeCategory) return false;
        
        // Search Filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(query);
          const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(query));
          if (!matchesTitle && !matchesTags) return false;
        }
        
        const price = p.discountedPrice || p.price;
        if (priceRange[0] > 0 && price < priceRange[0]) return false;
        if (priceRange[1] > 0 && price > priceRange[1]) return false;
        if (showInStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        if (sortBy === 'price-high') return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        if (sortBy === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        return 0;
      });
  }, [products, searchQuery, activeCategory, activeCollectionId, priceRange, showInStockOnly, sortBy]);

  const isBrowsingAll = activeCategory === 'All Products' && !activeCollectionId && !searchQuery && priceRange[0] === 0 && priceRange[1] === 0 && !showInStockOnly;

  const sections = React.useMemo(() => {
    if (!isBrowsingAll) return null;
    return [
      { 
        title: 'New Arrivals', 
        subtitle: 'The latest from our collections',
        products: products.filter(p => p.isActive).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 4) 
      },
      { 
        title: 'Trending Now', 
        subtitle: 'Most popular pieces this week',
        products: products.filter(p => p.isActive).sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)).slice(0, 4) 
      },
      { 
        title: 'Featured Products', 
        subtitle: 'Handpicked for your style',
        products: products.filter(p => p.isActive && p.isFeatured).length > 0
          ? products.filter(p => p.isActive && p.isFeatured).slice(0, 4)
          : products.filter(p => p.isActive && p.rating >= 4).slice(0, 4) 
      }
    ];
  }, [products, isBrowsingAll]);

  return (
    <div className="flex-grow flex flex-col">
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-12 flex gap-12">
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange}
          activeCollectionId={activeCollectionId}
          onCollectionChange={handleCollectionChange}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          showInStockOnly={showInStockOnly}
          onInStockChange={setShowInStockOnly}
        />

        <section className="flex-1">
          {isBrowsingAll ? (
            <div className="flex flex-col gap-20">
              {sections?.map((section, idx) => (
                <div key={idx}>
                  <div className="flex flex-col mb-10">
                    <h3 className="text-[#8d949e] text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                      {section.subtitle}
                    </h3>
                    <h2 className="text-[32px] font-bold text-black">
                      {section.title}
                    </h2>
                  </div>
                  <ProductGrid products={section.products} loading={loading} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <h3 className="text-[#8d949e] text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                    {activeCollection ? 'Collection' : 'Category'}
                  </h3>
                  <h1 className="text-[32px] font-bold text-black">
                    {searchQuery 
                      ? `Results for "${searchQuery}"` 
                      : activeCollection 
                        ? activeCollection.name 
                        : activeCategory || 'Browsing'}
                  </h1>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[#8d949e] uppercase tracking-wider">Sort By</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent border-none text-[13px] font-bold text-black focus:ring-0 cursor-pointer"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="text-[13px] font-medium text-[#8d949e]">
                    {filteredProducts.length} products
                  </div>
                </div>
              </div>

              <ProductGrid products={filteredProducts} loading={loading} />
              
              {!loading && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium mb-6">No products found matching your criteria</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All Products');
                      setActiveCollectionId(null);
                      setPriceRange([0, 0]);
                      setShowInStockOnly(false);
                      setSearchParams({});
                    }}
                    className="rounded-full px-8"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Trust Badges */}
      <section className="bg-white py-16 border-y border-[#e4e6eb]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex items-center gap-4">
              <Truck className="w-8 h-8 text-black" />
              <div>
                <h4 className="text-[14px] font-black uppercase tracking-widest text-black">Free Delivery</h4>
                <p className="text-[12px] text-[#8d949e] mt-1">On orders over ৳2000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-black" />
              <div>
                <h4 className="text-[14px] font-black uppercase tracking-widest text-black">Secure Payment</h4>
                <p className="text-[12px] text-[#8d949e] mt-1">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RefreshCw className="w-8 h-8 text-black" />
              <div>
                <h4 className="text-[14px] font-black uppercase tracking-widest text-black">Easy Returns</h4>
                <p className="text-[12px] text-[#8d949e] mt-1">7-day simple return</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-black" />
              <div>
                <h4 className="text-[14px] font-black uppercase tracking-widest text-black">Premium Quality</h4>
                <p className="text-[12px] text-[#8d949e] mt-1">Curated with care</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-black">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-[40px] font-black leading-tight mb-6 text-white">
              Join the Raici Mart Inner Circle
            </h2>
            <p className="text-gray-400 text-[16px] leading-relaxed mb-10">
              Get early access to drops, exclusive offers, and the latest trends delivered straight to your inbox.
            </p>
            <form 
              className="flex flex-col sm:flex-row gap-3" 
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Welcome to the Circle! Check your inbox soon.", "success");
              }}
            >
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-14 px-6 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-500"
                required
              />
              <Button className="h-14 px-10 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                Subscribe <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="mt-6 text-[11px] text-[#4b4f56] uppercase tracking-[0.2em] font-medium">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

