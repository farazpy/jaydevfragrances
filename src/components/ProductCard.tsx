import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Clock } from 'lucide-react';
import { Product } from '../types.js';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, slug?: string) => void;
  onToggleWishlist: (productId: number) => void;
  isWishlisted: boolean;
  onQuickAdd?: (product: Product) => void;
  key?: any;
}

export default function ProductCard({ product, onNavigate, onToggleWishlist, isWishlisted, onQuickAdd }: ProductCardProps) {
  const minPrice = product.min_price || 0;
  const maxMrp = product.max_mrp || 0;
  const hasDiscount = maxMrp > minPrice;
  const discountPercent = hasDiscount ? Math.round(((maxMrp - minPrice) / maxMrp) * 100) : 0;

  return (
    <div className="clean-card bg-white rounded-xl overflow-hidden flex flex-col group relative">
      
      {/* Badge container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        {hasDiscount && (
          <span className="bg-maroon-800 text-white text-[8px] font-sans font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
        {product.is_featured === true && (
          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[8px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            FEATURED
          </span>
        )}
        {product.is_best_seller === true && (
          <span className="bg-neutral-900 text-white text-[8px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            BEST SELLER
          </span>
        )}
      </div>

      {/* Wishlist toggle button */}
      <button 
        onClick={() => onToggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-xs hover:bg-white rounded-lg shadow-xs text-neutral-400 hover:text-red-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-neutral-100"
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-600 text-red-600" : ""}`} />
      </button>

      {/* Product Image Stage */}
      <div 
        onClick={() => onNavigate('product', product.slug)}
        className="relative aspect-square w-full bg-neutral-50 overflow-hidden cursor-pointer"
      >
        <img 
          src={product.primary_image || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Hover action cover */}
        <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('product', product.slug);
            }}
            className="btn-rounded px-3.5 py-1.5 bg-white text-neutral-900 hover:bg-maroon-800 hover:text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> View Product
          </button>
        </div>
      </div>

      {/* Info Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onNavigate('product', product.slug)}>
          
          {/* Brand Name & Agarbatti Burn Time */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-mono tracking-wider text-maroon-800 font-bold uppercase">
              {product.brand_name || 'Jaydev Fragrances'}
            </span>
            {product.burn_time && (
              <span className="text-[8px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/80 font-bold flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-amber-600" /> {product.burn_time}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-xs sm:text-[13px] font-bold text-neutral-900 group-hover:text-maroon-800 line-clamp-1 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Category Chip & Star Rating */}
          <div className="flex items-center justify-between gap-1 mt-1.5">
            <span className="text-[10px] font-sans text-neutral-500 tracking-wide truncate">
              {product.scent_type || product.category_name || 'Pure Agarbatti'}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span className="text-[9px] font-mono font-bold text-amber-900">{parseFloat(product.rating || '4.8').toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Triggers */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] font-sans text-neutral-400 uppercase tracking-wider leading-none">Starting from</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xs sm:text-sm font-extrabold text-neutral-900">₹{Math.round(minPrice)}</span>
              {hasDiscount && (
                <span className="font-mono text-[10px] sm:text-xs text-neutral-400 line-through">₹{Math.round(maxMrp)}</span>
              )}
            </div>
          </div>

          {/* Quick Shop Action - Little Rounded Maroon Button */}
          <button
            onClick={() => onQuickAdd ? onQuickAdd(product) : onNavigate('product', product.slug)}
            className="btn-rounded btn-maroon px-3 py-1.5 text-[10px] uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            title="Choose Variant & Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

      </div>

    </div>
  );
}
