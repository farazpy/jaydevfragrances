import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner } from '../types.js';

interface HeroSliderProps {
  onNavigate: (page: string, slug?: string) => void;
}

export default function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          // Fallback static banners if DB isn't seeded yet
          setBanners([
            {
              id: 1,
              title: "Signature Oudh & Attars",
              subtitle: "Experience the timeless elegance of pure aged Oud and artisanal botanical attars.",
              image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1600",
              link: "/category/premium-attars",
              sort_order: 0
            },
            {
              id: 2,
              title: "The Art of Fine Perfumery",
              subtitle: "Indulge in our exquisite collection of luxury Eau de Parfum, crafted with precision.",
              image_url: "https://images.unsplash.com/photo-1615397322964-b8beac469279?auto=format&fit=crop&q=80&w=1600",
              link: "/category/luxury-perfumes",
              sort_order: 1
            },
            {
              id: 3,
              title: "Sacred Spiritual Aromatics",
              subtitle: "Elevate your rituals with organic Bhimseni camphor and charcoal-free dhoop.",
              image_url: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&q=80&w=1600",
              link: "/category/incense",
              sort_order: 2
            }
          ]);
        }
      })
      .catch(err => console.error('Error fetching banners:', err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    setCurrent(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent(prev => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="h-[400px] md:h-[600px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-gray-500 font-serif">Loading Luxury Banners...</span>
      </div>
    );
  }

  const activeBanner = banners[current];

  return (
    <div className="relative w-full bg-[#fcfaf8] overflow-hidden group flex flex-col md:flex-row md:h-[600px] lg:h-[70vh]">
      
      {/* Slide Typography Content - Left */}
      <div className="flex-1 z-20 flex flex-col items-start justify-center p-6 sm:p-10 md:p-16 lg:p-24 animate-fade-in relative order-2 md:order-1">
        <div className="w-full max-w-2xl flex flex-col items-start gap-4 md:gap-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1 border-b border-neutral-300 text-[10px] font-mono font-medium uppercase text-neutral-600 tracking-[0.3em]">
            <Sparkles className="w-3 h-3" /> Artisan Heritage
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-neutral-950 tracking-tight leading-[1.1] text-left">
            {activeBanner.title}
          </h1>

          <p className="font-sans text-xs sm:text-base md:text-lg text-neutral-600 font-light leading-relaxed max-w-xl mt-1 md:mt-2 tracking-wide text-left">
            {activeBanner.subtitle}
          </p>

          <div className="mt-4 md:mt-8 flex flex-wrap justify-start gap-6">
            <button 
              onClick={() => {
                if (activeBanner.link) {
                  onNavigate("shop", activeBanner.link);
                } else {
                  onNavigate("shop");
                }
              }}
              className="px-6 py-3 md:px-10 md:py-3.5 bg-neutral-950 text-white hover:bg-neutral-800 rounded-none font-sans font-medium text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Discover Collection
            </button>
          </div>
        </div>
      </div>

      {/* Background Image Stage - Right */}
      <div className="flex-1 relative w-full h-[260px] sm:h-[320px] md:h-full order-1 md:order-2 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950/5 z-10 pointer-events-none" />
        <img 
          src={activeBanner.image_url} 
          alt={activeBanner.title} 
          className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-[15s] ease-out"
        />
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/80 hover:bg-white text-neutral-900 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm border border-neutral-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/80 hover:bg-white text-neutral-900 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm border border-neutral-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-4 md:left-16 z-30 flex gap-2">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2.5 h-2.5 rounded-full border border-neutral-400 transition-all duration-300 cursor-pointer ${idx === current ? "bg-neutral-950 w-6 border-neutral-950" : "bg-transparent"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>

  );
}
