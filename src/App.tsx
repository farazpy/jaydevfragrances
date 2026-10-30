import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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

  // Add/Update Shopping Bag item
  const handleAddToCart = async (productId: number, variantId: number, qty: number) => {
    const token = localStorage.getItem('jaydev_token');
    
    // Check if variant already exists in state
    const existingIndex = cart.findIndex(item => item.product_id === productId && item.variant_id === variantId);

    if (token) {
      // Authenticated user - Sync directly with MySQL backend
      try {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, variantId, quantity: qty })
        });
        if (res.ok) {
          // Re-fetch clean cart list
          const r = await fetch('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const cItems = await r.json();
          if (cItems && Array.isArray(cItems)) {
            setCart(cItems);
          }
        }
      } catch (err) {
        console.error('Error syncing cart with DB:', err);
      }
    } else {
      // Guest User - Fallback local state management
      // Need to fetch details for product and variant to show in cart
      try {
        const res = await fetch(`/api/products/add-info?productId=${productId}&variantId=${variantId}`);
        const data = await res.json();
        
        if (res.ok && data.item) {
          const newItem: CartItem = {
            id: 0,
            user_id: 0,
            product_id: productId,
            variant_id: variantId,
            quantity: qty,
            price: parseFloat(data.item.sale_price),
            name: data.item.product_name,
            size: data.item.size,
            image: data.item.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
            brand: data.item.brand_name,
            slug: data.item.slug,
            product_name: data.item.product_name,
            product_slug: data.item.slug,
            mrp: parseFloat(data.item.mrp || data.item.sale_price),
            sale_price: parseFloat(data.item.sale_price),
            stock: parseInt(data.item.stock || '10')
          };

          if (existingIndex > -1) {
            const updatedCart = [...cart];
            updatedCart[existingIndex].quantity += qty;
            setCart(updatedCart);
          } else {
            setCart([...cart, newItem]);
          }
        }
      } catch (err) {
        console.error('Error fetching guest item:', err);
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

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = qty;
      setCart(updatedCart);
    }

    if (token) {
      try {
        await fetch('/api/cart/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, variantId, quantity: qty })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveItem = async (productId: number, variantId: number) => {
    const token = localStorage.getItem('jaydev_token');
    setCart(cart.filter(item => !(item.product_id === productId && item.variant_id === variantId)));

    if (token) {
      try {
        await fetch('/api/cart/remove', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, variantId })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setCoupon(null);
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
    } else {
      updatedWishlist.push(productId);
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('jaydev_wishlist', JSON.stringify(updatedWishlist));
  };

  const handleApplyCoupon = (code: string, amount: number, type: string) => {
    if (!code) {
      setCoupon(null);
    } else {
      setCoupon({ code, amount, type });
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

      <div className={`relative z-10 flex flex-col min-h-screen w-full ${currentPage !== 'admin' ? 'max-w-[1440px] mx-auto bg-white' : ''}`}>
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
        <div className="flex-grow">
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
          />
        )}
        {currentPage === 'checkout' && (
          <Checkout 
            cart={cart} 
            user={user} 
            onClearCart={handleClearCart} 
            onNavigate={handleNavigate}
            coupon={coupon}
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

      <Toaster position="bottom-right" />
      </div>
    </div>
  );
}
