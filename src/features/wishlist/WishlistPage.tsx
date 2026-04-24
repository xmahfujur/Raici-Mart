import React from 'react';
import { Container } from '@/components/Container';
import { useWishlist } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '../products/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader } from '@/components/Loader';

export const WishlistPage: React.FC = () => {
  const { wishlistItems, loading: wishlistLoading } = useWishlist();
  const { products, loading: productsLoading } = useProducts();

  const wishlistedProducts = products.filter(p => 
    wishlistItems.some(item => item.productId === p.id)
  );

  const loading = wishlistLoading || productsLoading;

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;

  return (
    <Container className="py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-black uppercase tracking-tight">Your Wishlist</h1>
          <p className="text-[#8d949e] text-[15px]">Items you've liked and want to save for later.</p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-[#e4e6eb] text-center space-y-6">
          <div className="w-20 h-20 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-[18px] font-bold text-black">Your wishlist is empty</h3>
            <p className="text-[#8d949e] text-[14px]">Start exploring our unique collection and save your favorites here.</p>
          </div>
          <Link to="/">
            <Button className="bg-black text-white px-10 h-12 rounded-lg font-bold uppercase tracking-widest flex items-center gap-2 mx-auto">
              <ShoppingBag className="w-4 h-4" /> Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}
    </Container>
  );
};
