import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemSubtitle?: string;
  itemImage?: string;
  warningText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  itemSubtitle,
  itemImage,
  warningText,
  loading = false,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 relative">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">{title}</h3>
            <span className="text-[11px] text-gray-500 font-sans">This action is permanent</span>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 mb-4 flex items-center gap-3">
          {itemImage ? (
            <img src={itemImage} alt={itemName} className="w-12 h-12 rounded-lg object-cover border border-neutral-200" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
              Item
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-sm text-neutral-900 truncate">{itemName}</h4>
            {itemSubtitle && (
              <p className="text-xs text-neutral-500 font-sans truncate">{itemSubtitle}</p>
            )}
          </div>
        </div>

        {warningText && (
          <p className="text-xs text-red-600/90 mb-5 leading-relaxed bg-red-50/50 p-2.5 rounded-lg border border-red-100">
            {warningText}
          </p>
        )}

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
