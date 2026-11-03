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
              title: "Let Peace Fill Your Home",
              subtitle: "Transform your everyday surroundings with rich fragrances and traditional aromas crafted to make every moment special.",
              image_url: "https://s3.htknetwork.in/f/c8TyQutt",
              link: "shop",
              sort_order: 0
            },
            {
              id: 2,
              title: "Make Every Moment Divine",
              subtitle: "Indulge in our exquisite collection of luxury Eau de Parfum, crafted with precision.",
              image_url: "https://images.unsplash.com/photo-1615397322964-b8beac469279?auto=format&fit=crop&q=80&w=1600",
              link: "shop",
              sort_order: 1
            },
            {
              id: 3,
              title: "Everything Your Pooja Needs",
              subtitle: "Elevate your rituals with organic Bhimseni camphor and charcoal-free dhoop.",
              image_url: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&q=80&w=1600",
              link: "shop",
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
    <div className="relative w-full bg-[#fcfaf8] overflow-hidden group flex flex-col md:flex-row md:h-[600px] lg:h-[70vh] rounded-[6px] border border-neutral-100 shadow-sm">
      
      {/* Slide Typography Content - Left */}
      <div className="flex-1 z-20 flex flex-col items-start justify-center p-5 pb-20 sm:p-10 sm:pb-20 md:p-16 md:pb-16 lg:p-24 animate-fade-in relative order-2 md:order-1">
        <div className="w-full max-w-2xl flex flex-col items-start gap-3 sm:gap-4 md:gap-6">
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 border-b border-neutral-300 text-[9px] sm:text-[10px] font-mono font-medium uppercase text-neutral-600 tracking-[0.25em] sm:tracking-[0.3em]">
            <Sparkles className="w-3 h-3 text-maroon-800" /> Artisan Heritage
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-normal text-neutral-950 tracking-tight leading-[1.15] text-left">
            {activeBanner.title}
          </h1>

          <p className="font-sans text-xs sm:text-sm md:text-base lg:text-lg text-neutral-600 font-light leading-relaxed max-w-xl mt-0.5 sm:mt-1 md:mt-2 tracking-wide text-left">
            {activeBanner.subtitle}
          </p>

          <div className="mt-3 sm:mt-4 md:mt-8 mb-2 md:mb-0 flex flex-wrap justify-start gap-4">
            <button 
              onClick={() => {
                if (activeBanner.link) {
                  onNavigate("shop", activeBanner.link);
                } else {
                  onNavigate("shop");
                }
              }}
              className="px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 bg-maroon-800 text-white hover:bg-maroon-900 rounded-md font-sans font-semibold text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-md shadow-maroon-950/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Discover Collection
            </button>
          </div>
        </div>
      </div>

      {/* Background Image Stage - Right */}
      <div className="flex-1 relative w-full h-[220px] sm:h-[300px] md:h-full order-1 md:order-2 overflow-hidden">
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
            className="absolute left-3 top-1/4 sm:top-1/3 md:top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 bg-white/80 hover:bg-white text-neutral-900 rounded-full transition-all duration-300 opacity-80 md:opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm border border-neutral-200"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-3 top-1/4 sm:top-1/3 md:top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 bg-white/80 hover:bg-white text-neutral-900 rounded-full transition-all duration-300 opacity-80 md:opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm border border-neutral-200"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Indicators with ample breathing room from hero button */}
          <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-10 md:left-16 z-30 flex items-center gap-2 bg-white/80 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none px-2.5 py-1.5 md:p-0 rounded-full border border-neutral-200/60 md:border-0 shadow-xs md:shadow-none">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === current ? "bg-maroon-800 w-6" : "bg-neutral-300 hover:bg-neutral-400 w-2"}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>

  );
}
