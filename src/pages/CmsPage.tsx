import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ShieldAlert, BookOpen, Clock, Mail, Phone, MapPin } from 'lucide-react';

interface CmsPageProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export default function CmsPage({ slug, onNavigate }: CmsPageProps) {
  const [page, setPage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Curated elegant fallbacks for about us and policies
  const getStaticFallback = (pageSlug: string) => {
    const fallbacks: any = {
      'about-us': {
        title: "Our Heritage & Distillation Artisanship",
        content: `Jaydev Fragrances was established in 1995 with a single core vision: to bring back the purity of historical hydro-distillation perfume formulation to the modern world.

Our master distillers travel across the Indian subcontinent sourcing the finest organic inputs. From the hand-picked, dew-kissed centifolia roses of Kannauj to the raw, deeply aged Aquilaria agarwood trees of Southeast Asia, every single droplet in our collections represents absolute uncompromising olfactory integrity.

Each of our formulas undergoes a minimum of 180 days of copper-pot aging under climate-locked storage chambers to ensure complete molecule maturation, allowing our fragrances to offer an exceptional sillage and unmatched longevity without relying on harsh denatured alcohols.`
      },
      'faqs': {
        title: "Olfactory FAQ Portal",
        content: `**Q: Do you use harsh industrial denatured alcohol or chemical fixatives?**
A: Absolutely not. All our classical attars are 100% alcohol-free concentrated perfume oils. Our modern Eau de Parfums use highly refined organic food-grade grape-neutral spirit as carriers, preserving raw scent profiles.

**Q: How do I store my luxury perfume or attar bottle?**
A: Keep the bottles stored inside their custom leather/velvet cases away from direct sunlight and sharp temperature variations. Proper storage keeps the raw ingredients active for decades.

**Q: What is the average scent longevity of Jaydev Fragrances?**
A: Due to the high concentrations (Extrait de Parfum category), our spray formulations last between 8-12 hours on skin and up to 48 hours on natural fabrics like cotton or linen.`
      },
      'shipping-policy': {
        title: "Complimentary Delivery Guidelines",
        content: `We pack each of our crystal decanters inside thick padded, gold-foiled luxury boxes to ensure completely safe transits.

**Shipping Timeframes:**
• Mumbai Metropolitan Area: 24 - 48 Hours
• Rest of India: 3 - 5 Business Days
• International Destinations: 7 - 14 Business Days

**Shipping Fees:**
We offer complimentary insured express shipping across India on all cart orders exceeding INR 1499. For smaller orders, a standard courier handling fee of INR 150 is applied.`
      },
      'return-policy': {
        title: "Our Return & Authentication Policies",
        content: `Due to the highly exclusive, batch-distilled nature of our scent formulations, we enforce a strict 7-day hassle-free return window for all completely unopened products.

To support scent trials, each fragrance set includes a free 1.5ml matching vial sampler. We recommend spraying the vial sampler first before unsealing the primary full-sized heavy crystal decanter. Once the plastic seal on the premium decanter box is sliced, the product is ineligible for dynamic exchange or refunds.`
      }
    };
    return fallbacks[pageSlug] || {
      title: "Botanical Scent Guidelines",
      content: "Please check back shortly as our editorial team updates our luxury collection compositions."
    };
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setPage(data);
        } else {
          setPage(getStaticFallback(slug));
        }
      })
      .catch(() => {
        setPage(getStaticFallback(slug));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-serif text-gray-400 animate-pulse">
        Unveiling page archives...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-black uppercase tracking-wider mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </button>

        <div className="flex flex-col gap-6 font-serif">
          
          <div className="inline-flex items-center gap-1.5 bg-yellow-50 px-3.5 py-1.5 rounded-full border border-yellow-100 text-[10px] font-mono uppercase tracking-widest text-yellow-800 font-bold self-start shadow-inner mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600" /> Botanical Scent Journal
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 uppercase">
            {page?.title}
          </h1>

          <div className="border-t border-gray-100 pt-8 mt-4 text-sm leading-relaxed text-gray-600 whitespace-pre-line flex flex-col gap-5">
            {page?.content}
          </div>

          {/* Specific static map / contact detail if looking at contact page or heritage */}
          {slug === 'about-us' && (
            <div className="mt-12 bg-neutral-950 text-white p-6 rounded-2xl border border-yellow-500/20 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-900 border border-yellow-500/10 rounded-full text-yellow-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Need Scent Consultation?</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-normal">Our master perfumers offer direct online consultations over chat.</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('contact')}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Contact Boutique
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
