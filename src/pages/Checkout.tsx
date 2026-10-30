import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, Landmark, CheckCircle2, ArrowLeft, Loader2, Sparkles, ShieldCheck, Mail } from 'lucide-react';
import { CartItem } from '../types.js';

interface CheckoutProps {
  cart: CartItem[];
  user: any;
  onClearCart: () => void;
  onNavigate: (page: string, slug?: string) => void;
  coupon: { code: string; amount: number; type: string } | null;
}

export default function Checkout({ cart, user, onClearCart, onNavigate, coupon }: CheckoutProps) {
  // Shipping details state
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  
  // Payment option
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  
  // Checkout flow states
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setShippingName(user.name);
      setShippingPhone(user.phone || '');
    }
  }, [user]);

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = (subtotal >= 1499 || subtotal === 0) ? 0 : 150;

  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round(subtotal * (coupon.amount / 100));
    } else {
      couponDiscount = Math.round(coupon.amount);
    }
  }

  const grandTotal = Math.max(subtotal + tax + shipping - couponDiscount, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setErrorMsg('');
    setLoading(true);

    const orderPayload = {
      items: cart.map(item => ({
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        name: shippingName,
        phone: shippingPhone,
        address: addressLine,
        city,
        state,
        pincode
      },
      paymentMethod,
      couponCode: coupon?.code || null,
      subtotal,
      tax,
      shipping,
      discount: couponDiscount,
      total: grandTotal
    };

    try {
      const token = localStorage.getItem('jaydev_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (res.ok) {
        // If razorpay was chosen, simulate mock razorpay popup success or handle
        if (paymentMethod === 'razorpay') {
          // Since it's standard iframe constraints, we simulate standard success screen
          setOrderSuccess(data.order);
          onClearCart();
        } else {
          setOrderSuccess(data.order);
          onClearCart();
        }
      } else {
        setErrorMsg(data.error || 'Failed to authenticate order placement.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error placing your botanical order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If order is completed successfully, show receipt stage
  if (orderSuccess) {
    return (
      <div className="bg-white min-h-[80vh] py-16 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto px-4 text-center font-serif flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 text-[10px] font-mono uppercase tracking-widest text-yellow-800 font-bold">
            <Sparkles className="w-3 h-3 text-yellow-600" /> Batch Authenticated
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
            Scent Order Confirmed!
          </h1>
          
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            "Your order is now logged in our copper curing audit trails. Our botanical team will securely wrap, wax-seal, and ship your exquisite fragrances shortly."
          </p>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 w-full text-left font-mono text-xs flex flex-col gap-3.5 mt-2">
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Order ID Code</span>
              <span className="text-neutral-900 font-bold">#{orderSuccess.id || orderSuccess.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Payment Channel</span>
              <span className="text-neutral-900 font-bold uppercase">{orderSuccess.payment_method}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Total Charged</span>
              <span className="text-yellow-700 font-bold">₹{orderSuccess.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Delivery</span>
              <span className="text-neutral-900 font-bold">3 - 5 Business Days</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-3 bg-black hover:bg-yellow-600 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow transition-colors cursor-pointer"
            >
              Return Home
            </button>
            <button
              onClick={() => onNavigate('account', 'tab=orders')}
              className="flex-1 py-3 border border-gray-200 hover:border-black text-gray-700 rounded-full font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              View Scent History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button 
          onClick={() => onNavigate('cart')}
          className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-black uppercase tracking-wider mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bag
        </button>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase mb-10 text-center md:text-left">
          SECURE CHECKOUT
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left Column: Address Input details */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Shipping Form Panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm font-serif">
                <h3 className="text-sm font-bold text-neutral-900 tracking-widest uppercase mb-6 pb-2 border-b border-gray-50">
                  Shipping Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      autoComplete="name"
                      placeholder="e.g. Anand Sharma"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="e.g. +91 98765 43210"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Street Address / House No.</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      autoComplete="street-address"
                      placeholder="e.g. Flat 304, Golden Palms, Bandra West"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">City / Town</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      placeholder="e.g. Mumbai"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">State / Province</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      autoComplete="address-level1"
                      placeholder="e.g. Maharashtra"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Pincode / Postal Code</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      autoComplete="postal-code"
                      placeholder="e.g. 400050"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Choice Panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm font-serif">
                <h3 className="text-sm font-bold text-neutral-900 tracking-widest uppercase mb-6 pb-2 border-b border-gray-50">
                  Secure Scent Settlement
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-yellow-600 bg-yellow-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="p-2 bg-neutral-950 text-yellow-500 rounded-lg">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-neutral-900">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Settle with courier on delivery</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-yellow-600 bg-yellow-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="p-2 bg-neutral-950 text-yellow-500 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-neutral-900">Razorpay Online Gateway</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">UPI, Cards, Netbanking</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Items overview and total summary */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Items overview List panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm font-serif">
                <h3 className="text-xs font-bold text-neutral-900 tracking-widest uppercase mb-5 pb-2.5 border-b border-gray-50">
                  Cart Review ({cart.length})
                </h3>
                
                <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`${item.product_id}-${item.variant_id}`} className="flex justify-between items-center gap-3 border-b border-gray-50/60 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={item.primary_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-900 truncate">{item.product_name}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5">{item.size} • Qty {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-yellow-700">₹{Math.round(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic pricing summary list panel */}
              <div className="bg-neutral-50/50 border border-gray-100 p-5 sm:p-6 rounded-2xl font-serif">
                <h3 className="text-xs font-bold text-neutral-900 tracking-widest uppercase mb-4 pb-2 border-b border-gray-200/60">
                  Payment Summary
                </h3>

                <div className="flex flex-col gap-3.5 font-mono text-xs text-gray-500 border-b border-gray-200/50 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="text-neutral-900 font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Tax (18%)</span>
                    <span className="text-neutral-900 font-semibold">₹{tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courier Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">COMPLIMENTARY</span>
                    ) : (
                      <span className="text-neutral-900 font-semibold">₹{shipping}</span>
                    )}
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-yellow-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline font-serif mb-6">
                  <span className="text-xs font-bold text-neutral-900">Total Payable</span>
                  <span className="font-mono text-xl font-extrabold text-yellow-700">₹{grandTotal}</span>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-red-500 font-mono italic mb-4 leading-normal">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 bg-black hover:bg-yellow-600 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow hover:scale-102 active:scale-98 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Placing Order...
                    </>
                  ) : (
                    <>
                      Place Scent Order
                    </>
                  )}
                </button>

                <div className="flex justify-center items-center gap-1.5 text-[10px] text-gray-400 mt-4 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" /> Standard 256-bit SSL encryption active.
                </div>

              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
