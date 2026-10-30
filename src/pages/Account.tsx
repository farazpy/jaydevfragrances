import React, { useState, useEffect } from 'react';
import { User as UserIcon, ShoppingBag, MapPin, Key, Landmark, Sparkles, Star, Shield, ArrowRight, Loader2, FileText, Upload } from 'lucide-react';
import { Order, Address } from '../types.js';
import S3FileUpload from '../components/common/S3FileUpload.js';

interface AccountProps {
  user: any;
  onNavigate: (page: string, slug?: string) => void;
  onLogout: () => void;
}

export default function Account({ user, onNavigate, onLogout }: AccountProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'documents' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customerDoc, setCustomerDoc] = useState<string>('');
  
  // Profile update states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Fetch orders and addresses if logged in
  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }

    const token = localStorage.getItem('jaydev_token');
    if (!token) return;

    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data || []))
      .catch(err => console.error('Error fetching orders:', err));

    fetch('/api/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAddresses(data || []))
      .catch(err => console.error('Error fetching addresses:', err));
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jaydev_token')}`
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg(data.message || 'Profile settings updated successfully!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setProfileError(data.error || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Connection error updating settings.');
    } finally {
      setProfileLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Navigation Tabs sidebar */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col bg-gray-50 border border-gray-100 p-5 rounded-2xl h-fit font-serif text-xs gap-3">
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-yellow-500 text-yellow-500 flex items-center justify-center font-bold text-base shadow">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-neutral-900 truncate">{user.name}</span>
                <span className="text-[10px] font-mono text-gray-400 truncate">{user.email}</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left py-2 px-3 rounded flex items-center gap-2.5 transition-all ${activeTab === 'overview' ? 'bg-black text-white font-bold shadow' : 'text-gray-600 hover:text-black hover:bg-white'}`}
            >
              <Shield className="w-3.5 h-3.5" /> Portal Overview
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-2 px-3 rounded flex items-center gap-2.5 transition-all ${activeTab === 'orders' ? 'bg-black text-white font-bold shadow' : 'text-gray-600 hover:text-black hover:bg-white'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Scent Order History
            </button>

            <button 
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left py-2 px-3 rounded flex items-center gap-2.5 transition-all ${activeTab === 'addresses' ? 'bg-black text-white font-bold shadow' : 'text-gray-600 hover:text-black hover:bg-white'}`}
            >
              <MapPin className="w-3.5 h-3.5" /> Saved Addresses
            </button>

            <button 
              onClick={() => setActiveTab('documents')}
              className={`w-full text-left py-2 px-3 rounded flex items-center gap-2.5 transition-all ${activeTab === 'documents' ? 'bg-black text-white font-bold shadow' : 'text-gray-600 hover:text-black hover:bg-white'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Customer Documents (S3)
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left py-2 px-3 rounded flex items-center gap-2.5 transition-all ${activeTab === 'profile' ? 'bg-black text-white font-bold shadow' : 'text-gray-600 hover:text-black hover:bg-white'}`}
            >
              <Key className="w-3.5 h-3.5" /> Profile Settings
            </button>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <button 
                onClick={onLogout}
                className="w-full text-left py-2 px-3 rounded text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
              >
                Logout Account
              </button>
            </div>
          </aside>

          {/* Right Main Panel Stage */}
          <main className="flex-1 bg-white">
            
            {/* Tab 1: Portal Overview */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8 font-serif">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-neutral-900 uppercase">Welcome, {user.name.split(' ')[0]}</h2>
                  <p className="text-xs text-gray-500 italic mt-1">Connoisseur account membership since 2026.</p>
                </div>

                {/* Membership card details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-950 text-white p-5 rounded-2xl border border-yellow-500/20 shadow-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-yellow-500 font-bold">Member Tier</span>
                      <h3 className="text-sm font-bold tracking-tight mt-1">Imperial Gold Circle</h3>
                    </div>
                    <Sparkles className="w-8 h-8 text-yellow-500 self-end mt-4 animate-pulse" />
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-gray-400 font-bold">Total Scent Orders</span>
                      <h3 className="text-lg font-bold text-neutral-900 mt-1">{orders.length} Completed</h3>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-yellow-600 self-end mt-4" />
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-gray-400 font-bold">Account Verification</span>
                      <h3 className="text-sm font-bold text-emerald-600 mt-1">Scent Audit Clear</h3>
                    </div>
                    <Shield className="w-8 h-8 text-emerald-600 self-end mt-4" />
                  </div>
                </div>

                {/* Recent orders overview block */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase mb-4 pb-2 border-b border-gray-50">
                    Recent Scent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 italic">
                      You haven't placed any premium fragrance orders yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {orders.slice(0, 2).map((o) => (
                        <div key={o.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between text-xs gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-900">Order #{o.order_number || o.id}</span>
                            <span className="text-[10px] font-mono text-gray-400 mt-0.5">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-yellow-700">₹{Math.round(o.total)}</span>
                            <span className={`block text-[10px] font-mono uppercase font-bold mt-1 ${o.status === 'delivered' ? 'text-emerald-600' : 'text-yellow-600'}`}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Orders list */}
            {activeTab === 'orders' && (
              <div className="flex flex-col gap-6 font-serif">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase">Scent Order History</h2>
                  <p className="text-xs text-gray-500 italic mt-0.5">Track and view your previous botanical fragrance acquisitions.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500 italic">
                    You haven't ordered any premium fragrance formulations yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4.5">
                    {orders.map((o) => (
                      <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4 text-xs">
                        <div className="flex justify-between items-start border-b border-gray-50 pb-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-900 text-sm">Order #{o.order_number || o.id}</span>
                            <span className="text-[10px] font-mono text-gray-400 mt-1">Ordered on: {new Date(o.created_at).toLocaleDateString()} • {new Date(o.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-yellow-700">₹{Math.round(o.total)}</span>
                            <span className={`block text-[9px] font-mono font-bold uppercase mt-1.5 px-2 py-0.5 rounded border ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>

                        {/* Order items inside */}
                        <div className="flex flex-col gap-3 font-sans">
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700">{item.product_name || 'Premium Formulation'} <span className="font-serif italic text-gray-400">({item.size})</span> <span className="font-mono text-[10px] font-bold text-gray-400">x{item.quantity}</span></span>
                              <span className="font-mono font-semibold text-gray-900">₹{Math.round(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Courier tracking segment */}
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-center font-mono text-[10.5px]">
                          <span className="text-gray-400">Payment Status: <span className="text-neutral-900 font-bold uppercase">{o.payment_status}</span></span>
                          {o.tracking_number && (
                            <span className="text-neutral-900">Courier Tracker: <span className="font-bold text-yellow-600">{o.tracking_number}</span></span>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Saved addresses */}
            {activeTab === 'addresses' && (
              <div className="flex flex-col gap-6 font-serif">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase">Saved Addresses</h2>
                  <p className="text-xs text-gray-500 italic mt-0.5">Manage your primary shipping addresses for faster checkouts.</p>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 italic">
                    No shipping addresses saved yet. They are saved automatically when placing an order.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {addresses.map((a) => (
                      <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-xs font-sans">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-serif font-bold text-neutral-900 text-sm">{a.name}</span>
                          <span className="text-gray-500">{a.address}</span>
                          <span className="text-gray-500">{a.city}, {a.state} - {a.pincode}</span>
                          <span className="text-[10px] font-mono text-gray-400 mt-1">Phone: {a.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Customer Documents (S3 Upload) */}
            {activeTab === 'documents' && (
              <div className="flex flex-col gap-6 font-sans max-w-xl">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-serif font-bold text-neutral-900 uppercase">Customer & Wholesale Documents</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload business GST certificates, tax licenses, or verification IDs directly to our secure S3 storage network.</p>
                </div>

                <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 space-y-5">
                  <S3FileUpload
                    label="Business GST / Wholesale License Document (S3 Storage)"
                    value={customerDoc}
                    onChange={(url) => setCustomerDoc(url)}
                    placeholder="Upload document PDF or image to S3 network"
                    caption={`Customer Document for ${user.name} (${user.email})`}
                    helperText="Files are stored securely on S3 network (https://s3.htknetwork.in)."
                  />

                  {customerDoc && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1 font-mono">
                      <p className="font-bold flex items-center gap-1.5">✓ Document Stored on S3 Network</p>
                      <p className="text-[11px] break-all">{customerDoc}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Profile Settings */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6 font-serif max-w-xl">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase">Profile Settings</h2>
                  <p className="text-xs text-gray-500 italic mt-0.5">Update your membership profiles or reset access passwords.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Anand Sharma"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Phone Contact</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                    />
                  </div>

                  <div className="border-t border-gray-100 my-4 pt-4 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-neutral-900 tracking-wider uppercase">Reset Account Password</h4>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Current Password</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {profileMsg && <p className="text-[11px] text-emerald-600 font-mono italic animate-pulse">{profileMsg}</p>}
                  {profileError && <p className="text-[11px] text-red-500 font-mono italic animate-pulse">{profileError}</p>}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-3 bg-black hover:bg-yellow-600 text-white rounded font-serif font-bold text-xs uppercase tracking-widest shadow cursor-pointer flex items-center justify-center gap-2"
                  >
                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Save Profile Settings"}
                  </button>

                </form>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
