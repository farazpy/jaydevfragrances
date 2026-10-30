import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard.js';
import { Product } from '../types.js';

interface WishlistProps {
  onNavigate: (page: string, slug?: string) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
}

export default function Wishlist({ onNavigate, onToggleWishlist, wishlist }: WishlistProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Fetch products in wishlist
    fetch(`/api/products?ids=${wishlist.join(',')}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-serif text-gray-400 animate-pulse">
        Retrieving your custom fragrance wishlist...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-neutral-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 mb-5 animate-pulse">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-lg font-bold text-gray-800">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 font-serif italic mt-1.5 max-w-sm">
          "Log your favorite scent formulations, aged attars, and luxury gift boxes inside your custom wishlist for rapid procurement."
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-8 px-8 py-3 bg-black hover:bg-yellow-600 text-white rounded-full font-serif font-bold text-xs uppercase tracking-widest shadow transition-all duration-300 cursor-pointer"
        >
          Discover Fragrances
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase mb-10 text-center md:text-left">
          YOUR SCENT WISHLIST ({products.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard 
              key={p.id}
              product={p}
              onNavigate={onNavigate}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(p.id)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
