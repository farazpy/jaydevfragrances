import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ShieldAlert, BarChart3, ShoppingBag, Settings, LogOut, Search, ChevronRight, 
  Edit, Plus, Trash2, Tag, Loader2, Sparkles, CheckCircle2, AlertTriangle, 
  ShieldCheck, RefreshCcw, Image, Layers, Lock, Filter, FolderPlus, ArrowLeft,
  Eye, EyeOff, Ticket, Users, MessageSquare, Star, Clock, Flame, MapPin, Scale, Table, SlidersHorizontal
} from 'lucide-react';
import { Product, Order, Category, Brand, AdminCoupon, AdminReview } from '../types.js';
import AdminPinGate from '../components/admin/AdminPinGate.js';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal.js';
import S3FileUpload from '../components/common/S3FileUpload.js';
import BulkEditModal from '../components/admin/BulkEditModal.js';
import BatchGridEditorModal from '../components/admin/BatchGridEditorModal.js';

interface AdminProps {
  user: any;
  onNavigate: (page: string, slug?: string) => void;
  onAuthSuccess?: (user: any, token: string) => void;
  currentPath?: string;
}

interface AdminLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}

const AdminLink: React.FC<AdminLinkProps> = ({ href, className = '', children, onClick, title }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      if (onClick) onClick();
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
};

