import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, Loader2, Sparkles, ShieldCheck, Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartItem } from '../types.js';

interface CheckoutProps {
  cart: CartItem[];
  user: any;
  onClearCart: () => void;
  onNavigate: (page: string, slug?: string) => void;
  coupon: { code: string; amount: number; type: string } | null;
  settings?: any;
  onAuthSuccess?: (user: any, token: string) => void;
}

export default function Checkout({ cart, user, onClearCart, onNavigate, coupon, settings, onAuthSuccess }: CheckoutProps) {
  // Shipping details state
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingEmail, setShippingEmail] = useState(user?.email || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  
  // Checkout flow states
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setShippingName(user.name || '');
      setShippingEmail(user.email || '');
      setShippingPhone(user.phone || '');
    }
  }, [user]);

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.sale_price || item.price || 0);
    const qty = Number(item.quantity || 0);
    return sum + (price * qty);
  }, 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingCharge = Number(settings?.shipping_charge) || 150;
  const shippingThreshold = Number(settings?.shipping_threshold) || 1499;
  const shipping = (subtotal >= shippingThreshold || subtotal === 0) ? 0 : shippingCharge;

  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round(subtotal * (coupon.amount / 100));
    } else {
      couponDiscount = Math.round(coupon.amount);
    }
  }

  const grandTotal = Math.max(subtotal + tax + shipping - couponDiscount, 0);

  // Helper to dynamically load Razorpay checkout script if needed
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setErrorMsg('');
    setLoading(true);

    const token = localStorage.getItem('jaydev_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const orderPayload = {
      cartItems: cart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.sale_price || item.price || 0
      })),
      shippingName,
      shippingPhone,
      shippingEmail: shippingEmail || user?.email || 'customer@jaydevfragrances.com',
      shippingAddress1: addressLine,
      shippingAddress2: '',
      shippingCity: city,
      shippingState: state,
      shippingZip: pincode,
      billingName: shippingName,
      billingPhone: shippingPhone,
      billingEmail: shippingEmail || user?.email || 'customer@jaydevfragrances.com',
      billingAddress1: addressLine,
      billingAddress2: '',
      billingCity: city,
      billingState: state,
      billingZip: pincode,
      paymentMethod: 'Razorpay',
      couponCode: coupon?.code || null,
      subtotal,
      tax,
      shipping,
      discount: couponDiscount,
      total: grandTotal
    };

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to initiate order placement.');
        setLoading(false);
        return;
      }

      // If Razorpay, open Razorpay Checkout modal
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        setErrorMsg('Unable to load Razorpay payment gateway script. Please verify your internet connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: settings?.site_title || 'Jaydev Fragrances',
        description: `Order ${data.orderNumber} - Premium Fragrances`,
        image: settings?.logo_light || undefined,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // Payment captured / completed successfully in Razorpay popup
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                orderNumber: data.orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                status: 'captured'
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.status === 'success') {
              // Seamlessly log in new or returning customer and save auth credentials
              const activeToken = verifyData.autoToken || data.autoToken;
              const activeUser = verifyData.user || data.user;
              if (activeToken) {
                localStorage.setItem('jaydev_token', activeToken);
              }
              if (activeUser && activeToken && onAuthSuccess) {
                onAuthSuccess(activeUser, activeToken);
              }

              onClearCart();
              toast.success('Sacred fragrance order confirmed successfully!', { duration: 5000 });
              setOrderSuccess({
                ...data,
                ...verifyData,
                autoToken: activeToken,
                user: activeUser,
                paymentId: response.razorpay_payment_id,
                paymentMethod: 'Razorpay',
                status: 'Paid',
                grandTotal: data.grandTotal
              });
            } else {
              setErrorMsg(verifyData.error || 'Payment capture verification failed.');
            }
          } catch (err: any) {
            console.error('Verify error:', err);
            setErrorMsg(`Verification error. Your payment (${response.razorpay_payment_id}) has been recorded. Please contact support if needed.`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shippingName,
          email: shippingEmail || user?.email || '',
          contact: shippingPhone
        },
        theme: {
          color: '#7f1d1d' // maroon-800 brand primary
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setErrorMsg('Payment modal closed. Your order is reserved in Pending state.');
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setLoading(false);
        setErrorMsg(resp?.error?.description || 'Payment was declined or cancelled.');
      });
      rzpInstance.open();

    } catch (err) {
      console.error(err);
      setErrorMsg('Network error placing your order. Please try again.');
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
          
          <div className="inline-flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-[10px] font-mono uppercase tracking-widest text-amber-900 font-bold">
            <Sparkles className="w-3 h-3 text-amber-600" /> Payment Captured & Order Confirmed
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
            Order Successfully Placed!
          </h1>
          
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            Your sacred fragrance order is verified and safely recorded in our system. Our team will pack and dispatch your artisanal scents shortly.
          </p>

          {orderSuccess.autoToken && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-4 text-xs flex items-center gap-3 text-left w-full shadow-sm">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-neutral-900">Customer Account Created & Address Saved</p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                  You are now automatically logged in as <span className="font-mono font-semibold">{orderSuccess.user?.email || shippingEmail}</span>. Your delivery address has been saved for instant 1-click orders!
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 w-full text-left font-mono text-xs flex flex-col gap-3.5 mt-2">
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Order Reference</span>
              <span className="text-neutral-900 font-bold">{orderSuccess.orderNumber || orderSuccess.order_number || orderSuccess.id}</span>
            </div>
            {orderSuccess.paymentId && (
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">Razorpay Payment ID</span>
                <span className="text-emerald-700 font-bold font-mono">{orderSuccess.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Payment Gateway</span>
              <span className="text-neutral-900 font-bold uppercase">{orderSuccess.paymentMethod || orderSuccess.payment_method || 'Razorpay'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Payment Status</span>
              <span className="text-emerald-600 font-bold uppercase">{orderSuccess.status || 'Paid'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-yellow-700 font-bold">₹{Math.round(orderSuccess.grandTotal || orderSuccess.total || grandTotal)}</span>
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
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
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
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Email Address (for Receipt & Order Tracking)</label>
                    <input
                      type="email"
                      required
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="e.g. anand@example.com"
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

              {/* Payment Method Panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm font-serif">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-neutral-900 tracking-widest uppercase">
                    Secure Online Settlement
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    ✓ Verified SSL Encryption
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border-2 border-maroon-800 bg-maroon-50/20 shadow-sm transition-all flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-maroon-800 text-white rounded-xl shadow-sm">
                        <CreditCard className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900 font-sans">Razorpay Secure Gateway</span>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                            Official Gateway
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500 font-sans mt-0.5">
                          Instant checkout via UPI (GPay, PhonePe, Paytm), RuPay, Visa, MasterCard & NetBanking
                        </span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-maroon-800 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-maroon-100 font-mono text-[10px] text-maroon-900 font-semibold">
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">UPI / QR</span>
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">Google Pay</span>
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">PhonePe</span>
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">Paytm</span>
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">Credit / Debit Cards</span>
                    <span className="bg-white px-2 py-1 rounded-md border border-maroon-100">NetBanking</span>
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
                      <span className="font-mono text-xs font-bold text-yellow-700">₹{Math.round(Number(item.sale_price || item.price || 0) * Number(item.quantity))}</span>
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
