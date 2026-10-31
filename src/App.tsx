import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

// Pages
import Home from './pages/Home.js';
import Shop from './pages/Shop.js';
import ProductDetail from './pages/ProductDetail.js';
import Cart from './pages/Cart.js';
import Checkout from './pages/Checkout.js';
import Account from './pages/Account.js';
import Wishlist from './pages/Wishlist.js';
import Auth from './pages/Auth.js';
import Admin from './pages/Admin.js';
import CmsPage from './pages/CmsPage.js';
import Contact from './pages/Contact.js';

import { User, CartItem } from './types.js';

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState('home');
  const [currentSlug, setCurrentSlug] = useState('');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // App States
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; amount: number; type: string } | null>(null);
  const [settings, setSettings] = useState<any | null>(null);

  // Initialize and verify user sessions
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      if (p === '/admin' || p.startsWith('/admin/')) {
        setCurrentPage('admin');
      } else if (p === '/' || p === '') {
        setCurrentPage('home');
      } else if (p.startsWith('/shop')) {
        setCurrentPage('shop');
      } else if (p.startsWith('/product/')) {
        setCurrentPage('product');
        setCurrentSlug(p.replace('/product/', ''));
      } else if (p === '/cart') {
        setCurrentPage('cart');
      } else if (p === '/checkout') {
        setCurrentPage('checkout');
      } else if (p === '/account') {
        setCurrentPage('account');
      } else if (p === '/wishlist') {
        setCurrentPage('wishlist');
      } else if (p === '/login') {
        setCurrentPage('login');
      } else if (p.startsWith('/page/')) {
        setCurrentPage('page');
        setCurrentSlug(p.replace('/page/', ''));
      } else if (p === '/contact') {
        setCurrentPage('contact');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);

    const token = localStorage.getItem('jaydev_token');
    if (token) {
      fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            fetch('/api/cart', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
              .then(r => r.json())
              .then(cItems => {
                if (cItems && Array.isArray(cItems)) {
                  setCart(cItems);
                }
              });
          } else {
            localStorage.removeItem('jaydev_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('jaydev_token');
        });
    } else {
      // Load saved guest cart if not logged in
      const localCart = localStorage.getItem('jaydev_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        } catch {}
      }
    }

    // Fetch site configurations
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(err => console.error(err));

    // Fetch locally saved wishlist
    const localWish = localStorage.getItem('jaydev_wishlist');
    if (localWish) {
      try {
        setWishlist(JSON.parse(localWish));
      } catch {
        setWishlist([]);
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update scroll positioning on page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Track Page View
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view" })
    }).catch(e => console.error("Tracking error:", e));
  }, [currentPage, currentSlug, currentPath]);

  useEffect(() => {
    // Track Session on App Load
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "session" })
    }).catch(e => console.error("Session tracking error:", e));
  }, []);

  const handleNavigate = (page: string, slug: string = '') => {
    setCurrentPage(page);
    setCurrentSlug(slug);
    let newPath = '/';
    if (page === 'admin') {
      newPath = slug ? (slug.startsWith('/admin') ? slug : `/admin/${slug}`) : '/admin';
    } else if (page === 'shop') {
      newPath = slug ? `/shop?${slug}` : '/shop';
    } else if (page === 'product') {
      newPath = `/product/${slug}`;
    } else if (page === 'cart') {
      newPath = '/cart';
    } else if (page === 'checkout') {
      newPath = '/checkout';
    } else if (page === 'account') {
      newPath = '/account';
    } else if (page === 'wishlist') {
      newPath = '/wishlist';
    } else if (page === 'login') {
      newPath = '/login';
    } else if (page === 'page') {
      newPath = `/page/${slug}`;
    } else if (page === 'contact') {
      newPath = '/contact';
    } else {
      newPath = '/';
    }
    setCurrentPath(newPath);
    window.history.pushState({}, '', newPath);
  };

  const handleAuthSuccess = (authUser: User, token: string) => {
    setUser(authUser);
    localStorage.setItem('jaydev_token', token);
    
    // Fetch cart on successful authentication
    fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(cItems => {
        if (cItems && Array.isArray(cItems)) {
          setCart(cItems);
        }
      });
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('jaydev_token');
    handleNavigate('home');
  };

  // Show rich notification toast on adding items to shopping bag
  const showAddToCartToast = (itemName: string, imageSrc?: string, quantity: number = 1) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-3.5 border border-maroon-100 ring-1 ring-black/5 gap-3.5 transition-all duration-300`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
            {imageSrc ? (
              <img src={imageSrc} alt={itemName} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-5 h-5 text-maroon-800" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">✓ Added to Shopping Bag</span>
            <p className="text-xs font-serif font-bold text-neutral-900 truncate">
              {itemName}
            </p>
            <span className="text-[11px] text-neutral-500 font-sans">
              Quantity: {quantity}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleNavigate('cart');
            }}
            className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            View Bag
          </button>
        </div>
      </div>
    ), { id: `cart-toast-${Date.now()}`, duration: 3500 });
  };

  // Add/Update Shopping Bag item
  const handleAddToCart = async (productId: number, variantId: number, qty: number) => {
    const token = localStorage.getItem('jaydev_token');
    const targetVariantId = variantId || 0;
    
    // Check if item already exists in state
    const existingIndex = cart.findIndex(item => item.product_id === productId && (targetVariantId ? item.variant_id === targetVariantId : true));

    if (token) {
      // Authenticated user - Sync directly with MySQL backend
      try {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, variantId: targetVariantId, quantity: qty })
        });
        if (res.ok) {
          // Re-fetch clean cart list
          const r = await fetch('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const cItems = await r.json();
          if (cItems && Array.isArray(cItems)) {
            setCart(cItems);
            const addedItem = cItems.find((i: any) => i.product_id === productId);
            showAddToCartToast(addedItem?.product_name || 'Sacred Fragrance', addedItem?.primary_image, qty);
          } else {
            showAddToCartToast('Sacred Fragrance', undefined, qty);
          }
        } else {
          toast.error('Unable to add fragrance to bag.');
        }
      } catch (err) {
        console.error('Error syncing cart with DB:', err);
        toast.error('Connection error adding item to bag.');
      }
    } else {
      // Guest User - Fallback local state management
      try {
        const res = await fetch(`/api/products/add-info?productId=${productId}&variantId=${targetVariantId}`);
        const data = await res.json();
        
        if (res.ok && data.item) {
          const resolvedVariantId = data.item.variant_id || targetVariantId || 1;
          const newItem: CartItem = {
            id: Date.now(),
            user_id: 0,
            product_id: productId,
            variant_id: resolvedVariantId,
            quantity: qty,
            price: parseFloat(data.item.sale_price),
            name: data.item.product_name,
            size: data.item.size || 'Standard',
            image: data.item.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
            primary_image: data.item.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
            brand: data.item.brand_name || 'Jaydev Fragrances',
            slug: data.item.slug,
            product_name: data.item.product_name,
            product_slug: data.item.slug,
            mrp: parseFloat(data.item.mrp || data.item.sale_price),
            sale_price: parseFloat(data.item.sale_price),
            stock: parseInt(data.item.stock || '50', 10)
          };

          let updatedCart: CartItem[];
          if (existingIndex > -1) {
            updatedCart = [...cart];
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + qty
            };
          } else {
            updatedCart = [...cart, newItem];
          }
          setCart(updatedCart);
          localStorage.setItem('jaydev_guest_cart', JSON.stringify(updatedCart));

          // Trigger rich notification toast
          showAddToCartToast(data.item.product_name, data.item.image_url, qty);
        } else {
          toast.error('Unable to fetch fragrance details.');
        }
      } catch (err) {
        console.error('Error adding guest item to cart:', err);
        toast.error('Connection error adding item to bag.');
      }
    }
  };

  const handleUpdateQty = async (productId: number, variantId: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId, variantId);
      return;
    }

    const token = localStorage.getItem('jaydev_token');
    const existingIndex = cart.findIndex(item => item.product_id === productId && item.variant_id === variantId);

    let updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: qty
      };
      setCart(updatedCart);
    }

    if (token) {
      try {
        await fetch('/api/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cartId: updatedCart[existingIndex]?.id, quantity: qty })
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.setItem('jaydev_guest_cart', JSON.stringify(updatedCart));
    }
  };

  const handleRemoveItem = async (productId: number, variantId: number) => {
    const token = localStorage.getItem('jaydev_token');
    const itemToRemove = cart.find(item => item.product_id === productId && item.variant_id === variantId);
    const updatedCart = cart.filter(item => !(item.product_id === productId && item.variant_id === variantId));
    setCart(updatedCart);
    toast('Item removed from shopping bag', { icon: '🗑️', duration: 2500 });

    if (token) {
      try {
        await fetch('/api/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cartId: itemToRemove?.id })
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.setItem('jaydev_guest_cart', JSON.stringify(updatedCart));
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setCoupon(null);
    localStorage.removeItem('jaydev_guest_cart');
    const token = localStorage.getItem('jaydev_token');
    if (token) {
      fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error(err));
    }
  };

  // Toggle Scent Favorites Wishlist
  const handleToggleWishlist = (productId: number) => {
    let updatedWishlist = [...wishlist];
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
      toast('Removed from sacred wishlist', { icon: '🤍', duration: 2500 });
    } else {
      updatedWishlist.push(productId);
      toast.success('Added to your sacred wishlist!', { icon: '❤️', duration: 3000 });
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('jaydev_wishlist', JSON.stringify(updatedWishlist));
  };

  const handleApplyCoupon = (code: string, amount: number, type: string) => {
    if (!code) {
      setCoupon(null);
      toast('Coupon removed', { duration: 2000 });
    } else {
      setCoupon({ code, amount, type });
      toast.success(`Coupon "${code}" applied successfully!`, { duration: 3500 });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-gold-500 selection:text-white relative font-sans">
      
      {/* Decorative Background for Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-100/30 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-rose-50/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-amber-50/30 blur-[120px]" />
      </div>

      <div className={`relative z-10 flex flex-col min-h-screen w-full ${currentPage === 'admin' ? '' : 'bg-white'}`}>
        {/* Luxury Brand Navigation Header */}
        {currentPage !== 'admin' && (
          <Header 
            user={user} 
            cart={cart} 
            wishlistLength={wishlist.length} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
            currentPage={currentPage}
            currentSlug={currentSlug}
            settings={settings}
          />
        )}

        {/* Main Multi-Screen Layout Switcher */}
        <div className={`flex-grow ${currentPage !== 'home' && currentPage !== 'admin' ? 'max-w-[1440px] mx-auto w-full' : ''}`}>
        {currentPage === 'home' && (
          <Home 
            onNavigate={handleNavigate} 
            onToggleWishlist={handleToggleWishlist} 
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
          />
        )}
        {currentPage === 'shop' && (
          <Shop 
            onNavigate={handleNavigate} 
            onToggleWishlist={handleToggleWishlist} 
            wishlist={wishlist}
            initialFilters={currentSlug}
          />
        )}
        {currentPage === 'product' && (
          <ProductDetail 
            slug={currentSlug} 
            onNavigate={handleNavigate} 
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist} 
            wishlist={wishlist}
            user={user}
          />
        )}
        {currentPage === 'cart' && (
          <Cart 
            cart={cart} 
            onUpdateQty={handleUpdateQty} 
            onRemoveItem={handleRemoveItem} 
            onNavigate={handleNavigate}
            onApplyCoupon={handleApplyCoupon}
            coupon={coupon}
            settings={settings}
          />
        )}
        {currentPage === 'checkout' && (
          <Checkout 
            cart={cart} 
            user={user} 
            onClearCart={handleClearCart} 
            onNavigate={handleNavigate}
            coupon={coupon}
            settings={settings}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {currentPage === 'account' && (
          <Account 
            user={user} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'wishlist' && (
          <Wishlist 
            onNavigate={handleNavigate} 
            onToggleWishlist={handleToggleWishlist} 
            wishlist={wishlist}
          />
        )}
        {currentPage === 'login' && (
          <Auth 
            onAuthSuccess={handleAuthSuccess} 
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'admin' && (
          <Admin 
            user={user} 
            onNavigate={handleNavigate}
            onAuthSuccess={handleAuthSuccess}
            currentPath={currentPath}
          />
        )}
        {currentPage === 'page' && (
          <CmsPage 
            slug={currentSlug} 
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'contact' && (
          <Contact 
            onNavigate={handleNavigate}
          />
        )}
      </div>

      {/* Luxury Footer component */}
      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} settings={settings} />}

      <Toaster 
        position="bottom-right" 
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#171717',
            border: '1px solid #f3f4f6',
            borderRadius: '1rem',
            padding: '12px 16px',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }} 
      />
      </div>
    </div>
  );
}
