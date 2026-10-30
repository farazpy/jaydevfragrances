import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Copy, ExternalLink, Loader2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface S3FileUploadProps {
  label?: string;
  value: string;
  onChange: (url: string, fileData?: any) => void;
  placeholder?: string;
  accept?: string;
  caption?: string;
  helperText?: string;
  compact?: boolean;
}

export default function S3FileUpload({
  label = 'Upload Graphic / Document',
  value,
  onChange,
  placeholder = 'https://s3.htknetwork.in/f/... or paste image URL',
  accept = 'image/*,application/pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif',
  caption = '',
  helperText = 'Files are uploaded directly to S3 storage (https://s3.htknetwork.in)',
  compact = false
}: S3FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    if (caption) {
      formData.append('caption', caption);
    }

    try {
      const token = localStorage.getItem('jaydev_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const s3Error = data.error || data.message || (data.details && (data.details.message || data.details.error)) || 'Failed to upload file to S3 storage.';
        throw new Error(s3Error);
      }

      const finalUrl = data.direct_link || data.file_url;
      onChange(finalUrl, data);
      toast.success(`Uploaded "${file.name}" to S3 storage!`);
    } catch (err: any) {
      console.error('S3 Upload Error:', err);
      toast.error(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('S3 URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = value && (
    value.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
    value.includes('unsplash') || 
    value.includes('/f/') ||
    !value.match(/\.(pdf|doc|docx|xls|xlsx|txt)/i)
  );

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-bold flex items-center gap-1.5">
            <Upload className="w-3 h-3 text-amber-600" /> {label}
          </label>
          {value && value.includes('htknetwork.in') && (
            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> S3 Network Hosted
            </span>
          )}
        </div>
      )}

      {/* Main Container */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-3 transition-all ${
          isDragging 
            ? 'border-amber-500 bg-amber-50/50 shadow-md' 
            : value 
              ? 'border-neutral-200 bg-white' 
              : 'border-neutral-300 bg-neutral-50/60 hover:bg-neutral-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept={accept} 
          className="hidden" 
        />

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          
          {/* Thumbnail / File Icon Preview */}
          {value ? (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isImage ? (
                <div className="w-14 h-14 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0 shadow-inner group relative">
                  <img 
                    src={value} 
                    alt="S3 Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }} 
                  />
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0 text-amber-700">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div className="flex flex-col min-w-0 flex-1">
                <input 
                  type="text" 
                  value={value} 
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-800 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied Link' : 'Copy S3 Link'}
                  </button>
                  <span className="text-neutral-300">•</span>
                  <a 
                    href={value} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Open File
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 text-xs text-neutral-500 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-800 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">Drag & drop graphics or click to upload</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Supports images, PDF documents, banners, and logos up to 50MB</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to S3...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {helperText && !compact && (
        <p className="text-[10px] text-neutral-400 font-mono italic">
          {helperText}
        </p>
      )}
    </div>
  );
}
