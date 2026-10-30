import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Sparkles, Plus, Minus, Tag, AlertCircle } from 'lucide-react';
import { CartItem } from '../types.js';

interface CartProps {
  cart: CartItem[];
  onUpdateQty: (productId: number, variantId: number, qty: number) => void;
  onRemoveItem: (productId: number, variantId: number) => void;
  onNavigate: (page: string, slug?: string) => void;
  onApplyCoupon: (couponCode: string, discountAmount: number, discountType: string) => void;
  coupon: { code: string; amount: number; type: string } | null;
}

export default function Cart({ cart, onUpdateQty, onRemoveItem, onNavigate, onApplyCoupon, coupon }: CartProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Subtotal calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Tax calculations (18% GST standard on luxury perfumes)
  const tax = Math.round(subtotal * 0.18);
  
  // Free shipping over 1499, otherwise standard 150
  const shipping = (subtotal >= 1499 || subtotal === 0) ? 0 : 150;

  // Coupon calculations
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round(subtotal * (coupon.amount / 100));
    } else {
      couponDiscount = Math.round(coupon.amount);
    }
  }

  const grandTotal = Math.max(subtotal + tax + shipping - couponDiscount, 0);

  const handleApplyCouponCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.toUpperCase().trim() })
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        onApplyCoupon(data.coupon.code, parseFloat(data.coupon.discount_value), data.coupon.discount_type);
        setCouponSuccess(`Coupon "${data.coupon.code}" successfully applied! ₹${data.coupon.discount_value}${data.coupon.discount_type === 'percentage' ? '%' : ''} discount.`);
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Invalid or expired luxury coupon code.');
      }
    } catch {
      setCouponError('Connection error validating coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-neutral-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 mb-5 animate-pulse">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-lg font-bold text-gray-800">Your Luxury Shopping Bag is Empty</h2>
        <p className="text-xs text-gray-500 font-serif italic mt-1.5 max-w-sm">
          "Each of our artisanal scent creations has been aged to absolute botanical perfection. Discover your signature sillage today."
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-8 px-8 py-3 bg-black hover:bg-yellow-600 text-white rounded-full font-serif font-bold text-xs uppercase tracking-widest shadow transition-all duration-300 cursor-pointer"
        >
          Explore Scent boutique
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase mb-10 text-center md:text-left">
          YOUR SHOPPING BAG
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          
          {/* Cart Items list table */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {cart.map((item) => (
              <div 
                key={`${item.product_id}-${item.variant_id}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 hover:shadow transition-all duration-300 relative"
              >
                {/* Remove row absolute trigger */}
                <button
                  onClick={() => onRemoveItem(item.product_id, item.variant_id)}
                  className="absolute top-4 right-4 sm:static p-2 text-gray-300 hover:text-red-500 hover:bg-red-50/50 rounded-full cursor-pointer transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={item.primary_image} 
                    alt={item.product_name} 
                    className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-semibold">
                      {item.brand || 'Jaydev Luxury'}
                    </span>
                    <h3 
                      onClick={() => onNavigate('product', item.product_slug)}
                      className="font-serif text-sm font-semibold text-gray-900 hover:text-yellow-600 cursor-pointer transition-colors truncate"
                    >
                      {item.product_name}
                    </h3>
                    <span className="text-[11px] font-serif italic text-gray-500 mt-0.5">
                      Volume: <span className="font-mono text-[10px] font-bold text-neutral-900 not-italic">{item.size}</span>
                    </span>
                  </div>
                </div>

                {/* Price and quantity adjust details */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                  
                  {/* Quantity selector */}
                  <div className="flex flex-col gap-1 sm:items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 font-bold sm:hidden">Qty</span>
                    <div className="flex items-center border border-gray-100 rounded bg-neutral-50/40 p-0.5 font-mono text-xs font-bold">
                      <button 
                        onClick={() => onUpdateQty(item.product_id, item.variant_id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white cursor-pointer rounded"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-neutral-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.product_id, item.variant_id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white cursor-pointer rounded"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="text-right flex flex-col justify-center min-w-20">
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Line Total</span>
                    <span className="font-mono text-sm font-bold text-yellow-700 mt-0.5">₹{Math.round(item.price * item.quantity)}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] font-mono text-gray-400">₹{Math.round(item.price)} each</span>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Right Column: Order Summary with Coupon Code verification */}
          <div className="flex flex-col gap-6">
            
            {/* Promo code form */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm font-serif">
              <h3 className="text-xs font-bold text-neutral-900 tracking-widest uppercase mb-3.5 pb-2 border-b border-gray-50">
                Promo Code
              </h3>
              <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                    setCouponSuccess('');
                  }}
                  placeholder="e.g. MONSOON500"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-yellow-600 font-mono tracking-wider text-gray-800"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-black hover:bg-yellow-600 text-white rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {couponError && (
                <p className="text-[10.5px] text-red-500 font-mono italic mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[10.5px] text-emerald-600 font-mono italic mt-2 flex items-center gap-1 leading-normal">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> {couponSuccess}
                </p>
              )}
              {coupon && (
                <div className="mt-3.5 flex justify-between items-center bg-yellow-50 border border-yellow-200 p-2 rounded">
                  <span className="text-[10.5px] font-mono text-yellow-800 font-bold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-yellow-600" /> Coupon "{coupon.code}" Active
                  </span>
                  <button 
                    onClick={() => onApplyCoupon('', 0, 'flat')}
                    className="text-[10px] font-mono font-bold text-yellow-600 hover:text-black uppercase cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Receipt checkout summary */}
            <div className="bg-neutral-50/50 border border-gray-100 p-5 sm:p-6 rounded-2xl font-serif">
              <h3 className="text-xs font-bold text-neutral-900 tracking-widest uppercase mb-4 pb-2.5 border-b border-gray-200/60">
                Order Receipt
              </h3>

              <div className="flex flex-col gap-3.5 font-mono text-xs text-gray-500 border-b border-gray-200/50 pb-4.5 mb-4.5">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="text-neutral-900 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18% Luxury)</span>
                  <span className="text-neutral-900 font-bold">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Botanical Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">COMPLIMENTARY</span>
                  ) : (
                    <span className="text-neutral-900 font-bold">₹{shipping}</span>
                  )}
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-yellow-600 font-bold">
                    <span>Promo Coupon Deduction</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline font-serif mb-6">
                <span className="text-xs font-bold text-neutral-900">Total Payable</span>
                <span className="font-mono text-xl font-extrabold text-yellow-700">₹{grandTotal}</span>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full py-4 bg-black hover:bg-yellow-600 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow hover:scale-102 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center mt-3.5">
                <span 
                  onClick={() => onNavigate('shop')}
                  className="text-[11px] font-serif italic text-gray-400 hover:text-black hover:underline cursor-pointer"
                >
                  Continue Scent Sourcing
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