export default function Admin({ user, onNavigate, onAuthSuccess, currentPath }: AdminProps) {
  // Authentication & PIN gate
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'categories' | 'coupons' | 'users' | 'reviews' | 'banners' | 'logs' | 'settings'>('stats');
  
  // Data lists
  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [banners, setBanners] = useState<any[]>([]);

  // Banner form states
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImageUrl, setBImageUrl] = useState('');
  const [bLink, setBLink] = useState('');
  const [bIsActive, setBIsActive] = useState(true);
  const [bSortOrder, setBSortOrder] = useState(0);

  // Category form states
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');

  // Subcategory form modal state
  const [subcatModal, setSubcatModal] = useState<{
    isOpen: boolean;
    categoryId: number;
    subcat: any | null;
  }>({
    isOpen: false,
    categoryId: 0,
    subcat: null
  });
  const [subcatName, setSubcatName] = useState('');
  const [subcatSlug, setSubcatSlug] = useState('');
  const [subcatDesc, setSubcatDesc] = useState('');

  // Settings form states
  const [logoLight, setLogoLight] = useState('');
  const [logoDark, setLogoDark] = useState('');
  const [wooUrl, setWooUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [shippingCharge, setShippingCharge] = useState(150);
  const [shippingThreshold, setShippingThreshold] = useState(1499);
  const [enableCod, setEnableCod] = useState(true);
  const [syncingWoo, setSyncingWoo] = useState(false);
  
  // Catalog item editing state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pBrandId, setPBrandId] = useState(1);
  const [pCatId, setPCatId] = useState(1);
  const [pSubCatId, setPSubCatId] = useState<number>(0);
  const [pShortDesc, setPShortDesc] = useState('');
  const [pLongDesc, setPLongDesc] = useState('');
  const [pPrimaryImg, setPPrimaryImg] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pIngredients, setPIngredients] = useState('');
  const [pHowToUse, setPHowToUse] = useState('');
  const [pWeight, setPWeight] = useState('100g');
  const [pSku, setPSku] = useState('');
  const [pIsTrending, setPIsTrending] = useState(false);
  const [pIsNewArrival, setPIsNewArrival] = useState(false);
  // Agarbatti tailored fields
  const [pBurnTime, setPBurnTime] = useState('45 Minutes');
  const [pScentType, setPScentType] = useState('Natural Chandan');
  const [pPackagingType, setPPackagingType] = useState('Rigid Box');
  const [pPoojaDeity, setPPoojaDeity] = useState('Universal Divine');

  // Gemini AI Product Extractor Agent State
  const [aiExtractLoading, setAiExtractLoading] = useState(false);
  const [aiExtractFile, setAiExtractFile] = useState<File | null>(null);
  const [aiExtractImageUrl, setAiExtractImageUrl] = useState('');
  const [aiExtractHint, setAiExtractHint] = useState('');

  const [pVariants, setPVariants] = useState<any[]>([
    { size: '100g Box', mrp: 299, sale_price: 199, stock: 100, sku: '' }
  ]);

  // Product table search & filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Bulk action states
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<number>(0);
  const [bulkPriceValue, setBulkPriceValue] = useState<number | ''>('');
  const [catalogError, setCatalogError] = useState<string>('');
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBatchGridOpen, setIsBatchGridOpen] = useState(false);

  // WordPress / WooCommerce Coupons State
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'flat'>('percentage');
  const [cDiscount, setCDiscount] = useState<number>(10);
  const [cMinAmount, setCMinAmount] = useState<number>(499);
  const [cExpiry, setCExpiry] = useState<string>('');
  const [cLimit, setCLimit] = useState<number>(100);

  // WordPress / WooCommerce Users State & Customer Management
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uRole, setURole] = useState<'customer' | 'admin'>('customer');
  const [uEmailVerified, setUEmailVerified] = useState(true);
  const [uPassword, setUPassword] = useState('');
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // User Address Form Modal State
  const [addressModal, setAddressModal] = useState<{ isOpen: boolean; address: any | null }>({
    isOpen: false,
    address: null
  });
  const [addrType, setAddrType] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrEmail, setAddrEmail] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // WordPress Reviews Moderation State
  const [reviewsList, setReviewsList] = useState<AdminReview[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'product' | 'category' | 'subcategory' | 'banner' | 'coupon' | 'review' | 'user' | 'address';
    item: any;
  }>({
    isOpen: false,
    type: 'product',
    item: null
  });

  const [logsSearch, setLogsSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Check existing session token on mount
  useEffect(() => {
    const token = localStorage.getItem('jaydev_token');
    if (!token) {
      setIsCheckingAuth(false);
      setIsPinUnlocked(false);
      return;
    }

    fetch('/api/admin/check-auth', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.authenticated && data.user?.role === 'admin') {
          setIsPinUnlocked(true);
          fetchAllData();
        } else {
          setIsPinUnlocked(false);
        }
      })
      .catch(() => {
        setIsPinUnlocked(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // Sync activeTab and sub-view states from URL path
  useEffect(() => {
    if (!isPinUnlocked) return;

    const path = currentPath || window.location.pathname;
    if (!path || path === '/admin' || path === '/admin/') {
      setActiveTab('stats');
      setIsAddingProduct(false);
      setEditingProduct(null);
      setIsAddingCategory(false);
      setEditingCategory(null);
      setIsAddingBanner(false);
      setEditingBanner(null);
      setIsAddingCoupon(false);
      setEditingCoupon(null);
      return;
    }

    if (path === '/admin/stats') {
      setActiveTab('stats');
    } else if (path === '/admin/orders') {
      setActiveTab('orders');
    } else if (path === '/admin/users') {
      setActiveTab('users');
    } else if (path === '/admin/reviews') {
      setActiveTab('reviews');
    } else if (path === '/admin/logs') {
      setActiveTab('logs');
    } else if (path === '/admin/settings') {
      setActiveTab('settings');
    } else if (path === '/admin/products') {
      setActiveTab('products');
      setIsAddingProduct(false);
      setEditingProduct(null);
    } else if (path === '/admin/products/add') {
      setActiveTab('products');
      setIsAddingProduct(true);
      setEditingProduct(null);
    } else if (path.startsWith('/admin/products/edit/')) {
      const idStr = path.replace('/admin/products/edit/', '');
      const id = parseInt(idStr, 10);
      setActiveTab('products');
      if (!isNaN(id) && editingProduct?.id !== id) {
        const found = products.find(p => p.id === id);
        if (found) {
          handleEditProductClick(found);
        } else {
          handleEditProductClick({ id });
        }
      }
    } else if (path === '/admin/categories') {
      setActiveTab('categories');
      setIsAddingCategory(false);
      setEditingCategory(null);
    } else if (path === '/admin/categories/add') {
      setActiveTab('categories');
      setIsAddingCategory(true);
      setEditingCategory(null);
    } else if (path.startsWith('/admin/categories/edit/')) {
      const idStr = path.replace('/admin/categories/edit/', '');
      const id = parseInt(idStr, 10);
      setActiveTab('categories');
      if (!isNaN(id)) {
        const found = categories.find(c => c.id === id);
        if (found && editingCategory?.id !== id) {
          setEditingCategory(found);
          setCatName(found.name || '');
          setCatSlug(found.slug || '');
          setCatDescription(found.description || '');
          setCatImage(found.image || '');
          setIsAddingCategory(false);
        }
      }
    } else if (path === '/admin/banners') {
      setActiveTab('banners');
      setIsAddingBanner(false);
      setEditingBanner(null);
    } else if (path === '/admin/banners/add') {
      setActiveTab('banners');
      setIsAddingBanner(true);
      setEditingBanner(null);
    } else if (path.startsWith('/admin/banners/edit/')) {
      const idStr = path.replace('/admin/banners/edit/', '');
      const id = parseInt(idStr, 10);
      setActiveTab('banners');
      if (!isNaN(id)) {
        const found = banners.find(b => b.id === id);
        if (found && editingBanner?.id !== id) {
          setEditingBanner(found);
          setBTitle(found.title || '');
          setBSubtitle(found.subtitle || '');
          setBImageUrl(found.image_url || '');
          setBLink(found.link || '');
          setBIsActive(!!found.is_active);
          setBSortOrder(found.sort_order || 0);
          setIsAddingBanner(false);
        }
      }
    } else if (path === '/admin/coupons') {
      setActiveTab('coupons');
      setIsAddingCoupon(false);
      setEditingCoupon(null);
    } else if (path === '/admin/coupons/add') {
      setActiveTab('coupons');
      setIsAddingCoupon(true);
      setEditingCoupon(null);
    } else if (path.startsWith('/admin/coupons/edit/')) {
      const idStr = path.replace('/admin/coupons/edit/', '');
      const id = parseInt(idStr, 10);
      setActiveTab('coupons');
      if (!isNaN(id)) {
        const found = coupons.find(c => c.id === id);
        if (found && editingCoupon?.id !== id) {
          handleEditCouponClick(found);
        }
      }
    } else if (path === '/admin/users') {
      setActiveTab('users');
      setIsAddingUser(false);
      setEditingUser(null);
    } else if (path === '/admin/users/add') {
      setActiveTab('users');
      setIsAddingUser(true);
      setEditingUser(null);
      setUName('');
      setUEmail('');
      setUPhone('');
      setURole('customer');
      setUEmailVerified(true);
      setUPassword('');
      setUserAddresses([]);
      setUserOrders([]);
    } else if (path.startsWith('/admin/users/edit/')) {
      const idStr = path.replace('/admin/users/edit/', '');
      const id = parseInt(idStr, 10);
      setActiveTab('users');
      if (!isNaN(id) && editingUser?.id !== id) {
        const found = usersList.find(u => u.id === id);
        if (found) {
          handleEditUserClick(found);
        } else {
          handleEditUserClick({ id });
        }
      }
    }
  }, [currentPath, isPinUnlocked, products.length, categories.length, banners.length, coupons.length, usersList.length]);

  const safeJson = async (res: Response) => {
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchStats = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => { if (data) setStats(data); })
      .catch(err => console.error(err));
  };

  const fetchOrders = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchProducts = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/products-list', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(safeJson)
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchBrands = () => {
    fetch('/api/brands')
      .then(safeJson)
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchLogs = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/activity-logs', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchSettings = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(data);
          setLogoLight(data.logo_light || '');
          setLogoDark(data.logo_dark || '');
          setWooUrl(data.woo_url || '');
          setWooConsumerKey(data.woo_consumer_key || '');
          setWooConsumerSecret(data.woo_consumer_secret || '');
          setRazorpayKeyId(data.razorpay_key_id || '');
          setRazorpayKeySecret(data.razorpay_key_secret || '');
          setShippingCharge(Number(data.shipping_charge) || 150);
          setShippingThreshold(Number(data.shipping_threshold) || 1499);
          setEnableCod(data.enable_cod === '1' || data.enable_cod === 'true');
        }
      })
      .catch(err => console.error(err));
  };

  const fetchBanners = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/banners', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setBanners(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchCoupons = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/coupons', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setCoupons(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchUsers = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setUsersList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchReviews = () => {
    const token = localStorage.getItem('jaydev_token');
    fetch('/api/admin/reviews', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(safeJson)
      .then(data => setReviewsList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchAllData = () => {
    fetchStats();
    fetchOrders();
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchLogs();
    fetchSettings();
    fetchBanners();
    fetchCoupons();
    fetchUsers();
    fetchReviews();
  };

  const resetCouponForm = () => {
    setCCode('');
    setCType('percentage');
    setCDiscount(10);
    setCMinAmount(499);
    setCExpiry('');
    setCLimit(100);
    setEditingCoupon(null);
    setIsAddingCoupon(false);
  };

  const resetForm = () => {
    setPName('');
    setPShortDesc('');
    setPLongDesc('');
    setPPrimaryImg('');
    setPIngredients('');
    setPHowToUse('');
    setPWeight('100g');
    setPSku('');
    setPSubCatId(0);
    setPIsFeatured(false);
    setPIsBestSeller(false);
    setPIsTrending(false);
    setPIsNewArrival(false);
    setPBurnTime('45 Minutes');
    setPScentType('Natural Chandan');
    setPPackagingType('Rigid Box');
    setPPoojaDeity('Universal Divine');
    setPVariants([{ size: '100g Box', mrp: 299, sale_price: 199, stock: 100, sku: '' }]);
    setAiExtractFile(null);
    setAiExtractImageUrl('');
    setAiExtractHint('');
  };

  const handleAiExtractProduct = async () => {
    if (!aiExtractFile && !aiExtractImageUrl.trim() && !pPrimaryImg.trim()) {
      toast.error('Please upload an image file or enter an image URL to extract product details.');
      return;
    }

    setAiExtractLoading(true);
    const token = localStorage.getItem('jaydev_token');
    const formData = new FormData();

    if (aiExtractFile) {
      formData.append('file', aiExtractFile);
    } else if (aiExtractImageUrl.trim()) {
      formData.append('imageUrl', aiExtractImageUrl.trim());
    } else if (pPrimaryImg.trim()) {
      formData.append('imageUrl', pPrimaryImg.trim());
    }

    if (aiExtractHint.trim()) {
      formData.append('hint', aiExtractHint.trim());
    }

    try {
      const res = await fetch('/api/admin/ai-extract-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to extract product details using Gemini AI.');
        setAiExtractLoading(false);
        return;
      }

      const ext = data.extracted;
      if (ext.name) setPName(ext.name);
      if (ext.short_description) setPShortDesc(ext.short_description);
      if (ext.description) setPLongDesc(ext.description);
      if (ext.burn_time) setPBurnTime(ext.burn_time);
      if (ext.scent_type) setPScentType(ext.scent_type);
      if (ext.packaging_type) setPPackagingType(ext.packaging_type);
      if (ext.pooja_deity) setPPoojaDeity(ext.pooja_deity);

      // Auto-set variants price if generated
      if (ext.price || ext.compare_at_price) {
        setPVariants([{
          size: ext.packaging_type || 'Standard Pack',
          mrp: ext.compare_at_price || Math.round((ext.price || 299) * 1.5),
          sale_price: ext.price || 299,
          stock: ext.stock_quantity || 100,
          sku: ext.slug ? ext.slug.substring(0, 15).toUpperCase() : ''
        }]);
      }

      // If user provided a URL, ensure primary image is set
      if (aiExtractImageUrl.trim()) {
        setPPrimaryImg(aiExtractImageUrl.trim());
      }

      toast.success(`✨ Gemini AI successfully extracted details for "${ext.name || 'Product'}"!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Error connecting to Gemini AI extraction agent.');
    } finally {
      setAiExtractLoading(false);
    }
  };

  const handleAddVariant = () => {
    setPVariants([...pVariants, { size: '250g Box', mrp: 599, sale_price: 449, stock: 50, sku: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (pVariants.length <= 1) {
      toast.error('A product must have at least one size variant configured.');
      return;
    }
    setPVariants(pVariants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = pVariants.map((v, i) => {
      if (i === index) return { ...v, [field]: value };
      return v;
    });
    setPVariants(updated);
  };

  // PIN Unlock callback
  const handlePinSuccess = (token: string, authUser: any) => {
    setIsPinUnlocked(true);
    if (onAuthSuccess) {
      onAuthSuccess(authUser, token);
    }
    fetchAllData();
  };

  // Lock Admin
  const handleLockAdmin = () => {
    setIsPinUnlocked(false);
    toast.success('Admin panel locked');
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: number, status: string, trackingNumber?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify({ status, trackingNumber })
      });
      if (res.ok) {
        fetchOrders();
        fetchStats();
        toast.success('Order status updated successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  // Create Product Submit
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: pName,
      brand_id: pBrandId > 0 ? pBrandId : null,
      category_id: pCatId > 0 ? pCatId : null,
      subcategory_id: pSubCatId > 0 ? pSubCatId : null,
      short_description: pShortDesc,
      long_description: pLongDesc,
      ingredients: pIngredients,
      how_to_use: pHowToUse,
      weight: pWeight,
      sku: pSku,
      is_featured: pIsFeatured ? 1 : 0,
      is_best_seller: pIsBestSeller ? 1 : 0,
      is_trending: pIsTrending ? 1 : 0,
      is_new_arrival: pIsNewArrival ? 1 : 0,
      burn_time: pBurnTime,
      scent_type: pScentType,
      packaging_type: pPackagingType,
      pooja_deity: pPoojaDeity,
      image_url: pPrimaryImg || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
      variants: pVariants
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (res.ok) {
        toast.success('Product successfully added to catalog!');
        setIsAddingProduct(false);
        fetchProducts();
        resetForm();
      } else {
        toast.error(`Failed: ${d.error}`);
      }
    } catch {
      toast.error('Connection error creating product.');
    } finally {
      setLoading(false);
    }
  };

  // Edit Product Click
  const handleEditProductClick = async (product: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jaydev_token');
      const res = await fetch(`/api/admin/products/${product.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const prd = data.product;
        setEditingProduct(prd);
        setPName(prd.name || '');
        setPBrandId(prd.brand_id || 1);
        setPCatId(prd.category_id || 1);
        setPSubCatId(prd.subcategory_id || 0);
        setPShortDesc(prd.short_description || '');
        setPLongDesc(prd.long_description || '');
        setPPrimaryImg(prd.primary_image || '');
        setPIngredients(prd.ingredients || '');
        setPHowToUse(prd.how_to_use || '');
        setPWeight(prd.weight || '100g');
        setPSku(prd.sku || '');
        setPIsFeatured(!!prd.is_featured);
        setPIsBestSeller(!!prd.is_best_seller);
        setPIsTrending(!!prd.is_trending);
        setPIsNewArrival(!!prd.is_new_arrival);
        setPBurnTime(prd.burn_time || '45 Minutes');
        setPScentType(prd.scent_type || 'Natural Chandan');
        setPPackagingType(prd.packaging_type || 'Rigid Box');
        setPPoojaDeity(prd.pooja_deity || 'Universal Divine');
        
        if (data.variants && data.variants.length > 0) {
          setPVariants(data.variants);
        } else {
          setPVariants([{ size: '100g Box', mrp: 299, sale_price: 199, stock: 100, sku: '' }]);
        }
        setIsAddingProduct(false);
      } else {
        toast.error('Failed to load product details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error loading product details.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Edited Product Changes
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: pName,
      brand_id: pBrandId > 0 ? pBrandId : null,
      category_id: pCatId > 0 ? pCatId : null,
      subcategory_id: pSubCatId > 0 ? pSubCatId : null,
      short_description: pShortDesc,
      long_description: pLongDesc,
      ingredients: pIngredients,
      how_to_use: pHowToUse,
      weight: pWeight,
      sku: pSku,
      is_featured: pIsFeatured ? 1 : 0,
      is_best_seller: pIsBestSeller ? 1 : 0,
      is_trending: pIsTrending ? 1 : 0,
      is_new_arrival: pIsNewArrival ? 1 : 0,
      burn_time: pBurnTime,
      scent_type: pScentType,
      packaging_type: pPackagingType,
      pooja_deity: pPoojaDeity,
      image_url: pPrimaryImg,
      variants: pVariants
    };

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Product details and variants updated successfully!');
        setEditingProduct(null);
        fetchProducts();
        resetForm();
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch {
      toast.error('Connection error updating product.');
    } finally {
      setLoading(false);
    }
  };

  // Execute confirmed deletion
  const handleExecuteDelete = async () => {
    if (!deleteModal.item) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('jaydev_token');
      let endpoint = '';
      if (deleteModal.type === 'product') {
        endpoint = `/api/admin/products/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'category') {
        endpoint = `/api/admin/categories/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'subcategory') {
        endpoint = `/api/admin/subcategories/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'banner') {
        endpoint = `/api/admin/banners/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'coupon') {
        endpoint = `/api/admin/coupons/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'review') {
        endpoint = `/api/admin/reviews/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'user') {
        endpoint = `/api/admin/users/${deleteModal.item.id}`;
      } else if (deleteModal.type === 'address') {
        endpoint = `/api/admin/users/${deleteModal.item.userId || editingUser?.id}/addresses/${deleteModal.item.id}`;
      }

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`${deleteModal.type.toUpperCase()} deleted successfully`);
        if (deleteModal.type === 'product') fetchProducts();
        if (deleteModal.type === 'category' || deleteModal.type === 'subcategory') fetchCategories();
        if (deleteModal.type === 'banner') fetchBanners();
        if (deleteModal.type === 'coupon') fetchCoupons();
        if (deleteModal.type === 'review') fetchReviews();
        if (deleteModal.type === 'user') {
          fetchUsers();
          setIsAddingUser(false);
          setEditingUser(null);
        }
        if (deleteModal.type === 'address' && editingUser) {
          fetchUserAddresses(editingUser.id);
        }
        setDeleteModal({ isOpen: false, type: 'product', item: null });
      } else {
        toast.error(`Delete failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      toast.error('Network error during deletion');
    } finally {
      setLoading(false);
    }
  };

  // Coupon CRUD Operations
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    const isEdit = !!editingCoupon;
    const url = isEdit ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: cCode,
          type: cType,
          discount_value: cDiscount,
          min_amount: cMinAmount,
          expiry_date: cExpiry || null,
          usage_limit: cLimit
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isEdit ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        resetCouponForm();
        fetchCoupons();
      } else {
        toast.error(data.error || 'Coupon operation failed');
      }
    } catch {
      toast.error('Network error saving coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCouponClick = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setCCode(coupon.code);
    setCType(coupon.type);
    setCDiscount(coupon.discount_value);
    setCMinAmount(coupon.min_amount);
    setCExpiry(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
    setCLimit(coupon.usage_limit);
    setIsAddingCoupon(true);
  };

  // Review Moderation
  const handleReviewStatus = async (reviewId: number, isVerified: boolean) => {
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_verified: isVerified })
      });
      if (res.ok) {
        toast.success(isVerified ? 'Review approved & visible on storefront' : 'Review unapproved');
        fetchReviews();
      } else {
        toast.error('Failed to update review status');
      }
    } catch {
      toast.error('Network error moderating review');
    } finally {
      setLoading(false);
    }
  };

  // User Role Management
  const handleUserRoleChange = async (userId: number, newRole: string) => {
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        toast.success(`User role changed to ${newRole}`);
        fetchUsers();
      } else {
        toast.error('Failed to change user role');
      }
    } catch {
      toast.error('Network error changing user role');
    } finally {
      setLoading(false);
    }
  };

  // Customer Profile & Addresses CRUD Handlers
  const resetUserForm = () => {
    setUName('');
    setUEmail('');
    setUPhone('');
    setURole('customer');
    setUEmailVerified(true);
    setUPassword('');
    setUserAddresses([]);
    setUserOrders([]);
    setEditingUser(null);
    setIsAddingUser(false);
  };

  const fetchUserAddresses = async (userId: number) => {
    try {
      const token = localStorage.getItem('jaydev_token');
      const res = await fetch(`/api/admin/users/${userId}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserAddresses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUserClick = async (userObj: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jaydev_token');
      const res = await fetch(`/api/admin/users/${userObj.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setEditingUser(u);
        setUName(u.name || '');
        setUEmail(u.email || '');
        setUPhone(u.phone || '');
        setURole(u.role || 'customer');
        setUEmailVerified(!!u.email_verified);
        setUPassword('');
        setUserAddresses(Array.isArray(data.addresses) ? data.addresses : []);
        setUserOrders(Array.isArray(data.orders) ? data.orders : []);
        setIsAddingUser(false);
      } else {
        toast.error('Failed to load customer profile');
      }
    } catch {
      toast.error('Network error fetching customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: uName,
          email: uEmail,
          password: uPassword,
          phone: uPhone,
          role: uRole,
          email_verified: uEmailVerified
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Customer account created successfully!');
        resetUserForm();
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create customer');
      }
    } catch {
      toast.error('Network error creating customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: uName,
          email: uEmail,
          phone: uPhone,
          role: uRole,
          email_verified: uEmailVerified,
          password: uPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Customer account details updated!');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update customer');
      }
    } catch {
      toast.error('Network error updating customer');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddressModal = (address?: any) => {
    if (address) {
      setAddressModal({ isOpen: true, address });
      setAddrType(address.type || 'Home');
      setAddrName(address.name || '');
      setAddrPhone(address.phone || '');
      setAddrEmail(address.email || '');
      setAddrLine1(address.address_line1 || '');
      setAddrLine2(address.address_line2 || '');
      setAddrCity(address.city || '');
      setAddrState(address.state || '');
      setAddrZip(address.zip || '');
      setAddrIsDefault(!!address.is_default);
    } else {
      setAddressModal({ isOpen: true, address: null });
      setAddrType('Home');
      setAddrName(uName || '');
      setAddrPhone(uPhone || '');
      setAddrEmail(uEmail || '');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
      setAddrIsDefault(userAddresses.length === 0);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    const token = localStorage.getItem('jaydev_token');
    const isEdit = !!addressModal.address;
    const url = isEdit
      ? `/api/admin/users/${editingUser.id}/addresses/${addressModal.address.id}`
      : `/api/admin/users/${editingUser.id}/addresses`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: addrType,
          name: addrName,
          phone: addrPhone,
          email: addrEmail,
          address_line1: addrLine1,
          address_line2: addrLine2,
          city: addrCity,
          state: addrState,
          zip: addrZip,
          is_default: addrIsDefault
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isEdit ? 'Customer address updated!' : 'Customer address added!');
        setAddressModal({ isOpen: false, address: null });
        fetchUserAddresses(editingUser.id);
      } else {
        toast.error(data.error || 'Failed to save address');
      }
    } catch {
      toast.error('Network error saving address');
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD Operations
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: catName,
      slug: catSlug || catName.toLowerCase().replace(/\s+/g, '-'),
      description: catDescription,
      image: catImage
    };
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Category created successfully!');
        setIsAddingCategory(false);
        fetchCategories();
        setCatName('');
        setCatSlug('');
        setCatDescription('');
        setCatImage('');
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch {
      toast.error('Connection error creating category.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: catName,
      slug: catSlug,
      description: catDescription,
      image: catImage
    };
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
        setCatName('');
        setCatSlug('');
        setCatDescription('');
        setCatImage('');
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch {
      toast.error('Connection error updating category.');
    } finally {
      setLoading(false);
    }
  };

  // Subcategory Submit
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const isEdit = !!subcatModal.subcat;
    const url = isEdit 
      ? `/api/admin/subcategories/${subcatModal.subcat.id}`
      : '/api/admin/subcategories';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = {
      category_id: subcatModal.categoryId,
      name: subcatName,
      slug: subcatSlug || subcatName.toLowerCase().replace(/\s+/g, '-'),
      description: subcatDesc
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isEdit ? 'Subcategory updated' : 'Subcategory created');
        setSubcatModal({ isOpen: false, categoryId: 0, subcat: null });
        setSubcatName('');
        setSubcatSlug('');
        setSubcatDesc('');
        fetchCategories();
      } else {
        toast.error(data.error || 'Subcategory action failed');
      }
    } catch {
      toast.error('Network error during subcategory operation');
    } finally {
      setLoading(false);
    }
  };

  // Banner CRUD Operations
  const handleCreateBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: bTitle,
      subtitle: bSubtitle,
      image_url: bImageUrl,
      link: bLink,
      is_active: bIsActive ? 1 : 0,
      sort_order: Number(bSortOrder)
    };
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Hero banner added successfully!');
        setIsAddingBanner(false);
        fetchBanners();
        setBTitle('');
        setBSubtitle('');
        setBImageUrl('');
        setBLink('');
        setBIsActive(true);
        setBSortOrder(0);
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch {
      toast.error('Connection error adding hero banner.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: bTitle,
      subtitle: bSubtitle,
      image_url: bImageUrl,
      link: bLink,
      is_active: bIsActive ? 1 : 0,
      sort_order: Number(bSortOrder)
    };
    try {
      const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Hero banner updated successfully!');
        setEditingBanner(null);
        fetchBanners();
        setBTitle('');
        setBSubtitle('');
        setBImageUrl('');
        setBLink('');
        setBIsActive(true);
        setBSortOrder(0);
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch {
      toast.error('Connection error updating hero banner.');
    } finally {
      setLoading(false);
    }
  };

  // Settings & WooCommerce
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('jaydev_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logo_light: logoLight,
          logo_dark: logoDark,
          woo_url: wooUrl,
          woo_consumer_key: wooConsumerKey,
          woo_consumer_secret: wooConsumerSecret,
          razorpay_key_id: razorpayKeyId,
          razorpay_key_secret: razorpayKeySecret,
          shipping_charge: shippingCharge,
          shipping_threshold: shippingThreshold,
          enable_cod: enableCod ? '1' : '0'
        })
      });
      if (res.ok) {
        toast.success('Settings updated successfully!');
        fetchSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleWooSync = async () => {
    setSyncingWoo(true);
    try {
      const token = localStorage.getItem('jaydev_token');
      const res = await fetch('/api/admin/sync-woo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'WooCommerce sync completed!');
        fetchProducts();
        fetchCategories();
      } else {
        toast.error(`Sync error: ${data.error}`);
      }
    } catch {
      toast.error('Failed to sync with WooCommerce');
    } finally {
      setSyncingWoo(false);
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action: 'category' | 'price' | 'delete') => {
    if (selectedProducts.size === 0) return;
    const token = localStorage.getItem('jaydev_token');
    const ids = Array.from(selectedProducts);

    try {
      setLoading(true);
      if (action === 'delete') {
        const res = await fetch('/api/admin/products/bulk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds: ids })
        });
        if (res.ok) {
          toast.success(`${ids.length} products deleted`);
          setSelectedProducts(new Set());
          setShowBulkActions(false);
          fetchProducts();
        }
      } else if (action === 'category' && bulkCategory > 0) {
        const res = await fetch('/api/admin/products/bulk/category', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds: ids, categoryId: bulkCategory })
        });
        if (res.ok) {
          toast.success(`Category updated for ${ids.length} items`);
          setSelectedProducts(new Set());
          setShowBulkActions(false);
          fetchProducts();
        }
      } else if (action === 'price' && typeof bulkPriceValue === 'number' && bulkPriceValue > 0) {
        const res = await fetch('/api/admin/products/bulk/price', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds: ids, price: bulkPriceValue })
        });
        if (res.ok) {
          toast.success(`Price updated for ${ids.length} items`);
          setSelectedProducts(new Set());
          setShowBulkActions(false);
          fetchProducts();
        }
      }
    } catch (err: any) {
      toast.error('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (id: number) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProducts(next);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Filtered Products for Catalog Table
  const filteredProducts = products.filter(p => {
    const matchesSearch = !productSearch || 
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || 
      String(p.category_id) === String(productCategoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Current selected category's subcategories for Product Form
  const selectedCategoryObj = categories.find(c => Number(c.id) === Number(pCatId));
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  // Loading indicator for checking auth on mount
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
        <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
          Verifying Master Admin Authorization...
        </span>
      </div>
    );
  }

  // If not unlocked via PIN or existing admin token, show the PIN security gate
  if (!isPinUnlocked) {
    return (
      <AdminPinGate 
        onSuccess={handlePinSuccess} 
        onExit={() => onNavigate('home')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 font-sans">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-950 text-neutral-400 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 border-r border-neutral-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500 text-neutral-950 flex items-center justify-center font-bold font-serif shadow-md">
                J
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wider uppercase font-serif">Jaydev Admin</h1>
                <span className="text-[9px] text-yellow-500 font-mono tracking-widest uppercase">Master Control</span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1.5 font-sans">
            <AdminLink 
              href="/admin/stats"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'stats' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <BarChart3 className="w-4 h-4" /> Overview & Stats
            </AdminLink>

            <AdminLink 
              href="/admin/products"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'products' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Tag className="w-4 h-4" /> Products Catalog</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {products.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/categories"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'categories' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Layers className="w-4 h-4" /> Categories & Subs</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'categories' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {categories.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/orders"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Customer Orders</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {orders.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/coupons"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'coupons' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Ticket className="w-4 h-4" /> Coupons & Discounts</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'coupons' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {coupons.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/users"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'users' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Customers & Users</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {usersList.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/reviews"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'reviews' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4" /> Reviews Moderation</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'reviews' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {reviewsList.filter(r => !r.is_verified).length > 0 ? `${reviewsList.filter(r => !r.is_verified).length} pending` : reviewsList.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/banners"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'banners' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Image className="w-4 h-4" /> Hero Slider</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'banners' ? 'bg-neutral-950 text-yellow-400 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                {banners.length}
              </span>
            </AdminLink>

            <AdminLink 
              href="/admin/logs"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <ShieldAlert className="w-4 h-4" /> Security Audit Logs
            </AdminLink>

            <AdminLink 
              href="/admin/settings"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-yellow-500 text-neutral-950 font-bold shadow-md shadow-yellow-500/20' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> Store Settings
            </AdminLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button 
            onClick={handleLockAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-neutral-800"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Admin Panel
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit to Store
          </button>
        </div>
      </aside>

      {/* Main Admin Work Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & STATS */}
        {/* ========================================================================= */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Operations Dashboard</h2>
              <p className="text-xs text-neutral-500 mt-1">Live metrics and performance overview of Jaydev Fragrances.</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-neutral-950 text-white p-5 rounded-2xl border border-yellow-500/30 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-yellow-500 font-bold">Total Revenue</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2">₹{Math.round(parseFloat(stats.revenue || '0'))}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Total Orders</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-neutral-900">{stats.ordersCount}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Members</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-neutral-900">{stats.usersCount}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Catalog Items</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-neutral-900">{stats.productsCount}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Page Views</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-neutral-900">{stats.views}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Live Sessions</span>
                <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-neutral-900">{stats.sessions}</span>
              </div>
            </div>

            {/* Low stock alerts & best sellers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="text-sm font-bold text-neutral-900 uppercase mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Variants
                </h3>
                {stats.lowStockVariants?.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">All stock levels are optimal.</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats.lowStockVariants?.map((v: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-xs">
                        <span className="font-semibold text-neutral-900 truncate">{v.product_name} ({v.size})</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          {v.stock} units left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="text-sm font-bold text-neutral-900 uppercase mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" /> Featured Catalog Fragrances
                </h3>
                <div className="space-y-2.5">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between items-center border-b border-neutral-100 pb-2.5 text-xs last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={p.primary_image || 'https://placehold.co/100'} alt={p.name} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-semibold text-neutral-900 truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-xs text-yellow-600 font-bold">
                        ₹{p.min_sale_price || p.min_price || 199}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCTS CATALOG (ADD, EDIT, DELETE WITH PROPER CATEGORIES) */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Products Catalog Management</h2>
                <p className="text-xs text-neutral-500 mt-1">Add, edit, categorise and manage prices for all fragrance products.</p>
              </div>

              {!isAddingProduct && !editingProduct && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAddingProduct(true);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-yellow-400 border border-yellow-500/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> Gemini AI Auto-Fill
                  </button>
                  <AdminLink
                    href="/admin/products/add"
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add New Product
                  </AdminLink>
                </div>
              )}
            </div>

            {/* Search & Category Filter Bar */}
            {!isAddingProduct && !editingProduct && (
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name, SKU, or notes..."
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-yellow-500 font-sans"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Product Add / Edit Form Modal */}
            {(isAddingProduct || editingProduct) && (
              <form 
                onSubmit={editingProduct ? handleEditProductSubmit : handleCreateProductSubmit}
                className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn"
              >
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-neutral-900">
                      {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Fragrance Product'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Configure formulations, scents, categorisation, and pricing tiers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                  >
                    Cancel ✕
                  </button>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                  
                  {/* ✨ Gemini AI Product Extractor Agent Card */}
                  <div className="sm:col-span-3 bg-neutral-950 text-white p-5 rounded-2xl border border-yellow-500/30 shadow-lg mb-2 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            Gemini AI Product Extractor Agent
                            <span className="text-[9px] font-mono bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">Gemini 3.8 Flash</span>
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Upload a product package image or paste an image link. Gemini AI will auto-extract title, write SEO description, scent notes, burn time & prices.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      {/* Upload Photo File */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 font-bold">1. Upload Product Image File</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAiExtractFile(e.target.files[0]);
                            }
                          }}
                          className="text-xs text-neutral-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-500/20 file:text-yellow-300 hover:file:bg-yellow-500/30 cursor-pointer"
                        />
                      </div>

                      {/* Image URL or S3 Direct Link */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 font-bold">OR Image URL / S3 Direct Link</label>
                        <input 
                          type="url" 
                          value={aiExtractImageUrl}
                          onChange={(e) => setAiExtractImageUrl(e.target.value)}
                          placeholder="https://s3.htknetwork.in/f/..."
                          className="bg-neutral-900 border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                        />
                      </div>

                      {/* Trigger Button */}
                      <div>
                        <button
                          type="button"
                          disabled={aiExtractLoading}
                          onClick={handleAiExtractProduct}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {aiExtractLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                              <span>Analyzing Image with Gemini...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>✨ Auto-Fill Product Fields</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Title */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Royal Chandan Natural Incense Sticks"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* SKU */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">SKU Code</label>
                    <input
                      type="text"
                      value={pSku}
                      onChange={(e) => setPSku(e.target.value)}
                      placeholder="e.g. JAY-CHN-001"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Primary Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Category Group *</label>
                    <select
                      value={pCatId}
                      onChange={(e) => {
                        setPCatId(parseInt(e.target.value));
                        setPSubCatId(0); // reset subcategory on category change
                      }}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors font-sans"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory (Proper Category Mapping) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Subcategory</label>
                    <select
                      value={pSubCatId}
                      onChange={(e) => setPSubCatId(parseInt(e.target.value) || 0)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors font-sans"
                    >
                      <option value={0}>None / General Category</option>
                      {availableSubcategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Brand House</label>
                    <select
                      value={pBrandId}
                      onChange={(e) => setPBrandId(parseInt(e.target.value))}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors font-sans"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Image S3 Upload */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <S3FileUpload
                      label="Primary Product Image Graphic (S3 Storage)"
                      value={pPrimaryImg}
                      onChange={(url) => setPPrimaryImg(url)}
                      placeholder="Upload to S3 network or paste image URL"
                      helperText="Product images are uploaded and served via S3 storage network."
                    />
                  </div>

                  {/* Short Description */}
                  <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Short Scent Summary</label>
                    <input
                      type="text"
                      value={pShortDesc}
                      onChange={(e) => setPShortDesc(e.target.value)}
                      placeholder="e.g. Pure organic sandalwood extracts with therapeutic lingering aroma."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Detailed Fragrance Description</label>
                    <textarea
                      rows={4}
                      value={pLongDesc}
                      onChange={(e) => setPLongDesc(e.target.value)}
                      placeholder="Full description of the fragrance notes, formulation craftsmanship, spiritual essence, and burn characteristics..."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Ingredients & How to use */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Natural Ingredients</label>
                    <input
                      type="text"
                      value={pIngredients}
                      onChange={(e) => setPIngredients(e.target.value)}
                      placeholder="e.g. Natural Sandalwood Powder, Resins, Essential Oils"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">How to Use Instructions</label>
                    <input
                      type="text"
                      value={pHowToUse}
                      onChange={(e) => setPHowToUse(e.target.value)}
                      placeholder="e.g. Light tip of stick, blow out flame and place in holder."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Net Pack Weight</label>
                    <input
                      type="text"
                      value={pWeight}
                      onChange={(e) => setPWeight(e.target.value)}
                      placeholder="e.g. 150g"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  {/* Agarbatti & Incense Tailored Attributes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-600" /> Stick Burn Time
                    </label>
                    <input
                      type="text"
                      value={pBurnTime}
                      onChange={(e) => setPBurnTime(e.target.value)}
                      placeholder="e.g. 45-50 Minutes"
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-amber-600" /> Scent Profile
                    </label>
                    <select
                      value={pScentType}
                      onChange={(e) => setPScentType(e.target.value)}
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-sans"
                    >
                      <option value="Natural Chandan">Natural Chandan (Mysore Sandalwood)</option>
                      <option value="Pure Bhimseni Kapoor">Pure Bhimseni Kapoor & Camphor</option>
                      <option value="Sacred Loban & Guggul">Sacred Loban & Guggul Resin</option>
                      <option value="Devotional Rose (Gulab)">Devotional Rose (Kannauj Gulab)</option>
                      <option value="Vrindavan Mogra & Jasmine">Vrindavan Mogra & Jasmine</option>
                      <option value="Ayurvedic Tulsi & Neem">Ayurvedic Tulsi, Neem & Herbs</option>
                      <option value="Temple Sambrani Dhoop">Temple Sambrani & Frankincense</option>
                      <option value="Kasturi & Kashmiri Kesar">Kasturi Musk & Kashmiri Kesar</option>
                      <option value="Bambooless Dry Dhoop">Bambooless Charcoal-Free Dhoop</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold">
                      Packaging Style
                    </label>
                    <select
                      value={pPackagingType}
                      onChange={(e) => setPPackagingType(e.target.value)}
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-sans"
                    >
                      <option value="Rigid Box">Rigid Hardboard Box</option>
                      <option value="Zipper Pouch">Fresh-Seal Zipper Pouch</option>
                      <option value="Hexa Pack">Traditional Hexa Pack</option>
                      <option value="Wet Dhoop Tin">Wet Dhoop Airtight Jar/Tin</option>
                      <option value="Sambrani Cup Tray">Sambrani Charcoal Cup Tray</option>
                      <option value="Gifting Edition">Festive Divine Gift Box</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Recommended Pooja & Deity Dedication
                    </label>
                    <input
                      type="text"
                      value={pPoojaDeity}
                      onChange={(e) => setPPoojaDeity(e.target.value)}
                      placeholder="e.g. Lord Shiva, Ganesha, Lakshmi Puja, Daily Hawan & Evening Aarti"
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white font-sans"
                    />
                  </div>

                </div>

                {/* Flags / Badges */}
                <div className="pt-4 border-t border-neutral-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-3">
                    Product Badges & Visibility Flags
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                      <input 
                        type="checkbox" 
                        checked={pIsFeatured} 
                        onChange={(e) => setPIsFeatured(e.target.checked)} 
                        className="rounded text-yellow-600 focus:ring-yellow-500" 
                      />
                      <span className="font-semibold">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                      <input 
                        type="checkbox" 
                        checked={pIsBestSeller} 
                        onChange={(e) => setPIsBestSeller(e.target.checked)} 
                        className="rounded text-yellow-600 focus:ring-yellow-500" 
                      />
                      <span className="font-semibold">Best Seller</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                      <input 
                        type="checkbox" 
                        checked={pIsTrending} 
                        onChange={(e) => setPIsTrending(e.target.checked)} 
                        className="rounded text-yellow-600 focus:ring-yellow-500" 
                      />
                      <span className="font-semibold">Trending</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                      <input 
                        type="checkbox" 
                        checked={pIsNewArrival} 
                        onChange={(e) => setPIsNewArrival(e.target.checked)} 
                        className="rounded text-yellow-600 focus:ring-yellow-500" 
                      />
                      <span className="font-semibold">New Arrival</span>
                    </label>
                  </div>
                </div>

                {/* Packaging & Pricing Variants */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                      Packaging & Size Variants
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-xs font-bold text-yellow-600 hover:text-yellow-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Size Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pVariants.map((vr, idx) => (
                      <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end relative">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase">Size / Pack</label>
                          <input
                            type="text"
                            required
                            value={vr.size}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            placeholder="e.g. 150g Box"
                            className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase">MRP (₹)</label>
                          <input
                            type="number"
                            required
                            value={vr.mrp}
                            onChange={(e) => handleVariantChange(idx, 'mrp', Number(e.target.value))}
                            placeholder="299"
                            className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase">Sale Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={vr.sale_price}
                            onChange={(e) => handleVariantChange(idx, 'sale_price', Number(e.target.value))}
                            placeholder="199"
                            className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-500 font-bold text-neutral-900"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase">Stock Units</label>
                          <input
                            type="number"
                            required
                            value={vr.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                            placeholder="100"
                            className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <div className="flex-1 sm:hidden">
                            <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase">Variant SKU</label>
                            <input
                              type="text"
                              value={vr.sku || ''}
                              onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                            />
                          </div>

                          {pVariants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {editingProduct ? 'Save Product Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Products Table */}
            {!isAddingProduct && !editingProduct && (
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                
                {/* Professional Bulk Actions Toolbar */}
                <div className="bg-neutral-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-yellow-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      {selectedProducts.size > 0 ? `${selectedProducts.size} item(s) selected` : `${filteredProducts.length} total catalog products`}
                    </span>
                    {selectedProducts.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProducts(new Set())}
                        className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer font-mono"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkEditModalOpen(true)}
                      disabled={selectedProducts.size === 0}
                      className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-xs"
                      title="Bulk edit weight, price, and category for selected products"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Bulk Edit Selected ({selectedProducts.size})
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBatchGridOpen(true)}
                      className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-neutral-700 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Open full interactive spreadsheet batch editor"
                    >
                      <Table className="w-3.5 h-3.5" /> Interactive Spreadsheet
                    </button>

                    {selectedProducts.size > 0 && (
                      <button
                        type="button"
                        onClick={() => handleBulkAction('delete')}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedProducts.size})
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans text-neutral-600">
                    <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5 w-10 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                            onChange={toggleAllProducts}
                            className="rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3.5">Product</th>
                        <th className="px-4 py-3.5">Category / Subcategory</th>
                        <th className="px-4 py-3.5">Price & Stock</th>
                        <th className="px-4 py-3.5">Flags</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">
                            No fragrance products match your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const stock = p.total_stock !== undefined ? p.total_stock : 0;
                          return (
                            <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.has(p.id)}
                                  onChange={() => toggleProductSelection(p.id)}
                                  className="rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={p.primary_image || 'https://placehold.co/100'} 
                                    alt={p.name} 
                                    className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <span className="font-bold text-neutral-900 block truncate font-serif text-sm">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-mono block">
                                      SKU: {p.sku || 'N/A'} • {p.brand_name || 'Jaydev'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-semibold text-neutral-900 block">
                                  {p.category_name || 'Uncategorized'}
                                </span>
                                {p.subcategory_name && (
                                  <span className="text-[10px] text-neutral-400 font-sans block">
                                    ↳ {p.subcategory_name}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 font-mono">
                                <span className="font-bold text-neutral-900 block text-xs">
                                  ₹{p.min_sale_price || p.min_price || 199}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${stock <= 0 ? 'bg-red-50 text-red-700' : stock < 20 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                  {stock} in stock
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex flex-wrap gap-1">
                                  {p.is_featured ? (
                                    <span className="bg-yellow-100 text-yellow-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      Featured
                                    </span>
                                  ) : null}
                                  {p.is_best_seller ? (
                                    <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      Best Seller
                                    </span>
                                  ) : null}
                                  {p.is_trending ? (
                                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      Trending
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <AdminLink
                                    href={`/admin/products/edit/${p.id}`}
                                    className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </AdminLink>
                                  <button
                                    onClick={() => {
                                      setDeleteModal({
                                        isOpen: true,
                                        type: 'product',
                                        item: p
                                      });
                                    }}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Categories & Subcategories</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Organize your fragrances into primary collections and sub-scent profiles.
                </p>
              </div>

              {!isAddingCategory && !editingCategory && (
                <AdminLink
                  href="/admin/categories/add"
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </AdminLink>
              )}
            </div>

            {/* Category Add/Edit Form */}
            {(isAddingCategory || editingCategory) && (
              <form
                onSubmit={editingCategory ? handleEditCategorySubmit : handleCreateCategorySubmit}
                className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-neutral-900">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setEditingCategory(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-black uppercase font-mono font-bold"
                  >
                    Cancel ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!editingCategory) {
                          setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                        }
                      }}
                      placeholder="e.g. Agarbatti (Incense Sticks)"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="e.g. agarbatti"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <S3FileUpload
                      label="Category Image Graphic (S3 Storage)"
                      value={catImage}
                      onChange={(url) => setCatImage(url)}
                      placeholder="Upload category cover to S3 or paste URL"
                      helperText="Category collection banners uploaded to S3 network."
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Description</label>
                    <textarea
                      rows={3}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="A short description of this collection..."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    {editingCategory ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            )}

            {/* Categories & Subcategories Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-40 overflow-hidden bg-neutral-100 relative">
                      {cat.image ? (
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Layers className="w-12 h-12" />
                        </div>
                      )}
                      <span className="absolute bottom-2.5 left-2.5 bg-neutral-950/80 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        /{cat.slug}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-base font-bold text-neutral-900">{cat.name}</h3>
                        <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">
                          {cat.product_count || 0} products
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{cat.description || 'No description provided.'}</p>

                      {/* Subcategories section inside card */}
                      <div className="mt-4 pt-3 border-t border-neutral-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                            Subcategories ({cat.subcategories?.length || 0})
                          </span>
                          <button
                            onClick={() => {
                              setSubcatModal({
                                isOpen: true,
                                categoryId: cat.id,
                                subcat: null
                              });
                              setSubcatName('');
                              setSubcatSlug('');
                              setSubcatDesc('');
                            }}
                            className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Sub
                          </button>
                        </div>

                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {cat.subcategories.map((sub: any) => (
                              <div key={sub.id} className="flex justify-between items-center bg-neutral-50 px-2.5 py-1.5 rounded-lg text-xs border border-neutral-100">
                                <span className="font-medium text-neutral-800 truncate">{sub.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setSubcatModal({
                                        isOpen: true,
                                        categoryId: cat.id,
                                        subcat: sub
                                      });
                                      setSubcatName(sub.name);
                                      setSubcatSlug(sub.slug);
                                      setSubcatDesc(sub.description || '');
                                    }}
                                    className="text-neutral-400 hover:text-black p-1"
                                    title="Edit Subcategory"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteModal({
                                        isOpen: true,
                                        type: 'subcategory',
                                        item: sub
                                      });
                                    }}
                                    className="text-red-400 hover:text-red-600 p-1"
                                    title="Delete Subcategory"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-400 italic">No subcategories yet.</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex justify-end gap-2">
                    <AdminLink
                      href={`/admin/categories/edit/${cat.id}`}
                      className="px-3 py-1.5 border border-neutral-200 hover:border-black text-neutral-700 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </AdminLink>
                    <button
                      onClick={() => {
                        setDeleteModal({
                          isOpen: true,
                          type: 'category',
                          item: cat
                        });
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subcategory Add / Edit Modal */}
            {subcatModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <form
                  onSubmit={handleSubcategorySubmit}
                  className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative"
                >
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-4">
                    <h3 className="font-serif font-bold text-base text-neutral-900">
                      {subcatModal.subcat ? 'Edit Subcategory' : 'Add Subcategory'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSubcatModal({ isOpen: false, categoryId: 0, subcat: null })}
                      className="text-neutral-400 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Subcategory Name *</label>
                      <input
                        type="text"
                        required
                        value={subcatName}
                        onChange={(e) => {
                          setSubcatName(e.target.value);
                          if (!subcatModal.subcat) {
                            setSubcatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                          }
                        }}
                        placeholder="e.g. Masala Flora Sticks"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Slug *</label>
                      <input
                        type="text"
                        required
                        value={subcatSlug}
                        onChange={(e) => setSubcatSlug(e.target.value)}
                        placeholder="e.g. masala-flora-sticks"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Description</label>
                      <textarea
                        rows={2}
                        value={subcatDesc}
                        onChange={(e) => setSubcatDesc(e.target.value)}
                        placeholder="Short description of this subcategory..."
                        className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setSubcatModal({ isOpen: false, categoryId: 0, subcat: null })}
                      className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold uppercase hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                      {loading ? 'Saving...' : subcatModal.subcat ? 'Update Subcategory' : 'Save Subcategory'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Orders & Fulfillment</h2>
              <p className="text-xs text-neutral-500 mt-1">Manage, fulfill, and update dispatch tracking states for customer orders.</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-neutral-600">
                  <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Order ID</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Total & Payment</th>
                      <th className="px-4 py-3.5">Current Status</th>
                      <th className="px-4 py-3.5">Tracking Number</th>
                      <th className="px-4 py-3.5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">
                          No orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">
                            #{o.order_number || o.id}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-neutral-900 block">{o.shipping_name || o.user_name || 'Guest'}</span>
                            <span className="text-[10px] text-neutral-400 font-mono block">{o.shipping_phone || o.shipping_city}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            <span className="font-bold text-neutral-900 block">₹{Math.round(parseFloat(o.total_amount as any || '0'))}</span>
                            <span className="text-[10px] text-neutral-400 uppercase">{o.payment_method}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : o.status === 'shipped' ? 'bg-blue-100 text-blue-800' : o.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-neutral-100 text-neutral-800'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">
                            {o.tracking_number || <span className="text-neutral-300 italic">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value, o.tracking_number)}
                              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-yellow-500 font-sans"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: HERO SLIDER BANNERS */}
        {/* ========================================================================= */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Hero Slider Management</h2>
                <p className="text-xs text-neutral-500 mt-1">Manage promotional banners on the homepage.</p>
              </div>

              {!isAddingBanner && !editingBanner && (
                <AdminLink
                  href="/admin/banners/add"
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Slide
                </AdminLink>
              )}
            </div>

            {/* Banner Form */}
            {(isAddingBanner || editingBanner) && (
              <form
                onSubmit={editingBanner ? handleEditBannerSubmit : handleCreateBannerSubmit}
                className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-neutral-900">
                    {editingBanner ? `Edit Slide: ${editingBanner.title}` : 'Add New Hero Slide'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingBanner(false);
                      setEditingBanner(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-black uppercase font-mono font-bold"
                  >
                    Cancel ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Banner Title *</label>
                    <input
                      type="text"
                      required
                      value={bTitle}
                      onChange={(e) => setBTitle(e.target.value)}
                      placeholder="e.g. Pure Temple Fragrances"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={bSubtitle}
                      onChange={(e) => setBSubtitle(e.target.value)}
                      placeholder="e.g. Crafted with organic floral extracts and sacred resins"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <S3FileUpload
                      label="Banner / Hero Slider Graphic (S3 Storage) *"
                      value={bImageUrl}
                      onChange={(url) => setBImageUrl(url)}
                      placeholder="Upload hero banner graphic to S3 network"
                      helperText="Frontpage slider graphics uploaded and served directly via S3 storage."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Sort Order</label>
                    <input
                      type="number"
                      value={bSortOrder}
                      onChange={(e) => setBSortOrder(parseInt(e.target.value) || 0)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingBanner(false);
                      setEditingBanner(null);
                    }}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    {editingBanner ? 'Update Slide' : 'Save Slide'}
                  </button>
                </div>
              </form>
            )}

            {/* Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((b) => (
                <div key={b.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-neutral-100 overflow-hidden relative">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute top-3 right-3 bg-neutral-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        Order #{b.sort_order}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-base text-neutral-900">{b.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{b.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex justify-end gap-2">
                    <AdminLink
                      href={`/admin/banners/edit/${b.id}`}
                      className="px-3 py-1.5 border border-neutral-200 hover:border-black text-neutral-700 rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </AdminLink>
                    <button
                      onClick={() => {
                        setDeleteModal({
                          isOpen: true,
                          type: 'banner',
                          item: b
                        });
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY AUDIT LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Security Audit Logs</h2>
              <p className="text-xs text-neutral-500 mt-1">Immutable security activity audit trail.</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-neutral-600">
                  <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Action Event</th>
                      <th className="px-4 py-3.5">Actor / User</th>
                      <th className="px-4 py-3.5">IP Address</th>
                      <th className="px-4 py-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 italic">
                          No audit logs recorded.
                        </td>
                      </tr>
                    ) : (
                      logs.map((l, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-4 py-3 text-neutral-400">{new Date(l.created_at || Date.now()).toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-neutral-900">{l.action || l.event}</td>
                          <td className="px-4 py-3">{l.user_email || l.user_id || 'System / Admin'}</td>
                          <td className="px-4 py-3 text-neutral-400">{l.ip_address || '127.0.0.1'}</td>
                          <td className="px-4 py-3 text-neutral-500">{l.details || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: STORE SETTINGS & WOOCOMMERCE */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn max-w-3xl">
            <div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Store Settings & Integrations</h2>
              <p className="text-xs text-neutral-500 mt-1">Configure brand assets and WooCommerce catalog synchronization.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-base font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Brand Logos & Identities
              </h3>

              <div className="space-y-4">
                <S3FileUpload
                  label="Light Theme Brand Logo (S3 Upload)"
                  value={logoLight}
                  onChange={(url) => setLogoLight(url)}
                  placeholder="Upload light theme logo to S3 network"
                  helperText="Primary brand logo displayed on header and light backgrounds."
                />

                <S3FileUpload
                  label="Dark Theme Brand Logo (S3 Upload)"
                  value={logoDark}
                  onChange={(url) => setLogoDark(url)}
                  placeholder="Upload dark theme logo to S3 network"
                  helperText="Brand logo displayed on dark footer and luxury dark sections."
                />
              </div>

              <h3 className="text-base font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3 pt-4">
                Razorpay Payment Gateway API Keys
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      placeholder="rzp_live_... or rzp_test_..."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Razorpay Key Secret</label>
                    <input
                      type="password"
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="Razorpay Secret Key"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 italic">
                  Enter your official Razorpay Key ID and Secret Key to accept UPI, Cards, NetBanking, and Wallets live.
                </p>
              </div>

              <h3 className="text-base font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3 pt-4">
                Shipping & Payment Policy
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Standard Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={shippingCharge}
                      onChange={(e) => setShippingCharge(Number(e.target.value))}
                      placeholder="150"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      value={shippingThreshold}
                      onChange={(e) => setShippingThreshold(Number(e.target.value))}
                      placeholder="1499"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-base font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3 pt-4">
                WooCommerce Catalog Sync
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Store URL</label>
                  <input
                    type="url"
                    value={wooUrl}
                    onChange={(e) => setWooUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Consumer Key (CK)</label>
                    <input
                      type="text"
                      value={wooConsumerKey}
                      onChange={(e) => setWooConsumerKey(e.target.value)}
                      placeholder="ck_..."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Consumer Secret (CS)</label>
                    <input
                      type="password"
                      value={wooConsumerSecret}
                      onChange={(e) => setWooConsumerSecret(e.target.value)}
                      placeholder="cs_..."
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleWooSync}
                  disabled={syncingWoo || !wooUrl || !wooConsumerKey || !wooConsumerSecret}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  {syncingWoo ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                  {syncingWoo ? 'Syncing Catalog...' : 'Sync Products from WooCommerce'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: COUPONS & DISCOUNTS (WORDPRESS / WOOCOMMERCE CORE) */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Coupons & Discounts Engine</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage promotional voucher codes, minimum purchase requirements, percentage or flat deductions.
                </p>
              </div>

              {!isAddingCoupon && !editingCoupon && (
                <AdminLink
                  href="/admin/coupons/add"
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create Coupon
                </AdminLink>
              )}
            </div>

            {/* Add / Edit Coupon Form */}
            {(isAddingCoupon || editingCoupon) && (
              <form onSubmit={handleCouponSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-neutral-900">
                      {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Configure voucher discount rules, cart thresholds, usage caps, and expiration.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetCouponForm}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                  >
                    Cancel ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      value={cCode}
                      onChange={(e) => setCCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DIWALI50 or JAYDEV20"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Discount Type *</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as any)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Amount Discount (₹)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Discount Value *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={cDiscount}
                      onChange={(e) => setCDiscount(parseFloat(e.target.value) || 0)}
                      placeholder={cType === 'percentage' ? 'e.g. 15 (for 15%)' : 'e.g. 100 (for ₹100 off)'}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      value={cMinAmount}
                      onChange={(e) => setCMinAmount(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 499"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Usage Limit (Total times)</label>
                    <input
                      type="number"
                      value={cLimit}
                      onChange={(e) => setCLimit(parseInt(e.target.value) || 100)}
                      placeholder="e.g. 500"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={cExpiry}
                      onChange={(e) => setCExpiry(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-yellow-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={resetCouponForm}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                    {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
                  </button>
                </div>
              </form>
            )}

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-neutral-600">
                  <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5">Type & Value</th>
                      <th className="px-4 py-3.5">Min Spend</th>
                      <th className="px-4 py-3.5">Usage Count</th>
                      <th className="px-4 py-3.5">Expiry</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">
                          No promotional coupons created yet. Click "+ Create Coupon" above.
                        </td>
                      </tr>
                    ) : (
                      coupons.map((cpn) => (
                        <tr key={cpn.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-neutral-950 text-xs px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200">
                              {cpn.code}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-neutral-900">
                              {cpn.type === 'percentage' ? `${cpn.discount_value}% OFF` : `₹${cpn.discount_value} FLAT`}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-neutral-700">
                            {cpn.min_amount > 0 ? `₹${cpn.min_amount}` : 'None'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-neutral-700">
                            {cpn.used_count} / {cpn.usage_limit}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-neutral-500">
                            {cpn.expiry_date ? new Date(cpn.expiry_date).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <AdminLink
                                href={`/admin/coupons/edit/${cpn.id}`}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                                title="Edit Coupon"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </AdminLink>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, type: 'coupon', item: cpn })}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CUSTOMER ACCOUNTS & ADDRESS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Main Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Customer Accounts & Address Management</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Add, edit, or delete customer profiles, manage saved shipping addresses, authorize roles, and view purchase histories.
                </p>
              </div>

              {!isAddingUser && !editingUser && (
                <AdminLink
                  href="/admin/users/add"
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add New Customer
                </AdminLink>
              )}
            </div>

            {/* Customer Add / Edit Form Panel */}
            {(isAddingUser || editingUser) && (
              <div className="space-y-8 animate-fadeIn">
                <form
                  onSubmit={editingUser ? handleEditUserSubmit : handleCreateUserSubmit}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-serif font-bold text-neutral-900">
                        {editingUser ? `Edit Customer Profile: ${editingUser.name} (#${editingUser.id})` : 'Create New Customer Account'}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Configure customer personal details, contact number, role, and authentication credentials.
                      </p>
                    </div>
                    <AdminLink
                      href="/admin/users"
                      onClick={resetUserForm}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                    >
                      Cancel ✕
                    </AdminLink>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={uName}
                        onChange={(e) => setUName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={uEmail}
                        onChange={(e) => setUEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Phone Number</label>
                      <input
                        type="tel"
                        value={uPhone}
                        onChange={(e) => setUPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white"
                      />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Account Role</label>
                      <select
                        value={uRole}
                        onChange={(e) => setURole(e.target.value as 'customer' | 'admin')}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 font-sans"
                      >
                        <option value="customer">Customer (Storefront Shopper)</option>
                        <option value="admin">Administrator (Master Control)</option>
                      </select>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                        {editingUser ? 'Reset Password (Leave blank to keep unchanged)' : 'Account Password *'}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={uPassword}
                        onChange={(e) => setUPassword(e.target.value)}
                        placeholder={editingUser ? 'Enter new password...' : 'Minimum 6 characters'}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:bg-white font-mono"
                      />
                    </div>

                    {/* Email Verified Toggle */}
                    <div className="flex items-center gap-3 pt-6">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uEmailVerified}
                          onChange={(e) => setUEmailVerified(e.target.checked)}
                          className="rounded text-yellow-600 focus:ring-yellow-500"
                        />
                        <span>Email Verified Status</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                    <AdminLink
                      href="/admin/users"
                      onClick={resetUserForm}
                      className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 cursor-pointer"
                    >
                      Cancel
                    </AdminLink>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {editingUser ? 'Update Customer Profile' : 'Create Customer Account'}
                    </button>
                  </div>
                </form>

                {/* Customer Saved Addresses Section (When editing existing user) */}
                {editingUser && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
                      <div>
                        <h3 className="text-base font-serif font-bold text-neutral-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-yellow-600" /> Customer Saved Delivery & Billing Addresses
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Manage, edit, or add shipping addresses for {editingUser.name}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddressModal()}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Customer Address
                      </button>
                    </div>

                    {userAddresses.length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs italic">
                        No saved addresses found for this customer account. Click "+ Add Customer Address" above to create one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${addr.is_default ? 'bg-amber-50/40 border-yellow-300 shadow-sm' : 'bg-neutral-50 border-neutral-200'}`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-mono uppercase font-bold text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                                  {addr.type || 'Home'}
                                </span>
                                {addr.is_default ? (
                                  <span className="text-[9px] font-mono font-bold uppercase bg-yellow-500 text-neutral-950 px-2 py-0.5 rounded-full">
                                    Default Address
                                  </span>
                                ) : null}
                              </div>

                              <h4 className="font-bold text-xs text-neutral-900">{addr.name}</h4>
                              <p className="text-[11px] font-mono text-neutral-500 mt-0.5">{addr.phone} {addr.email ? `• ${addr.email}` : ''}</p>
                              <p className="text-xs text-neutral-700 mt-2 leading-relaxed">
                                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                                {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.zip}</span>
                              </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-neutral-200/60 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenAddressModal(addr)}
                                className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-black text-neutral-800 rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit Address
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: true, type: 'address', item: { ...addr, userId: editingUser.id } })}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Address
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Order History Section (When editing existing user) */}
                {editingUser && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                    <h3 className="text-base font-serif font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <ShoppingBag className="w-4 h-4 text-neutral-700" /> Customer Purchase & Order History ({userOrders.length})
                    </h3>

                    {userOrders.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-4">No order records associated with this customer account.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans text-neutral-600">
                          <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Order ID</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Payment</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 font-mono text-right">Grand Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                            {userOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3 font-bold text-neutral-900">#{ord.order_number || ord.id}</td>
                                <td className="px-4 py-3 text-neutral-500">{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-neutral-700">{ord.payment_method} ({ord.payment_status})</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'}`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-neutral-900 text-right">₹{Math.round(parseFloat(ord.grand_total || '0'))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Customers Master Table View */}
            {!isAddingUser && !editingUser && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search customers by name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                    />
                    {userSearch && (
                      <button
                        onClick={() => setUserSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="text-xs font-mono text-neutral-500 font-bold shrink-0">
                    Total Registered: {usersList.length} Accounts
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans text-neutral-600">
                      <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5">Customer Name</th>
                          <th className="px-4 py-3.5">Contact Email & Phone</th>
                          <th className="px-4 py-3.5">Account Role</th>
                          <th className="px-4 py-3.5">Orders Count</th>
                          <th className="px-4 py-3.5">Lifetime Spend</th>
                          <th className="px-4 py-3.5">Member Since</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {usersList
                          .filter(u => !userSearch || 
                            u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
                            u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.phone?.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-bold text-neutral-900 font-serif text-sm">{u.name}</div>
                                <span className="text-[10px] font-mono text-neutral-400">UID #{u.id}</span>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="text-neutral-900 font-medium">{u.email}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">{u.phone || 'No phone'}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-neutral-100 text-neutral-700'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-mono text-neutral-800">
                                {u.orders_count || 0} orders
                              </td>
                              <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">
                                ₹{Math.round(parseFloat(u.total_spent || 0))}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-neutral-400">
                                {new Date(u.created_at || Date.now()).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <AdminLink
                                    href={`/admin/users/edit/${u.id}`}
                                    className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title="Edit Profile & Saved Addresses"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </AdminLink>

                                  {u.role === 'customer' ? (
                                    <button
                                      onClick={() => handleUserRoleChange(u.id, 'admin')}
                                      className="px-2 py-1 text-[9px] font-bold text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors cursor-pointer"
                                      title="Promote to Administrator"
                                    >
                                      Promote
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserRoleChange(u.id, 'customer')}
                                      className="px-2 py-1 text-[9px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                      title="Demote to Customer"
                                    >
                                      Demote
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setDeleteModal({ isOpen: true, type: 'user', item: u })}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Customer Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Address Add / Edit Modal */}
            {addressModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <form
                  onSubmit={handleAddressSubmit}
                  className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative text-left space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <h3 className="font-serif font-bold text-base text-neutral-900">
                      {addressModal.address ? 'Edit Customer Saved Address' : 'Add New Customer Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAddressModal({ isOpen: false, address: null })}
                      className="text-neutral-400 hover:text-black font-mono font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Address Label Type</label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      >
                        <option value="Home">Home Address</option>
                        <option value="Office">Office / Workplace</option>
                        <option value="Other">Other Location</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Recipient Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        placeholder="Recipient Name"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="+91 Phone Number"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Email Address</label>
                      <input
                        type="email"
                        value={addrEmail}
                        onChange={(e) => setAddrEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Address Line 1 *</label>
                      <input
                        type="text"
                        required
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        placeholder="House / Flat No., Building Name, Street"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        placeholder="Landmark, Area, Colony"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">City *</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        placeholder="City"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">State *</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        placeholder="State"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">PIN / Zip Code *</label>
                      <input
                        type="text"
                        required
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        placeholder="6-digit PIN code"
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="rounded text-yellow-600 focus:ring-yellow-500"
                        />
                        <span>Set as Default Address</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setAddressModal({ isOpen: false, address: null })}
                      className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold uppercase hover:bg-neutral-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-neutral-950 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      {addressModal.address ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: REVIEWS MODERATION (WORDPRESS CORE) */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Reviews & Testimonials Moderation</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Approve, reject or delete customer fragrance feedback. Only approved reviews appear on product pages.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Filter reviews by product or customer..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-neutral-600">
                  <thead className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-50 uppercase border-b border-neutral-200 tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Product</th>
                      <th className="px-4 py-3.5">Reviewer</th>
                      <th className="px-4 py-3.5">Rating</th>
                      <th className="px-4 py-3.5">Customer Comment</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {reviewsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">
                          No customer reviews submitted yet.
                        </td>
                      </tr>
                    ) : (
                      reviewsList
                        .filter(r => !reviewSearch || r.product_name?.toLowerCase().includes(reviewSearch.toLowerCase()) || r.user_name?.toLowerCase().includes(reviewSearch.toLowerCase()))
                        .map((rev) => (
                          <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-neutral-900 block truncate max-w-[160px]">{rev.product_name}</span>
                              <span className="text-[10px] font-mono text-neutral-400">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-neutral-800">{rev.user_name || 'Customer'}</div>
                              <div className="text-[10px] text-neutral-400">{rev.user_email}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center text-amber-500 font-bold gap-1">
                                <span>{rev.rating}</span>
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </div>
                            </td>
                            <td className="px-4 py-3.5 max-w-xs">
                              <p className="text-neutral-700 italic text-[11px] line-clamp-2">
                                "{rev.comment || 'No comment text provided'}"
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              {rev.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {rev.is_verified ? (
                                  <button
                                    onClick={() => handleReviewStatus(rev.id, false)}
                                    className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Unapprove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReviewStatus(rev.id, true)}
                                    className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Approve & Publish
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteModal({ isOpen: true, type: 'review', item: rev })}
                                  className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type.toUpperCase()}`}
        itemName={deleteModal.item?.name || deleteModal.item?.title || 'Selected Item'}
        itemSubtitle={
          deleteModal.type === 'product'
            ? `SKU: ${deleteModal.item?.sku || 'N/A'} • Category: ${deleteModal.item?.category_name || 'N/A'}`
            : deleteModal.type === 'category'
            ? `Slug: /${deleteModal.item?.slug}`
            : deleteModal.type === 'subcategory'
            ? `Slug: /${deleteModal.item?.slug}`
            : ''
        }
        itemImage={deleteModal.item?.primary_image || deleteModal.item?.image || deleteModal.item?.image_url}
        warningText={
          deleteModal.type === 'product'
            ? 'Deleting this product will safely remove its variants and image associations without affecting parent categories or brands.'
            : deleteModal.type === 'category'
            ? 'Deleting this category will unassign products belonging to it. Products will not be deleted.'
            : deleteModal.type === 'subcategory'
            ? 'Deleting this subcategory will unassign products in this sub-tier.'
            : undefined
        }
        loading={loading}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: 'product', item: null })}
      />

      {/* Professional Bulk Attribute Editor Modal */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedProductIds={Array.from(selectedProducts)}
        selectedProductsList={products.filter(p => selectedProducts.has(p.id))}
        categories={categories}
        onSuccess={() => {
          setSelectedProducts(new Set());
          fetchProducts();
        }}
      />

      {/* Interactive Spreadsheet Batch Editor Modal */}
      <BatchGridEditorModal
        isOpen={isBatchGridOpen}
        onClose={() => setIsBatchGridOpen(false)}
        productsList={selectedProducts.size > 0 ? products.filter(p => selectedProducts.has(p.id)) : filteredProducts}
        categories={categories}
        onSuccess={() => {
          setSelectedProducts(new Set());
          fetchProducts();
        }}
      />

    </div>
  );
}
