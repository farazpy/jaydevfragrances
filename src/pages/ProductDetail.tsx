import Preloader from '../components/Preloader.js';
import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, Heart, ShieldCheck, RefreshCw, Truck, Send, AlertTriangle, ArrowRight, Sparkles, CheckCircle, Clock, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard.js';
import { Product, ProductImage, ProductVariant, Review } from '../types.js';

interface ProductDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
  onAddToCart: (productId: number, variantId: number, qty: number) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  user: any;
}

export default function ProductDetail({ slug, onNavigate, onAddToCart, onToggleWishlist, wishlist, user }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'how' | 'policies'>('desc');
  
  // Review submission
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [revMsg, setRevMsg] = useState('');
  const [revError, setRevError] = useState('');

  // Loaded state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.product) {
          setProduct(data.product);
          setImages(data.images || []);
          setVariants(data.variants || []);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
          
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0].image_url);
          }
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddBag = () => {
    if (!product || !selectedVariant) return;
    onAddToCart(product.id, selectedVariant.id, qty);
  };
  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    onAddToCart(product.id, selectedVariant.id, qty);
    onNavigate("checkout");
  };


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setRevMsg('');
    setRevError('');

    try {
      const res = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRevMsg(data.message || 'Thank you! Your verified purchase review is now active.');
        setComment('');
        
        // Re-fetch reviews
        fetch(`/api/products/${slug}`)
          .then(r => r.json())
          .then(d => {
            if (d && d.reviews) {
              setReviews(d.reviews);
              if (product) {
                setProduct({
                  ...product,
                  rating: d.product.rating,
                  rating_count: d.product.rating_count
                });
              }
            }
          });
      } else {
        setRevError(data.error || 'Failed to submit review.');
      }
    } catch {
      setRevError('Connection error. Please try again.');
    }
  };

  if (loading) {
    return <Preloader text="Extracting Notes..." />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="font-serif text-lg font-bold text-gray-800">Product Not Found</h3>
        <button onClick={() => onNavigate('shop')} className="mt-4 px-6 py-2.5 bg-black text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          Browse Boutique
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const specs = product.specifications ? JSON.parse(product.specifications) : {};

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-8 uppercase tracking-wider">
          <span onClick={() => onNavigate('home')} className="hover:text-black cursor-pointer">Home</span>
          <span>/</span>
          <span onClick={() => onNavigate('shop')} className="hover:text-black cursor-pointer">Boutique</span>
          <span>/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </div>

        {/* Gallery & Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Image Stages */}
          <div className="flex flex-col gap-4">
            
            {/* Primary Main Stage with active shadow */}
            <div className="aspect-square bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Sub-gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 bg-gray-50/50 transition-colors cursor-pointer ${selectedImage === img.image_url ? 'border-yellow-600 shadow-inner' : 'border-gray-100'}`}
                  >
                    <img src={img.image_url} alt="Gallery view" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Aromatic Info & Dynamic Price Selector */}
          <div className="flex flex-col gap-6">
            
            {/* Brand and category labels */}
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-yellow-600 uppercase">
                {product.brand_name || 'Jaydev Luxury'} • {product.category_name}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1 uppercase">
                {product.name}
              </h1>
              
              {/* Star rating summaries */}
              <div className="flex items-center gap-3.5 mt-3">
                <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded border border-yellow-100 font-mono text-xs font-bold text-yellow-800 shadow-inner">
                  <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  <span>{parseFloat(product.rating || '4.5').toFixed(1)}</span>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  ({product.rating_count} Customer Reviews)
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-mono text-gray-500">
                  SKU: <span className="text-neutral-950 font-bold">{selectedVariant?.sku || product.sku}</span>
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="font-serif text-sm text-gray-500 leading-relaxed italic pr-2">
              "{product.short_description || "Experience the luxurious aroma of our exquisite spiritual creation."}"
            </p>

            {/* Agarbatti & Incense Tailored Attributes Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900/60 block leading-none">Burn Time</span>
                  <span className="font-semibold text-neutral-900">{product.burn_time || '45-50 Mins'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900/60 block leading-none">Scent Profile</span>
                  <span className="font-semibold text-neutral-900 truncate block">{product.scent_type || 'Natural Chandan'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900/60 block leading-none">Packaging</span>
                  <span className="font-semibold text-neutral-900">{product.packaging_type || 'Rigid Box'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900/60 block leading-none">Pooja Dedication</span>
                  <span className="font-semibold text-neutral-900 truncate block">{product.pooja_deity || 'Universal Divine'}</span>
                </div>
              </div>
            </div>

            {/* Size/Volume Variant selectors */}
            <div className="border-y border-gray-100 py-5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">Select Volume / Size</span>
              <div className="flex gap-3.5 mt-3">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQty(1);
                    }}
                    className={`px-5 py-2.5 rounded-xl border text-xs font-serif font-semibold tracking-wider flex items-center gap-2 cursor-pointer transition-all ${selectedVariant?.id === v.id ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                  >
                    <span>{v.size}</span>
                    <span className="font-mono text-[10px] text-yellow-500 font-bold">₹{Math.round(v.sale_price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Price Display */}
            {selectedVariant && (
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-2xl font-bold text-yellow-700">₹{Math.round(selectedVariant.sale_price)}</span>
                {selectedVariant.mrp > selectedVariant.sale_price && (
                  <>
                    <span className="font-mono text-base text-gray-400 line-through">₹{Math.round(selectedVariant.mrp)}</span>
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-yellow-200">
                      SAVE {Math.round(((selectedVariant.mrp - selectedVariant.sale_price) / selectedVariant.mrp) * 100)}%
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Quantity selection & Stock notification */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded p-1 font-mono text-xs font-bold">
                  <button 
                    onClick={() => setQty(q => Math.max(q - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 cursor-pointer rounded-l"
                  >
                    -
                  </button>
                  <span className="w-10 text-center select-none text-neutral-900">{qty}</span>
                  <button 
                    onClick={() => setQty(q => {
                      if (selectedVariant && q >= selectedVariant.stock) {
                        return selectedVariant.stock;
                      }
                      return q + 1;
                    })}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 cursor-pointer rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock check banner */}
              {selectedVariant && (
                <div className="flex flex-col justify-end h-12">
                  {selectedVariant.stock > 0 ? (
                    <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 fill-emerald-50 text-emerald-600" /> In Stock ({selectedVariant.stock} available)
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> Out of Stock
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Cart & Wishlist action drawers */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-serif font-bold text-xs uppercase tracking-widest rounded-full shadow hover:scale-102 active:scale-98 transition-all duration-300 disabled:opacity-40 disabled:hover:bg-yellow-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>

              <button
                onClick={handleAddBag}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 py-4 bg-black hover:bg-yellow-600 text-white font-serif font-bold text-xs uppercase tracking-widest rounded-full shadow hover:scale-102 active:scale-98 transition-all duration-300 disabled:opacity-40 disabled:hover:bg-black disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Luxury Bag
              </button>

              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`px-6 py-4 border rounded-full text-xs font-serif font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer ${isWishlisted ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 hover:border-black text-gray-700'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /> {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Direct Shipping info checklist */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-100 p-4 rounded-2xl mt-4 font-serif text-[10.5px] text-gray-500">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-neutral-900 leading-none mt-1">Direct Shipping</span>
                <span>Across India</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-x border-gray-200/60">
                <RefreshCw className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-neutral-900 leading-none mt-1">7-Day Return</span>
                <span>Unopened boxes</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-neutral-900 leading-none mt-1">Secure Payments</span>
                <span>Fully encrypted</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Tabs: Long description, ingredients, specifications, return policy */}
        <div className="mt-20 border-t border-gray-100 pt-10">
          <div className="flex border-b border-gray-200 font-serif text-sm tracking-wide text-gray-500 gap-6 sm:gap-10 pb-1 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'desc' ? 'border-black text-black font-bold' : 'border-transparent hover:text-black'}`}
            >
              Description & Specs
            </button>
            <button 
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'ingredients' ? 'border-black text-black font-bold' : 'border-transparent hover:text-black'}`}
            >
              Botanical Ingredients
            </button>
            <button 
              onClick={() => setActiveTab('how')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'how' ? 'border-black text-black font-bold' : 'border-transparent hover:text-black'}`}
            >
              How To Use
            </button>
            <button 
              onClick={() => setActiveTab('policies')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'policies' ? 'border-black text-black font-bold' : 'border-transparent hover:text-black'}`}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="py-8 text-xs leading-relaxed text-gray-600 font-serif">
            {activeTab === 'desc' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-3">Aroma Biography</h4>
                  <p className="leading-relaxed whitespace-pre-line">{product.long_description}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6">
                  <h4 className="font-bold text-neutral-900 text-sm mb-3.5">Product Specifications</h4>
                  <div className="flex flex-col gap-2.5 font-mono text-[11px]">
                    {Object.entries(specs).map(([k, v]: any) => (
                      <div key={k} className="flex justify-between border-b border-gray-200/50 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-gray-400 font-medium">{k}</span>
                        <span className="text-neutral-900 font-semibold">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5 last:border-0">
                      <span className="text-gray-400 font-medium">Bespoke Weight</span>
                      <span className="text-neutral-900 font-semibold">{product.weight || '100g'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="max-w-2xl text-left">
                <h4 className="font-bold text-neutral-900 text-sm mb-3">Sourcing Purity & Integrity</h4>
                <p className="whitespace-pre-line leading-relaxed italic mb-4">
                  "At Jaydev Fragrances, we reject cheap synthetic chemicals and toxic charcoal binders. Every batch uses 100% steam-distilled natural organic ingredients."
                </p>
                <p className="whitespace-pre-line leading-relaxed">{product.ingredients || "Product contains rare flower absolutes, organic herbs, and premium natural essential oils."}</p>
              </div>
            )}

            {activeTab === 'how' && (
              <div className="max-w-2xl text-left">
                <h4 className="font-bold text-neutral-900 text-sm mb-3">Traditional Usage Ritual</h4>
                <p className="whitespace-pre-line leading-relaxed">{product.how_to_use || "Place incense stick or cone on a heat-resistant holder, light the tip, let the flame burn for 10 seconds, then gently blow out to experience the divine aroma."}</p>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-2.5">Shipping Guidelines</h4>
                  <p className="whitespace-pre-line leading-relaxed">{product.shipping_info || "We ship across India within 24-48 business hours. Delivery takes 3-5 days. Free Shipping on orders above INR 999."}</p>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-2.5">Return & Exchange Guidelines</h4>
                  <p className="whitespace-pre-line leading-relaxed">{product.return_policy || "We offer a 7-day hassle-free return policy for unopened, sealed products."}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verified reviews Portal */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900 uppercase mb-8">
            Verified Purchase Customer Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Reviews summary list column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {reviews.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 border border-gray-100 rounded-xl font-serif text-xs text-gray-500 italic">
                  No customer reviews have been written for this batch yet.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 font-serif">
                    <div className="flex items-center justify-between gap-2.5 border-b border-gray-50 pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-800">{rev.user_name}</span>
                        <span className="text-[10px] font-mono text-gray-400 mt-0.5">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Verified Badge & Rating stars */}
                      <div className="flex items-center gap-3">
                        {rev.is_verified && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold">
                            Verified Purchase
                          </span>
                        )}
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-yellow-500" : "text-gray-200"}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review Form column */}
            <div className="bg-neutral-50 border border-gray-100 p-5 sm:p-6 rounded-2xl h-fit">
              <h3 className="font-serif text-sm font-bold text-neutral-900 mb-2">
                WRITE A REVIEW
              </h3>
              <p className="font-serif text-[11px] text-gray-500 leading-normal italic mb-5">
                "Verified purchase reviews contribute directly to batch authentication scores."
              </p>

              {user ? (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 font-serif">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Product Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 text-yellow-500 hover:scale-115 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${s <= rating ? "fill-yellow-500" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Your Product Experience</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Discuss fragrance aroma, purity, smoke quality, longevity, serenity level..."
                      className="bg-white border border-gray-200 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-yellow-600"
                    />
                  </div>

                  {revMsg && <p className="text-[11px] text-emerald-600 font-mono italic">{revMsg}</p>}
                  {revError && <p className="text-[11px] text-red-500 font-mono italic">{revError}</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black hover:bg-yellow-600 text-white rounded font-serif font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer"
                  >
                    Post Review Notes
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 italic">Please log in to submit product ratings and comments.</p>
                  <button 
                    onClick={() => onNavigate('login')}
                    className="mt-4 px-5 py-2 border border-black hover:bg-black hover:text-white rounded text-xs font-serif transition-all cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Fragrances Carousel */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900 uppercase text-center mb-10">
              RELATED SACRED CREATIONS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
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
        )}

      </div>
    </div>
  );
}
