import Preloader from '../components/Preloader.js';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, Grid, Star, RefreshCw, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard.js';
import { Product, Category, Brand } from '../types.js';

interface ShopProps {
  onNavigate: (page: string, slug?: string) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  initialFilters?: string; // Query parameters like "category=1" or "search=Oud"
}

export default function Shop({ onNavigate, onToggleWishlist, wishlist, initialFilters }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Active Filters state
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load categories and brands for sidebar filters
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error loading shop categories:', err));

    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error loading shop brands:', err));
  }, []);

  // Parse initial query params (like "category=agarbatti" or "search=Chandan")
  useEffect(() => {
    if (initialFilters) {
      const params = new URLSearchParams(initialFilters);
      const cat = params.get('category');
      const brd = params.get('brand');
      const srch = params.get('search');
      if (cat) {
        if (!isNaN(Number(cat))) setSelectedCategory(Number(cat));
      }
      if (brd) {
        if (!isNaN(Number(brd))) setSelectedBrand(Number(brd));
      }
      if (srch) setSearchQuery(srch);
    }
  }, [initialFilters]);

  // Fetch product list when filters or page change
  useEffect(() => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=9`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (selectedBrand) url += `&brand=${selectedBrand}`;
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    if (minPrice > 0) url += `&minPrice=${minPrice}`;
    if (maxPrice < 15000) url += `&maxPrice=${maxPrice}`;
    if (sortBy !== "default") url += `&sort=${sortBy}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          setProducts(data.products);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalItems(data.pagination?.total || 0);
          setTimeout(() => setLoading(false), 300);
        }
      })
      .catch(err => {
        console.error('Error loading shop products:', err);
        setLoading(false);
      });
  }, [selectedCategory, selectedBrand, searchQuery, minPrice, maxPrice, sortBy, page]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(15000);
    setSortBy('default');
    setPage(1);
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* Header Banner - Luxury Minimal */}
      <div className="bg-neutral-50 border-b border-gray-100 py-12 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 uppercase">
          {selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.name 
            : (searchQuery ? `Search Results for "${searchQuery}"` : "The Sacred Boutique")}
        </h1>
        <p className="text-xs text-gray-500 font-serif italic mt-2.5 max-w-lg mx-auto px-4">
          {selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.description 
            : "Browse our pristine selections of handcrafted organic Agarbatti, slow-burning Dhoop, and pure Bhimseni Kapoor."}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebars - Filters Column */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8">
            
            {/* Search filter widget */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xs font-bold tracking-widest text-neutral-900 uppercase mb-3.5 pb-2 border-b border-gray-50">
                Keyword Search
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Chandan, Mogra, Kapoor..."
                  className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
                />
                <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Category Filter Widget */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xs font-bold tracking-widest text-neutral-900 uppercase mb-3.5 pb-2 border-b border-gray-50">
                Collections
              </h3>
              <div className="flex flex-col gap-2.5">
                <div 
                  onClick={() => { setSelectedCategory(null); setPage(1); }}
                  className={`flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded transition-all ${selectedCategory === null ? 'bg-black text-white font-bold' : 'text-gray-600 hover:text-yellow-600'}`}
                >
                  <span>All Sacred Items</span>
                </div>
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                    className={`flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded transition-all ${selectedCategory === cat.id ? 'bg-black text-white font-bold' : 'text-gray-600 hover:text-yellow-600'}`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Filter Widget */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xs font-bold tracking-widest text-neutral-900 uppercase mb-3.5 pb-2 border-b border-gray-50">
                Spiritual Brands
              </h3>
              <div className="flex flex-col gap-2.5">
                <div 
                  onClick={() => { setSelectedBrand(null); setPage(1); }}
                  className={`flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded transition-all ${selectedBrand === null ? 'bg-black text-white font-bold' : 'text-gray-600 hover:text-yellow-600'}`}
                >
                  <span>All Brands</span>
                </div>
                {brands.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.id); setPage(1); }}
                    className={`flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded transition-all ${selectedBrand === b.id ? 'bg-black text-white font-bold' : 'text-gray-600 hover:text-yellow-600'}`}
                  >
                    <span>{b.name}</span>
                    {selectedBrand === b.id && <Check className="w-3.5 h-3.5 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter Widget */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xs font-bold tracking-widest text-neutral-900 uppercase mb-3.5 pb-2 border-b border-gray-50">
                Price Budget
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Min: ₹{minPrice}</span>
                  <span>Max: ₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15000" 
                  step="250"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setPage(1); }}
                  className="w-full accent-black cursor-pointer"
                />
                <button 
                  onClick={handleResetFilters}
                  className="w-full mt-2 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded text-[11px] font-mono tracking-wider uppercase text-gray-500 hover:text-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Filters
                </button>
              </div>
            </div>

          </aside>

          {/* Main Catalog Grid */}
          <main className="flex-1">
            
            {/* Header toolbar controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 mb-8 text-xs text-gray-500">
              <div className="font-mono">
                Showing <span className="text-black font-bold">{products.length}</span> of <span className="text-black font-bold">{totalItems}</span> sacred offerings.
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto font-serif">
                <span>Sort By:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 text-xs font-sans text-gray-800"
                >
                  <option value="default">Default / Recommeded</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Empty check & Loading */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Preloader text="Curating Collection..." />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-gray-100/50">
                <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-gray-800">No Products Found</h3>
                <p className="text-xs text-gray-500 italic mt-1.5 max-w-sm mx-auto">
                  We couldn't find any premium products matching your active search keywords or category filters. Please try resetting.
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 bg-black hover:bg-yellow-600 text-white rounded-full font-serif font-bold text-xs uppercase tracking-wider cursor-pointer shadow"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <>
                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  ))}
                </div>

                {/* Pagination bar controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-gray-100 font-mono text-xs">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-black disabled:opacity-40 disabled:hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-black" />
                    </button>
                    
                    <span className="text-gray-500">
                      Page <span className="text-black font-bold">{page}</span> of <span className="text-black font-bold">{totalPages}</span>
                    </span>

                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-black disabled:opacity-40 disabled:hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                  </div>
                )}
              </>
            )}

          </main>

        </div>
      </div>

    </div>
  );
}
