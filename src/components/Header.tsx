import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, ChevronDown, Sparkles, MapPin, LogOut, Settings } from 'lucide-react';
import { User, CartItem } from '../types.js';

interface HeaderProps {
  user: User | null;
  cart: CartItem[];
  wishlistLength: number;
  onNavigate: (page: string, slug?: string) => void;
  onLogout: () => void;
  currentPage: string;
  currentSlug?: string;
  settings?: any;
}

export default function Header({ user, cart, wishlistLength, onNavigate, onLogout, currentPage, currentSlug = '', settings }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [logoError, setLogoError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Calculate cart items total
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Fetch categories for mega-dropdown
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching header categories:', err);
        setCategories([]);
      });
  }, []);

  // AJAX Search Autocomplete Suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data && data.products) {
            setSuggestions(data.products);
          }
        })
        .catch(err => console.error('Error fetching search suggestions:', err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    onNavigate('product', slug);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Floating Glassmorphism Header */}
      <header className="sticky top-2 z-50 px-3 sm:px-4 py-1.5 max-w-[1440px] mx-auto w-full transition-all duration-300">
        <div className="glass-header rounded-2xl sm:rounded-3xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between transition-all duration-300">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            {settings?.logo_light && !logoError ? (
              <img 
                src={settings.logo_light} 
                alt="Jaydev Fragrances Logo" 
                className="h-10 object-contain" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-maroon-800 text-white flex items-center justify-center rounded-xl border border-maroon-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="font-serif font-bold text-lg tracking-widest text-amber-200">J</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold tracking-[0.18em] text-neutral-900 group-hover:text-maroon-800 transition-colors duration-300">
                      JAYDEV FRAGRANCES
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-maroon-50 text-maroon-800 border border-maroon-200 px-1.5 py-0.5 rounded-md">
                      v1.6.2
                    </span>
                  </div>
                  <span className="text-[8px] font-sans font-bold tracking-[0.3em] text-maroon-800 uppercase leading-none mt-0.5">
                    Divine Agarbatti, Dhoop & Kapoor
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Floating Glass Desktop Navigation Bar (No border, no shadow) */}
          <nav className="hidden lg:flex items-center gap-7 px-6 py-2.5 rounded-full glass-nav-pill font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-800">
            <span 
              onClick={() => onNavigate('home')} 
              className={`cursor-pointer hover:text-maroon-800 font-bold transition-all duration-300 ${currentPage === 'home' ? 'text-maroon-800 border-b-2 border-maroon-800 pb-0.5' : ''}`}
            >
              Home
            </span>
            
            {/* Categories Dropdown Menu */}
            <div className="relative group">
              <button 
                className="flex items-center gap-1 cursor-pointer hover:text-maroon-800 font-bold transition-all duration-300 uppercase tracking-[0.18em]"
                onClick={() => onNavigate('shop')}
              >
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              <div className="absolute left-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-neutral-100 rounded-2xl shadow-2xl py-2.5 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="relative group/sub">
                    <button
                      onClick={() => onNavigate("shop", `category=${cat.slug || cat.id}`)}
                      className="w-full text-left px-4 py-2.5 text-xs font-sans text-neutral-800 hover:bg-maroon-50/70 hover:text-maroon-800 transition-colors flex items-center justify-between font-semibold"
                    >
                      <span>{cat.name}</span>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">
                          {cat.subcategories.length}
                        </span>
                      )}
                    </button>
                    
                    {/* Subcategories Level-2 Hover Dropdown */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="absolute left-full top-0 ml-1.5 w-56 bg-white/95 backdrop-blur-2xl border border-neutral-100 rounded-2xl shadow-2xl py-2 opacity-0 group-hover/sub:opacity-100 invisible group-hover/sub:visible transition-all duration-300 z-50">
                        {cat.subcategories.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() => onNavigate("shop", `category=${cat.slug || cat.id}&subcategory=${sub.slug || sub.id}`)}
                            className="w-full text-left px-4 py-2 text-[11px] font-sans text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="px-4 py-3 text-xs text-neutral-400 italic font-sans">
                    No categories found.
                  </div>
                )}
                
                <div className="border-t border-neutral-100 mt-1.5 pt-1.5 px-2">
                  <button
                    onClick={() => onNavigate('shop')}
                    className="w-full text-center px-4 py-2 text-[10px] font-sans text-maroon-800 font-extrabold hover:bg-maroon-50/60 rounded-xl tracking-wider uppercase transition-colors"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            </div>
            
            <span 
              onClick={() => onNavigate('page', 'faqs')} 
              className={`cursor-pointer hover:text-maroon-800 font-bold transition-all duration-300 ${currentPage === 'page' && currentSlug === 'faqs' ? 'text-maroon-800 border-b-2 border-maroon-800 pb-0.5' : ''}`}
            >
              FAQs
            </span>
            
            <span 
              onClick={() => onNavigate('contact')} 
              className={`cursor-pointer hover:text-maroon-800 font-bold transition-colors ${currentPage === 'contact' ? 'text-maroon-800 border-b-2 border-maroon-800 pb-0.5' : ''}`}
            >
              Contact
            </span>

            <span 
              onClick={() => onNavigate('page', 'about-us')} 
              className={`cursor-pointer hover:text-maroon-800 font-bold transition-all duration-300 ${currentPage === 'page' && currentSlug === 'about-us' ? 'text-maroon-800 border-b-2 border-maroon-800 pb-0.5' : ''}`}
            >
              About Us
            </span>
          </nav>

          {/* Search, Wishlist, Cart, Profile Icons */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            
            {/* AJAX Autocomplete Search Bar - Desktop */}
            <div ref={searchRef} className="hidden md:block relative w-64 lg:w-80">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search premium fragrances..."
                    className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 rounded-full text-xs font-sans bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                  />
                  <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-gray-400 hover:text-black text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-3.5 py-1 bg-gray-50 border-b border-gray-100 mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">Fragrance Suggestions</span>
                  </div>
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSuggestionClick(p.slug)}
                      className="px-3.5 py-2 hover:bg-gold-50/40 cursor-pointer flex items-center gap-2.5 transition-colors border-b border-neutral-50/50 last:border-0"
                    >
                      <img 
                        src={p.primary_image} 
                        alt={p.name} 
                        className="w-8 h-8 rounded object-cover bg-neutral-50"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-sans font-semibold text-neutral-800 truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-neutral-400 truncate">{p.brand_name || 'Jaydev Luxury'} • {p.category_name}</span>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-[11px] font-mono font-medium text-gold-500">₹{Math.round(p.min_price)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="px-3.5 pt-2 pb-1 border-t border-neutral-100 text-center">
                    <span 
                      onClick={() => {
                        onNavigate('shop', `search=${encodeURIComponent(searchQuery)}`);
                        setShowSuggestions(false);
                      }}
                      className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-500 hover:text-gold-600 cursor-pointer"
                    >
                      View all matching fragrances
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button 
              onClick={() => onNavigate('wishlist')} 
              className="relative p-1.5 text-gray-700 hover:text-red-500 hover:scale-105 transition-all duration-300 cursor-pointer"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistLength > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistLength}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button 
              onClick={() => onNavigate('cart')} 
              className="relative p-1.5 text-gray-700 hover:text-gold-500 hover:scale-105 transition-all duration-300 cursor-pointer"
              title="View Cart Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-neutral-950 text-white text-[9px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center border border-gold-500/40">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Options */}
            <div className="relative group">
              <button 
                onClick={() => user ? onNavigate('account') : onNavigate('login')}
                className="p-1.5 text-gray-700 hover:text-gold-500 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-1"
                title="Your Account"
              >
                <UserIcon className="w-5 h-5" />
                {user && <span className="hidden xl:inline text-xs font-sans font-semibold text-gray-800">{user.name.split(' ')[0]}</span>}
              </button>

              {/* Account Dropdown */}
              {user && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-100 rounded-lg shadow-xl py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                    <p className="text-xs font-sans font-bold text-neutral-800 truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400 truncate">{user.email}</p>
                  </div>
                  
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left px-4 py-2 text-xs font-sans text-gold-600 font-bold hover:bg-gold-50/50 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Admin Panel
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onNavigate('account')}
                    className="w-full text-left px-4 py-2 text-xs font-sans text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> Dashboard Portal
                  </button>
                  
                  <button 
                    onClick={() => onNavigate('account', 'tab=orders')}
                    className="w-full text-left px-4 py-2 text-xs font-sans text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Order History
                  </button>
                  
                  <button 
                    onClick={() => onNavigate('account', 'tab=addresses')}
                    className="w-full text-left px-4 py-2 text-xs font-sans text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Manage Addresses
                  </button>
                  
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-xs font-sans text-red-600 hover:bg-red-50/50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-1.5 text-neutral-700 hover:text-black cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in flex flex-col justify-between z-[70]">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                <span className="font-sans font-bold text-sm tracking-[0.25em] text-neutral-950">JAYDEV FRAGRANCES</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-neutral-500 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="my-6">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search fragrance..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-full text-xs font-sans bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                    />
                    <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-400" />
                    {searchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-2.5 text-gray-400 hover:text-black text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </form>

                {/* Suggestions dropdown for mobile */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="w-full bg-white border border-gray-100 rounded-lg shadow-sm py-2 mt-2 max-h-64 overflow-y-auto relative z-50">
                    {suggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleSuggestionClick(p.slug);
                          setIsMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-gold-50/40 cursor-pointer flex items-center gap-2 transition-colors border-b border-neutral-50 last:border-0"
                      >
                        <img src={p.primary_image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-sans font-semibold text-neutral-800 truncate">{p.name}</span>
                        </div>
                      </div>
                    ))}
                    <div className="px-3 pt-2 text-center border-t border-neutral-50 mt-1">
                      <span 
                        onClick={() => {
                          onNavigate('shop', `search=${encodeURIComponent(searchQuery)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-500 hover:text-gold-600 cursor-pointer"
                      >
                        View all results
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Menu Links */}
              <nav className="flex flex-col gap-4 font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-800">
                <span 
                  onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }} 
                  className="cursor-pointer py-1.5 border-b border-neutral-50 hover:text-gold-500 block font-semibold"
                >
                  Home
                </span>
                
                {/* Categories with collapsible accordion */}
                <div className="border-b border-neutral-50 pb-1.5">
                  <button 
                    onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                    className="w-full flex items-center justify-between text-left py-1.5 font-semibold text-neutral-800 hover:text-gold-500"
                  >
                    <span>Categories</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoriesDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {isCategoriesDropdownOpen && (
                    <div className="pl-4 mt-2 flex flex-col gap-3 font-sans normal-case text-xs text-neutral-600 border-l border-neutral-100">
                      {categories.map((cat: any) => (
                        <div key={cat.id} className="flex flex-col gap-1.5">
                          <button
                            onClick={() => { onNavigate("shop", `category=${cat.slug || cat.id}`); setIsMobileMenuOpen(false); }}
                            className="text-left font-semibold text-neutral-800 hover:text-gold-600 flex items-center justify-between"
                          >
                            <span>{cat.name}</span>
                          </button>
                          
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div className="pl-3 flex flex-col gap-1.5 border-l border-neutral-50 mt-1">
                              {cat.subcategories.map((sub: any) => (
                                <button
                                  key={sub.id}
                                  onClick={() => { onNavigate("shop", `category=${cat.slug || cat.id}&subcategory=${sub.slug || sub.id}`); setIsMobileMenuOpen(false); }}
                                  className="text-left text-[11px] text-neutral-500 hover:text-neutral-950"
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <span className="text-[10px] text-neutral-400 italic">No categories found</span>
                      )}
                    </div>
                  )}
                </div>
                
                <span 
                  onClick={() => { onNavigate('page', 'faqs'); setIsMobileMenuOpen(false); }} 
                  className="cursor-pointer py-1.5 border-b border-neutral-50 hover:text-gold-500 block font-semibold"
                >
                  FAQs
                </span>
                <span 
                  onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }} 
                  className="cursor-pointer py-1.5 border-b border-neutral-50 hover:text-gold-500 block font-semibold"
                >
                  Contact
                </span>
                <span 
                  onClick={() => { onNavigate('page', 'about-us'); setIsMobileMenuOpen(false); }} 
                  className="cursor-pointer py-1.5 hover:text-gold-500 block font-semibold"
                >
                  About Us
                </span>
              </nav>
            </div>

            {/* Mobile Footer Area */}
            <div className="border-t border-neutral-100 pt-6 mt-6">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-neutral-950 text-white flex items-center justify-center rounded-full font-sans font-bold text-xs border border-gold-500">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-sans font-bold text-neutral-800">{user.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => { onNavigate('account'); setIsMobileMenuOpen(false); }}
                      className="text-center py-2 bg-neutral-50 hover:bg-neutral-100 rounded text-xs font-sans font-semibold text-neutral-700"
                    >
                      Dashboard
                    </button>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                        className="text-center py-2 bg-gold-50/50 hover:bg-gold-100/50 rounded text-xs font-sans font-bold text-gold-700"
                      >
                        Admin Panel
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full text-center py-2 border border-red-100 text-red-600 hover:bg-red-50 rounded text-xs font-sans mt-1 flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout Account
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 bg-neutral-950 text-white rounded text-xs font-sans font-bold tracking-[0.18em] uppercase hover:bg-neutral-900 transition-all duration-300"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 border border-neutral-950 text-neutral-950 rounded text-xs font-sans font-bold tracking-[0.18em] uppercase hover:bg-neutral-50 transition-all duration-300"
                  >
                    Register Account
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
