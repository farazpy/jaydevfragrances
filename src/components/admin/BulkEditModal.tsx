import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  X, Tag, Layers, Scale, DollarSign, Sparkles, Check, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: number[];
  selectedProductsList: any[];
  categories: any[];
  onSuccess: () => void;
}

export default function BulkEditModal({
  isOpen,
  onClose,
  selectedProductIds,
  selectedProductsList,
  categories,
  onSuccess
}: BulkEditModalProps) {
  const [activeTab, setActiveTab] = useState<'multi' | 'weight' | 'price' | 'category'>('multi');
  const [loading, setLoading] = useState(false);

  // Weight Form State
  const [weightValue, setWeightValue] = useState('');
  const [syncVariantSize, setSyncVariantSize] = useState(true);

  // Price Form State
  const [priceMode, setPriceMode] = useState<'fixed' | 'percent' | 'flat'>('fixed');
  const [priceValue, setPriceValue] = useState<string>('');
  const [mrpValue, setMrpValue] = useState<string>('');

  // Category Form State
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWeightValue('');
      setPriceMode('fixed');
      setPriceValue('');
      setMrpValue('');
      setCategoryId('');
      setSubcategoryId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const count = selectedProductIds.length;
  const selectedCategoryObj = categories.find(c => Number(c.id) === Number(categoryId));
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  const handleApplyBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) {
      toast.error('No products selected for bulk edit.');
      return;
    }

    const token = localStorage.getItem('jaydev_token');
    setLoading(true);

    try {
      const payload: any = {
        productIds: selectedProductIds,
        action: activeTab === 'multi' ? 'multi' : activeTab
      };

      // Populate payload fields based on active tab or multi tab
      if (activeTab === 'weight' || (activeTab === 'multi' && weightValue.trim())) {
        payload.weight = weightValue.trim();
        payload.syncVariantSize = syncVariantSize;
      }

      if (activeTab === 'category' || (activeTab === 'multi' && categoryId)) {
        if (categoryId) payload.categoryId = Number(categoryId);
        if (subcategoryId) payload.subcategoryId = Number(subcategoryId);
      }

      if (activeTab === 'price' || (activeTab === 'multi' && priceValue !== '')) {
        payload.priceMode = priceMode;
        payload.priceValue = parseFloat(priceValue);
        if (mrpValue !== '') payload.mrpValue = parseFloat(mrpValue);
      }

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Bulk update applied across ${count} products!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to process bulk update.');
      }
    } catch (err: any) {
      console.error('Bulk update error:', err);
      toast.error('Connection error applying bulk update.');
    } finally {
      setLoading(false);
    }
  };

  const weightPresets = ['100g', '150g', '200g', '250g', '500g', '1kg', '50ml Attar', '12 Cones', '10 Sambrani Cups'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white tracking-wide">
                Bulk Product Attribute Editor
              </h3>
              <p className="text-xs text-amber-300/90 font-mono">
                Modifying {count} Selected Fragrance Item{count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-2 bg-neutral-100 border-b border-neutral-200 flex items-center gap-1 overflow-x-auto shrink-0 font-sans text-xs">
          <button
            onClick={() => setActiveTab('multi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeTab === 'multi' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Combined Multi-Edit
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeTab === 'weight' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" /> Net Weight
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeTab === 'price' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Pricing & MRP
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeTab === 'category' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" /> Category
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleApplyBulk} className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: COMBINED MULTI-EDIT */}
          {activeTab === 'multi' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 mb-0.5">Simultaneous Batch Attribute Update</p>
                  <p className="text-neutral-600 leading-relaxed">
                    Enter values for Weight, Pricing, or Category below. Only fields with values entered will be updated across your <span className="font-bold text-neutral-900">{count} selected products</span>.
                  </p>
                </div>
              </div>

              {/* Weight Section */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" /> Net Pack Weight
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    placeholder="e.g. 150g or 250g Box"
                    className="flex-1 bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {weightPresets.slice(0, 4).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setWeightValue(p)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${weightValue === p ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Pricing & Margins
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceMode('fixed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-sans border transition-all cursor-pointer text-center ${priceMode === 'fixed' ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                  >
                    Set Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceMode('percent')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-sans border transition-all cursor-pointer text-center ${priceMode === 'percent' ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                  >
                    % Adjustment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceMode('flat')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-sans border transition-all cursor-pointer text-center ${priceMode === 'flat' ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                  >
                    Flat ₹ Adjust
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">
                      {priceMode === 'fixed' ? 'New Sale Price (₹)' : priceMode === 'percent' ? 'Markup / Discount %' : 'Flat Price Change (₹)'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      placeholder={priceMode === 'fixed' ? 'e.g. 199' : priceMode === 'percent' ? 'e.g. 10 for +10% or -15 for -15%' : 'e.g. 20 for +₹20 or -30 for -₹30'}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  {priceMode === 'fixed' && (
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">
                        New MRP / Compare Price (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={mrpValue}
                        onChange={(e) => setMrpValue(e.target.value)}
                        placeholder="e.g. 299 (Optional)"
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Category Section */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" /> Category & Subcategory Assignment
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">Target Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value ? Number(e.target.value) : '');
                        setSubcategoryId('');
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="">Do Not Change Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">Target Subcategory</label>
                    <select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                      disabled={!categoryId}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-sans disabled:opacity-50"
                    >
                      <option value="">None / General</option>
                      {availableSubcategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEIGHT ONLY */}
          {activeTab === 'weight' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950 mb-0.5">Bulk Net Weight Configuration</p>
                  <p className="text-neutral-600 leading-relaxed">
                    Set standardized net weight string for all <span className="font-bold text-neutral-900">{count} selected items</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                  Target Weight Specification
                </label>
                <input
                  type="text"
                  required
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="e.g. 150g Box"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-sans font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-500 font-bold uppercase block mb-2">Popular Fragrance Presets</label>
                <div className="flex flex-wrap gap-2">
                  {weightPresets.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setWeightValue(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${weightValue === p ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={syncVariantSize}
                  onChange={(e) => setSyncVariantSize(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Synchronize Primary Variant Size Name</span>
                  <span className="text-[11px] text-neutral-500 block">Updates product_variants size label to match the new weight (e.g., '150g Box').</span>
                </div>
              </label>
            </div>
          )}

          {/* TAB 3: PRICE ONLY */}
          {activeTab === 'price' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950 mb-0.5">Bulk Pricing Strategy</p>
                  <p className="text-neutral-600 leading-relaxed">
                    Update prices for all variants across <span className="font-bold text-neutral-900">{count} selected items</span>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriceMode('fixed')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${priceMode === 'fixed' ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('percent')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${priceMode === 'percent' ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Percentage (% Change)
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('flat')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${priceMode === 'flat' ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Flat Adjustment (₹)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                    {priceMode === 'fixed' ? 'Target Sale Price (₹)' : priceMode === 'percent' ? 'Percentage Delta (%)' : 'Flat Amount Change (₹)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder={priceMode === 'fixed' ? 'e.g. 199' : priceMode === 'percent' ? 'e.g. 10 for +10% or -15 for -15%' : 'e.g. 50 for +₹50 or -20 for -₹20'}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono font-bold text-neutral-900"
                  />
                </div>

                {priceMode === 'fixed' && (
                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                      Target MRP / List Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={mrpValue}
                      onChange={(e) => setMrpValue(e.target.value)}
                      placeholder="e.g. 299 (Optional)"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono text-neutral-900"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORY ONLY */}
          {activeTab === 'category' && (
            <div className="space-y-5">
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 text-xs text-purple-900 flex items-start gap-3">
                <Layers className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-purple-950 mb-0.5">Category Re-assignment</p>
                  <p className="text-neutral-600 leading-relaxed">
                    Move all <span className="font-bold text-neutral-900">{count} selected items</span> into a new primary collection or subcategory.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                    Target Primary Category
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value ? Number(e.target.value) : '');
                      setSubcategoryId('');
                    }}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 font-sans font-medium"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                    Target Subcategory
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                    disabled={!categoryId}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 font-sans font-medium disabled:opacity-50"
                  >
                    <option value="">None / Main Collection Only</option>
                    {availableSubcategories.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Selected Products Preview Box */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider block mb-2">
              Affected Products Summary ({selectedProductsList.length} Items Selected)
            </span>
            <div className="max-h-28 overflow-y-auto bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 space-y-1.5 text-xs font-sans">
              {selectedProductsList.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-neutral-700 bg-white px-2.5 py-1 rounded-lg border border-neutral-100">
                  <span className="font-semibold truncate">{p.name}</span>
                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    {p.weight || '100g'} • ₹{p.min_sale_price || p.min_price || 199} • {p.category_name || 'Uncategorized'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-neutral-950 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating Products...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Apply Bulk Update to {count} Products
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
