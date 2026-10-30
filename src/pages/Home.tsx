import Preloader from '../components/Preloader.js';
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, Star, Mail, Flame, Flower2, Wind, Sun, Feather, Medal, CheckCircle2 } from 'lucide-react';
import HeroSlider from '../components/HeroSlider.js';
import ProductCard from '../components/ProductCard.js';
import DbConnectionAlert, { DbStatusData } from '../components/DbConnectionAlert.js';
import { Product, Category } from '../types.js';

interface HomeProps {
  onNavigate: (page: string, slug?: string) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  onAddToCart: (productId: number, variantId: number, qty: number) => void;
}

export default function Home({ onNavigate, onToggleWishlist, wishlist, onAddToCart }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState<Record<number, Product[]>>({});
  const [dbStatus, setDbStatus] = useState<DbStatusData | null>(null);
  
  // Newsletter subscription
  const [newsEmail, setNewsEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState('');

  const fetchDbStatus = async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? '/api/db-status?refresh=true' : '/api/db-status';
      const res = await fetch(url);
      const data = await res.json();
      setDbStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch DB status:', err);
      return null;
    }
  };

  const loadStoreData = async () => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setCategories([]);
      });

    // Fetch featured products with fallback
    fetch('/api/products?type=featured&limit=8')
      .then(res => res.json())
      .then(data => {
        if (data && data.products && data.products.length > 0) {
          setFeaturedProducts(data.products);
        } else {
          fetch('/api/products?limit=8')
            .then(r => r.json())
            .then(fallbackData => {
              if (fallbackData && fallbackData.products) {
                setFeaturedProducts(fallbackData.products);
              }
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleRefreshAll = async () => {
    const status = await fetchDbStatus(true);
    if (status && status.connected) {
      await loadStoreData();
    }
  };

  useEffect(() => {
    let fetched = 0;
    const checkDone = () => {
      fetched++;
      if (fetched >= 3) {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDbStatus().then(checkDone).catch(checkDone);

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        checkDone();
      })
      .catch(err => {
        console.error(err);
        setCategories([]);
        checkDone();
      });

    // Fetch featured products with fallback
    fetch('/api/products?type=featured&limit=8')
      .then(res => res.json())
      .then(data => {
        if (data && data.products && data.products.length > 0) {
          setFeaturedProducts(data.products);
          checkDone();
        } else {
          // Fallback to latest products if featured items are not flagged
          fetch('/api/products?limit=8')
            .then(r => r.json())
            .then(fallbackData => {
              if (fallbackData && fallbackData.products) {
                setFeaturedProducts(fallbackData.products);
              }
              checkDone();
            })
            .catch(() => checkDone());
        }
      })
      .catch(err => {
        console.error(err);
        checkDone();
      });
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const topCats = categories.slice(0, 5);
      topCats.forEach(cat => {
        const catQuery = cat.slug ? `category=${cat.slug}` : `category=${cat.id}`;
        fetch(`/api/products?${catQuery}&limit=4`)
          .then(res => res.json())
          .then(data => {
            if (data && data.products && data.products.length > 0) {
              setCategoryProducts(prev => ({ ...prev, [cat.id]: data.products }));
            } else {
              // Fallback query by ID
              fetch(`/api/products?category=${cat.id}&limit=4`)
                .then(r => r.json())
                .then(fb => {
                  if (fb && fb.products) {
                    setCategoryProducts(prev => ({ ...prev, [cat.id]: fb.products }));
                  }
                });
            }
          })
          .catch(err => console.error(err));
      });
    }
  }, [categories]);

  if (loading) {
    return <Preloader text="Preparing Agarbatti Store..." fullScreen={true} />;
  }

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim()) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsStatus(data.message || 'Subscribed successfully!');
        setNewsEmail('');
      } else {
        setNewsStatus(data.error || 'Failed to subscribe.');
      }
    } catch {
      setNewsStatus('Connection error.');
    }
  };

  // Curated Agarbatti Blogs
  const blogs = [
    {
      id: 1,
      title: "The Healing Vibrations of Pure Bhimseni Kapoor",
      desc: "Learn how authentic camphor crystal purifies indoor air, eliminates negative energies, and promotes respiratory health when burned daily.",
      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      date: "Oct 12, 2026"
    },
    {
      id: 2,
      title: "Why We Do Not Use Charcoal in Our Incense",
      desc: "An essential guide to understanding the toxic side-effects of charcoal-based agarbattis and how our organic bamboo-free alternatives ensure clean breathing.",
      img: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600",
      date: "Nov 04, 2026"
    },
    {
      id: 3,
      title: "The Rich Heritage of Mysore Sandalwood Dhoop",
      desc: "Delve into the historic, creamy, woody universe of hand-rolled chandan incense cones, used for centuries in sacred Indian meditation chambers.",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      date: "Nov 28, 2026"
    }
  ];

  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans">
      
      {/* Database Connection Alert (Prominently displayed if MySQL is disconnected) */}
      {dbStatus && !dbStatus.connected && (
        <DbConnectionAlert status={dbStatus} onRefresh={handleRefreshAll} />
      )}

      {/* 1. Hero Banner Slider Stage */}
      <HeroSlider onNavigate={onNavigate} />

      {/* 2. Premium Grid of Colorful Agarbatti Value Props - Clean White Card */}
      <div className="bg-neutral-50 border-y border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-xs">
              <Feather className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-900">
              <span className="highlight-maroon text-[10px]">100% Charcoal-Free</span>
            </h4>
            <p className="text-[11px] text-neutral-500 leading-snug">Zero toxic smoke, organic natural herb & resin base.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-xs">
              <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-900">
              <span className="highlight-saffron text-[10px]">Pure Bhimseni Kapoor</span>
            </h4>
            <p className="text-[11px] text-neutral-500 leading-snug">Vaporizes completely leaving zero black residue or soot.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold shadow-xs">
              <Flower2 className="w-5 h-5 text-rose-600" />
            </div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-900">
              <span className="highlight-gold text-[10px]">Kannauj & Mysore Blend</span>
            </h4>
            <p className="text-[11px] text-neutral-500 leading-snug">Natural rose extracts and authentic Mysore sandalwood.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5 text-sky-600" />
            </div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-neutral-900">
              <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] px-2 py-0.5 rounded font-bold">Free Shipping & COD</span>
            </h4>
            <p className="text-[11px] text-neutral-500 leading-snug">Fast delivery across India on orders over ₹999.</p>
          </div>

        </div>
      </div>

      {/* 3. Agarbatti Craft Showcase Banner - White Card with Maroon Primary Accent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-neutral-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-2xl relative z-10 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 bg-maroon-50 px-3 py-1 rounded-full border border-maroon-200 text-[10px] font-sans uppercase tracking-[0.2em] text-maroon-800 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-maroon-800 animate-pulse" /> Traditional Agarbatti Craftsmanship
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-neutral-900 leading-tight">
              Experience <span className="highlight-maroon">100% Bamboo-Free</span> & <span className="highlight-saffron">Charcoal-Free</span> Agarbatti
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
              Unlike generic commercial incense, <span className="font-bold text-maroon-800">Jaydev Agarbatti</span> is crafted using pure flower petals, organic herbs, natural resin, and essential oils. Perfect for <span className="highlight-gold">Daily Morning Aarti</span>, <span className="highlight-maroon">Meditation Chambers</span>, and <span className="highlight-saffron">Temple Offerings</span>.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="btn-maroon btn-rounded px-6 py-3 text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-200" /> Shop Incense Collection
              </button>
              <button
                onClick={() => onNavigate('page', 'about-us')}
                className="btn-rounded px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-wider border border-neutral-200 flex items-center gap-2 cursor-pointer"
              >
                Learn Heritage Story <ArrowRight className="w-4 h-4 text-maroon-800" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-80 h-64 rounded-xl overflow-hidden shadow-md shrink-0 border border-neutral-200">
            <img 
              src="https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800" 
              alt="Handcrafted Agarbatti sticks" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>

        </div>
      </section>

      {/* 4. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-maroon-50 px-3.5 py-1 rounded-full border border-maroon-200 text-[10px] font-sans uppercase tracking-[0.2em] text-maroon-800 font-bold mb-3">
            <Flame className="w-3.5 h-3.5 text-maroon-800" /> Handcrafted Divine Fragrances
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-neutral-900 uppercase">
            EXPLORE <span className="highlight-maroon">SACRED CATEGORIES</span>
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            Select your preferred daily worship or aromatherapy blend from our authentic collection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.length > 0 ? (
            categories.slice(0, 5).map((cat) => (
              <div 
                key={cat.id}
                onClick={() => onNavigate('shop', `category=${cat.id}`)}
                className="clean-card group relative rounded-xl overflow-hidden aspect-square border border-neutral-200 bg-neutral-900 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
              >
                <img 
                  src={cat.image || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 opacity-85 group-hover:opacity-75 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col items-start">
                  <span className="text-[8px] font-sans tracking-[0.25em] text-amber-300 uppercase font-bold mb-1">
                    Explore Range
                  </span>
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
              {dbStatus && !dbStatus.connected
                ? "MySQL database is offline. Please review the troubleshooting guide above to restore connection."
                : "No categories currently found in database."}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Category Sections */}
      {categories.slice(0, 5).map((cat) => {
        const products = categoryProducts[cat.id] || [];
        if (products.length === 0) return null;
        return (
          <section key={cat.id} className="py-14 bg-white border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="inline-block mb-1.5">
                    <span className="highlight-maroon text-[10px] uppercase tracking-widest">{cat.name} Range</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-neutral-900 uppercase">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-neutral-500 font-sans mt-1 max-w-2xl leading-relaxed">
                    {cat.description || `Explore our premium collection of ${cat.name}, carefully crafted for your spiritual and aromatic needs.`}
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate("shop", `category=${cat.slug || cat.id}`)}
                  className="btn-rounded px-4 py-2 bg-neutral-50 hover:bg-maroon-50 text-neutral-800 hover:text-maroon-800 border border-neutral-200 hover:border-maroon-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  View All {cat.name} <ArrowRight className="w-3.5 h-3.5 text-maroon-800" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
            </div>
          </section>
        );
      })}

      {/* 5. Brand Heritage - Clean White Panel with Maroon Primary Accent */}
      <section className="bg-neutral-50 py-20 border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="flex flex-col items-start gap-4">
              <span className="text-[9px] font-mono tracking-[0.25em] text-maroon-800 uppercase font-bold bg-maroon-50 px-2.5 py-1 rounded border border-maroon-200">
                ESTABLISHED 1995 • HERITAGE OF PURITY
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wide text-neutral-900 uppercase leading-snug">
                THE SACRED HERITAGE OF <span className="highlight-maroon">JAYDEV FRAGRANCES</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm leading-relaxed text-neutral-700 italic">
                "We preserve the authentic natural purity of classical Indian incense. By combining organic roots, resins, and flowers, we create clean-burning, charcoal-free Agarbattis that nurture peace and spiritual focus."
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                Sourcing sustainable Mysore Sandalwood, 100% pure Bhimseni Camphor crystals, and sweet Kashmiri Saffron, every batch is prepared with devotion to ensure your home smells like a serene, hallowed sanctuary.
              </p>
              <div className="mt-2">
                <button 
                  onClick={() => onNavigate('page', 'about-us')}
                  className="btn-maroon btn-rounded px-6 py-3 text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-2"
                >
                  Read Heritage Story <ArrowRight className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=1000" 
                alt="Sacred incense heritage" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. Dynamic Handcrafted Scent Grid (Featured Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-[10px] font-sans uppercase tracking-[0.2em] text-amber-900 font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Handpicked Bestsellers
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-neutral-900 uppercase">
            FEATURED <span className="highlight-saffron">SACRED FORMULATIONS</span>
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-2">
            Highly-coveted signature spiritual formulations curated by our master blenders for deep purifying peace.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 8).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onNavigate={onNavigate}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
              {dbStatus && !dbStatus.connected
                ? "Database connection is offline. Connect MySQL using the instructions at the top of the page to load products."
                : "No featured products available at this time."}
            </div>
          )}
        </div>
      </section>

      {/* 7. Customer Reviews & Testimonials - Clean White Cards */}
      <section className="bg-neutral-50 border-t border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-neutral-900 uppercase">
              VOICES OF <span className="highlight-maroon">DEVOTION</span>
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-2">
              What devotees and home wellness practitioners say about their sacred Jaydev journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clean-card p-6 rounded-xl flex flex-col justify-between">
              <p className="text-xs font-sans leading-relaxed text-neutral-600 italic">
                "The Bhimseni Kapoor is a masterpiece. I burned it in my home burner and it completely cleared the air, leaving a beautiful pine and cedar-like aroma that lingered for hours. Absolutely pure."
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3.5">
                <div className="flex-1">
                  <h4 className="text-xs font-sans font-bold text-neutral-900">Siddharth Mehta</h4>
                  <p className="text-[10px] font-mono text-maroon-800 font-semibold">Verified Purchaser</p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="clean-card p-6 rounded-xl flex flex-col justify-between">
              <p className="text-xs font-sans leading-relaxed text-neutral-600 italic">
                "I have been using traditional dhoop and incense for 20 years, but Jaydev's Sandalwood and Mogra sticks are something else. Zero charcoal smoke headache, just pure, creamy, soothing devotion."
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3.5">
                <div className="flex-1">
                  <h4 className="text-xs font-sans font-bold text-neutral-900">Dr. Meera Iyer</h4>
                  <p className="text-[10px] font-mono text-maroon-800 font-semibold">Verified Purchaser</p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="clean-card p-6 rounded-xl flex flex-col justify-between">
              <p className="text-xs font-sans leading-relaxed text-neutral-600 italic">
                "Their packaging is so premium—exquisite heavy cardboard boxes. I bought the Sacred Mysore Sandalwood Box for my parents for Diwali, and they were completely blown away by the presentation and divine aroma."
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3.5">
                <div className="flex-1">
                  <h4 className="text-xs font-sans font-bold text-neutral-900">Vikram Malhotra</h4>
                  <p className="text-[10px] font-mono text-maroon-800 font-semibold">Verified Purchaser</p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Recent Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-200">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-neutral-900 uppercase">
            THE SACRED AROMA <span className="highlight-saffron">JOURNAL</span>
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-2">
            Delve deeper into organic ingredient purity, morning and evening rituals, and classical sacred traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="clean-card rounded-xl overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden bg-neutral-100">
                <img 
                  src={blog.img} 
                  alt={blog.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono tracking-wider text-maroon-800 font-bold block mb-1.5 uppercase">{blog.date}</span>
                  <h3 className="font-serif text-xs sm:text-[13px] font-bold text-neutral-900 mb-2 hover:text-maroon-800 transition-colors cursor-pointer leading-snug">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-sans leading-relaxed line-clamp-3">
                    {blog.desc}
                  </p>
                </div>
                <div className="border-t border-neutral-100 mt-4 pt-3 text-left">
                  <span className="text-[10px] font-sans text-maroon-800 font-bold uppercase tracking-widest hover:text-maroon-900 cursor-pointer inline-flex items-center gap-1">
                    Read Article <ArrowRight className="w-3 h-3 text-maroon-800" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Interactive Newsletter Welcome Panel - Clean Primary Accent */}
      <section className="bg-maroon-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-maroon-800 border border-maroon-700 flex items-center justify-center text-amber-300 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wide text-white uppercase">
            JOIN THE <span className="bg-amber-300 text-maroon-950 px-2 py-0.5 rounded font-extrabold">SACRED CIRCLE</span>
          </h2>
          <p className="text-xs text-maroon-100 max-w-lg leading-relaxed font-sans">
            Receive private invitations to new sacred batches, seasonal launches, and enjoy <span className="bg-amber-300 text-maroon-950 px-1.5 py-0.5 rounded font-bold">₹100 OFF</span> your first handcrafted incense purchase.
          </p>

          <form onSubmit={handleNewsSubmit} className="w-full max-w-md mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={newsEmail}
              onChange={(e) => {
                setNewsEmail(e.target.value);
                setNewsStatus('');
              }}
              placeholder="Your email address..."
              className="flex-1 px-4 py-2.5 bg-maroon-950 border border-maroon-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-300 transition-colors"
            />
            <button
              type="submit"
              className="btn-rounded px-6 py-2.5 bg-amber-300 hover:bg-amber-200 text-maroon-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>
          {newsStatus && (
            <p className="text-[11px] text-amber-200 font-mono italic animate-pulse mt-1">{newsStatus}</p>
          )}
        </div>
      </section>

    </div>
  );
}
