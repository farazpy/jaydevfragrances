import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, MessageCircle, ShieldCheck, CreditCard, RefreshCw, Sparkles, Flame, Flower2, Feather } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, slug?: string) => void;
  settings?: any;
}

export default function Footer({ onNavigate, settings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || 'Thank you for joining our sacred circle!');
        setEmail('');
      } else {
        setStatusMsg(data.error || 'Subscription failed. Please check your email.');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      setStatusMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 font-sans border-t border-neutral-800">
      
      {/* 4 Core Value Propositions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-emerald-400 shadow-xs">
            <Feather className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">100% Charcoal-Free</h4>
            <p className="text-[11px] text-neutral-400 mt-1">Pure organic herbs & bamboo-free natural base.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-amber-400 shadow-xs">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">Bhimseni Camphor</h4>
            <p className="text-[11px] text-neutral-400 mt-1">Authentic Kapoor crystals for air purification.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sky-400 shadow-xs">
            <Send className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">Express Delivery</h4>
            <p className="text-[11px] text-neutral-400 mt-1">Free shipping across India above ₹999.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-emerald-400 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">100% Encrypted</h4>
            <p className="text-[11px] text-neutral-400 mt-1">Razorpay integrated secure checkout.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            {settings?.logo_dark ? (
              <img src={settings.logo_dark} alt="Jaydev Fragrances Logo" className="h-8 object-contain" />
            ) : (
              <>
                <div className="w-9 h-9 bg-maroon-800 border border-maroon-700 text-amber-200 flex items-center justify-center rounded-xl font-serif font-bold text-lg shadow-xs">
                  J
                </div>
                <span className="font-serif text-sm font-bold tracking-[0.18em] text-white">
                  JAYDEV FRAGRANCES
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans italic pr-2">
            "We craft sacred atmospheres and preserve spiritual heritage with pure natural luxury. Discover our exquisite handcrafted Agarbatti, slow-burning Dhoop, and pure Bhimseni Kapoor."
          </p>
          
          {/* WhatsApp Button Launcher */}
          <div className="mt-1">
            <a 
              href={`https://wa.me/${settings?.whatsapp_number || '919876543210'}?text=Hi%20Jaydev%20Fragrances,%20I'd%20like%20to%20know%20more%20about%20your%20sacred%20incense%20collections.`}
              target="_blank" 
              rel="noreferrer"
              className="btn-rounded inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-sans font-bold tracking-wider uppercase shadow-xs cursor-pointer transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="font-serif text-[11px] font-bold text-white uppercase tracking-[0.18em] border-b border-neutral-800 pb-3 mb-5">
            Customer Support
          </h3>
          <ul className="flex flex-col gap-3 text-xs text-neutral-400">
            <li onClick={() => onNavigate('page', 'about-us')} className="hover:text-amber-300 cursor-pointer transition-colors">Our Brand Heritage</li>
            <li onClick={() => onNavigate('contact')} className="hover:text-amber-300 cursor-pointer transition-colors">Locate Our Boutique</li>
            <li onClick={() => onNavigate('page', 'shipping-policy')} className="hover:text-amber-300 cursor-pointer transition-colors">Shipping & Delivery Policies</li>
            <li onClick={() => onNavigate('page', 'return-policy')} className="hover:text-amber-300 cursor-pointer transition-colors">Exchange & Return Policy</li>
            <li onClick={() => onNavigate('page', 'refund-policy')} className="hover:text-amber-300 cursor-pointer transition-colors">Cancellation & Refunds</li>
            <li onClick={() => onNavigate('page', 'faqs')} className="hover:text-amber-300 cursor-pointer transition-colors">Frequently Asked Questions</li>
          </ul>
        </div>

        {/* Contact boutique Column */}
        <div>
          <h3 className="font-serif text-[11px] font-bold text-white uppercase tracking-[0.18em] border-b border-neutral-800 pb-3 mb-5">
            Our Boutique
          </h3>
          <ul className="flex flex-col gap-3.5 text-xs text-neutral-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-maroon-400 shrink-0 mt-0.5" />
              <span>{settings?.store_address || 'Jaydev Fragrances, 45, Spiritual Plaza, MG Road, Mumbai - 400001'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-maroon-400 shrink-0" />
              <span>{settings?.contact_phone || '+91 98765 43210'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-maroon-400 shrink-0" />
              <span>{settings?.contact_email || 'care@jaydevfragrances.com'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-maroon-400 shrink-0 mt-0.5" />
              <span>{settings?.business_hours || 'Mon - Sat: 10:00 AM - 08:30 PM\nSunday: Closed'}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription form Column */}
        <div>
          <h3 className="font-serif text-[11px] font-bold text-white uppercase tracking-[0.18em] border-b border-neutral-800 pb-3 mb-5">
            The Sacred Circle
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-sans">
            Subscribe to receive private invitations to new sacred batches and enjoy <span className="highlight-maroon">₹100 OFF</span> your first order.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-neutral-800 border border-neutral-700 text-xs text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-maroon-400 pr-10 transition-colors"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-amber-300 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {statusMsg && (
              <p className="text-[11px] text-amber-300 italic animate-pulse mt-1">{statusMsg}</p>
            )}
          </form>

          {/* Social Media icons */}
          <div className="flex items-center gap-3 mt-5">
            <a href={settings?.facebook_url || "#"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white hover:border-maroon-500 transition-colors cursor-pointer">
              <span className="text-xs font-bold font-mono">FB</span>
            </a>
            <a href={settings?.instagram_url || "#"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white hover:border-maroon-500 transition-colors cursor-pointer">
              <span className="text-xs font-bold font-mono">IG</span>
            </a>
            <a href={settings?.pinterest_url || "#"} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white hover:border-maroon-500 transition-colors cursor-pointer">
              <span className="text-xs font-bold font-mono">PT</span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Guarantee Area */}
      <div className="bg-neutral-950 border-t border-neutral-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] text-neutral-400 font-mono">
          <p>© {currentYear} Jaydev Fragrances Private Limited. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span onClick={() => onNavigate('page', 'privacy-policy')} className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span onClick={() => onNavigate('page', 'terms-conditions')} className="hover:text-white cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
