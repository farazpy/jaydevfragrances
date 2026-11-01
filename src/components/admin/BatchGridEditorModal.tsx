import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  X, Table, Save, Loader2, Sparkles, RefreshCcw, Check, Scale, DollarSign, Layers, Filter
} from 'lucide-react';

interface BatchGridEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsList: any[];
  categories: any[];
  onSuccess: () => void;
}

export default function BatchGridEditorModal({
  isOpen,
  onClose,
  productsList,
  categories,
  onSuccess
}: BatchGridEditorModalProps) {
  const [gridData, setGridData] = useState<any[]>([]);
  const [editedRowIds, setEditedRowIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Bulk helper states inside spreadsheet
  const [globalWeight, setGlobalWeight] = useState('');
  const [globalCategory, setGlobalCategory] = useState<number | ''>('');
  const [globalPercentMarkup, setGlobalPercentMarkup] = useState('');

  useEffect(() => {
    if (isOpen && Array.isArray(productsList)) {
      const cloned = productsList.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku || '',
        category_id: p.category_id || (categories[0]?.id || 1),
        subcategory_id: p.subcategory_id || 0,
        weight: p.weight || '100g',
        sale_price: p.min_sale_price || p.min_price || 199,
        mrp: p.max_mrp || p.mrp || 299,
        primary_image: p.primary_image || ''
      }));
      setGridData(cloned);
      setEditedRowIds(new Set());
      setFilterText('');
    }
  }, [isOpen, productsList, categories]);

  if (!isOpen) return null;

  const handleCellChange = (id: number, field: string, value: any) => {
    setGridData(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));

    setEditedRowIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Quick Column Bulk Tools inside Grid
  const applyGlobalWeightToAll = () => {
    if (!globalWeight.trim()) return;
    setGridData(prev => prev.map(r => ({ ...r, weight: globalWeight.trim() })));
    setEditedRowIds(new Set(gridData.map(r => r.id)));
    toast.success(`Set weight to "${globalWeight}" for all items`);
  };

  const applyGlobalCategoryToAll = () => {
    if (!globalCategory) return;
    setGridData(prev => prev.map(r => ({ ...r, category_id: Number(globalCategory), subcategory_id: 0 })));
    setEditedRowIds(new Set(gridData.map(r => r.id)));
    toast.success(`Updated category for all items`);
  };

  const applyPercentMarkupToAll = () => {
    const pct = parseFloat(globalPercentMarkup);
    if (isNaN(pct)) return;
    const mult = 1 + (pct / 100);
    setGridData(prev => prev.map(r => ({
      ...r,
      sale_price: Math.max(1, Math.round(r.sale_price * mult)),
      mrp: Math.max(1, Math.round(r.mrp * mult))
    })));
    setEditedRowIds(new Set(gridData.map(r => r.id)));
    toast.success(`Applied ${pct > 0 ? '+' : ''}${pct}% price change to all items`);
  };

  const handleSaveGrid = async () => {
    if (editedRowIds.size === 0) {
      toast.error('No changes were made to any product.');
      return;
    }

    const token = localStorage.getItem('jaydev_token');
    setLoading(true);

    try {
      const updatesToSend = gridData.filter(r => editedRowIds.has(r.id));

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'batch_spreadsheet',
          updates: updatesToSend
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Saved batch changes for ${updatesToSend.length} product(s)!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save spreadsheet updates.');
      }
    } catch (err: any) {
      console.error('Batch save error:', err);
      toast.error('Error saving batch spreadsheet changes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrid = gridData.filter(r => 
    !filterText || 
    r.name.toLowerCase().includes(filterText.toLowerCase()) || 
    r.sku.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500 text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white tracking-wide flex items-center gap-2">
                Fast Interactive Spreadsheet Editor
                {editedRowIds.size > 0 && (
                  <span className="text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full">
                    {editedRowIds.size} Row{editedRowIds.size > 1 ? 's' : ''} Modified
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Directly edit Weight, Pricing, and Category in real time with TAB keyboard flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveGrid}
              disabled={loading || editedRowIds.size === 0}
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All ({editedRowIds.size})
            </button>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Batch Tools Bar */}
        <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-sans">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter grid..."
                className="bg-white border border-neutral-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-yellow-500 w-44"
              />
              <Filter className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="h-5 w-px bg-neutral-300 my-auto" />

            {/* Global Weight Tool */}
            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl p-1">
              <Scale className="w-3.5 h-3.5 text-blue-600 ml-1.5" />
              <input
                type="text"
                value={globalWeight}
                onChange={(e) => setGlobalWeight(e.target.value)}
                placeholder="Weight (e.g. 150g)"
                className="w-28 px-1.5 py-0.5 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={applyGlobalWeightToAll}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Apply All
              </button>
            </div>

            {/* Global Category Tool */}
            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl p-1">
              <Layers className="w-3.5 h-3.5 text-purple-600 ml-1.5" />
              <select
                value={globalCategory}
                onChange={(e) => setGlobalCategory(e.target.value ? Number(e.target.value) : '')}
                className="w-32 px-1 py-0.5 text-xs focus:outline-none bg-transparent"
              >
                <option value="">Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyGlobalCategoryToAll}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Apply All
              </button>
            </div>

            {/* Global Markup Tool */}
            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl p-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 ml-1.5" />
              <input
                type="number"
                value={globalPercentMarkup}
                onChange={(e) => setGlobalPercentMarkup(e.target.value)}
                placeholder="% Change"
                className="w-20 px-1 py-0.5 text-xs focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={applyPercentMarkupToAll}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Markup %
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            Showing {filteredGrid.length} of {gridData.length} items
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="flex-1 overflow-auto bg-neutral-50">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead className="bg-neutral-100 text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-wider sticky top-0 z-20 border-b border-neutral-200">
              <tr>
                <th className="p-3 w-10 text-center">Status</th>
                <th className="p-3 min-w-[220px]">Product & Image</th>
                <th className="p-3 w-36">Net Weight</th>
                <th className="p-3 w-32">Sale Price (₹)</th>
                <th className="p-3 w-32">MRP (₹)</th>
                <th className="p-3 w-48">Primary Category</th>
                <th className="p-3 w-48">Subcategory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredGrid.map((row) => {
                const isEdited = editedRowIds.has(row.id);
                const categoryObj = categories.find(c => Number(c.id) === Number(row.category_id));
                const subcats = categoryObj?.subcategories || [];

                return (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${isEdited ? 'bg-amber-50/70 border-l-4 border-l-amber-500' : 'hover:bg-neutral-50'}`}
                  >
                    <td className="p-3 text-center">
                      {isEdited ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title="Row Modified" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 inline-block" />
                      )}
                    </td>

                    {/* Name & Thumb */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {row.primary_image && (
                          <img 
                            src={row.primary_image} 
                            alt={row.name} 
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0" 
                          />
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-neutral-900 block truncate font-serif text-xs">
                            {row.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            SKU: {row.sku || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Weight Input */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.weight}
                        onChange={(e) => handleCellChange(row.id, 'weight', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-yellow-500 transition-colors font-sans ${isEdited ? 'bg-white border-amber-300 font-medium' : 'bg-neutral-50 border-neutral-200'}`}
                      />
                    </td>

                    {/* Sale Price Input */}
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={row.sale_price}
                        onChange={(e) => handleCellChange(row.id, 'sale_price', e.target.value ? parseFloat(e.target.value) : '')}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-yellow-500 transition-colors font-mono font-bold ${isEdited ? 'bg-white border-amber-300 text-neutral-900' : 'bg-neutral-50 border-neutral-200 text-neutral-800'}`}
                      />
                    </td>

                    {/* MRP Input */}
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={row.mrp}
                        onChange={(e) => handleCellChange(row.id, 'mrp', e.target.value ? parseFloat(e.target.value) : '')}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-yellow-500 transition-colors font-mono ${isEdited ? 'bg-white border-amber-300' : 'bg-neutral-50 border-neutral-200'}`}
                      />
                    </td>

                    {/* Category Dropdown */}
                    <td className="p-2">
                      <select
                        value={row.category_id}
                        onChange={(e) => {
                          handleCellChange(row.id, 'category_id', Number(e.target.value));
                          handleCellChange(row.id, 'subcategory_id', 0);
                        }}
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-yellow-500 font-sans ${isEdited ? 'bg-white border-amber-300' : 'bg-neutral-50 border-neutral-200'}`}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Subcategory Dropdown */}
                    <td className="p-2">
                      <select
                        value={row.subcategory_id || 0}
                        onChange={(e) => handleCellChange(row.id, 'subcategory_id', Number(e.target.value))}
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-yellow-500 font-sans ${isEdited ? 'bg-white border-amber-300' : 'bg-neutral-50 border-neutral-200'}`}
                      >
                        <option value={0}>None / Main</option>
                        {subcats.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0 font-sans text-xs">
          <span className="text-neutral-500 font-mono">
            {editedRowIds.size} row{editedRowIds.size !== 1 ? 's' : ''} staged for bulk commit
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGrid}
              disabled={loading || editedRowIds.size === 0}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Commit Batch Changes ({editedRowIds.size})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
