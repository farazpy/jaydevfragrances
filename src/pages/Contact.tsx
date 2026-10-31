import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Sparkles } from 'lucide-react';

interface ContactProps {
  onNavigate: (page: string, slug?: string) => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.message || 'Thank you! Your inquiries are logged securely.');
        setName('');
        setEmail('');
        setMsg('');
      } else {
        setStatus(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setStatus('Connection error. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 font-serif">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 text-[10px] font-mono uppercase tracking-widest text-yellow-800 font-bold mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" /> Scent Lounge Locations
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 uppercase">
            CONNECT WITH OUR BOUTIQUE
          </h1>
          <p className="text-xs text-gray-500 italic mt-2 leading-relaxed">
            "Experience personalized scent profiles, bespoke wedding favors, and wholesale botanical distribution consultations."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Boutiques & Contact details */}
          <div className="flex flex-col gap-8">
            
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              <h3 className="text-base font-bold text-neutral-900 tracking-wider uppercase pb-2 border-b border-gray-200/50">
                Primary Flagship Boutique
              </h3>
              
              <ul className="flex flex-col gap-4 text-xs font-sans text-gray-600">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif font-bold text-neutral-950 block text-xs">Flagship Luxury Lounge</span>
                    <span className="leading-relaxed block mt-1">Jaydev Fragrances, 45, Golden Plaza, MG Road, Mumbai - 400001</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-neutral-950 block text-xs">Customer Concierge Telephone</span>
                    <span className="block mt-1">+91 98765 43210</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-neutral-950 block text-xs">Electronic Mail Care</span>
                    <span className="block mt-1">care@jaydevfragrances.com</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif font-bold text-neutral-950 block text-xs">Operation Hours (IST)</span>
                    <span className="leading-relaxed block mt-1">Monday - Saturday: 10:00 AM - 08:30 PM<br />Sunday: Closed for curation</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Whatsapp link box */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-full">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Direct WhatsApp Concierge</h4>
                  <p className="text-[10.5px] text-emerald-700 font-sans mt-0.5">Response timeframe under 15 minutes.</p>
                </div>
              </div>
              <a 
                href="https://wa.me/919876543210?text=Hi%20Jaydev%20Fragrances" 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors shrink-0"
              >
                Chat Now
              </a>
            </div>

          </div>

          {/* Right Column: Inquiry Submission Form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md">
            <h3 className="text-base font-bold text-neutral-900 tracking-wider uppercase mb-2">
              Corporate & Bespoke Inquiries
            </h3>
            <p className="text-xs text-gray-400 italic mb-6">
              "We coordinate customized scent profiles for five-star hotels, luxury events, and wedding favors."
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 text-xs font-sans">
              <div className="flex flex-col gap-1.5 font-serif">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5 font-serif">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram@care.com"
                  className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 font-serif">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Bespoke inquiry details</label>
                <textarea
                  required
                  rows={5}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Discuss quantity, sizing custom boxes, target scent family notes..."
                  className="bg-gray-50 border border-gray-100 rounded p-2.5 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800"
                />
              </div>

              {status && (
                <p className="text-[11px] text-emerald-600 font-mono italic animate-pulse">{status}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-yellow-600 text-white rounded font-serif font-bold text-xs uppercase tracking-widest shadow hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Send Message Inquiry <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
