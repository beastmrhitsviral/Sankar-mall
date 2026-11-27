import { useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { compressImageFileToDataUrl } from '../lib/imageUpload';

interface ProductImageUploadBoxProps {
  value: string;
  fileName?: string;
  onChange: (dataUrl: string, fileName: string) => void;
  fallbackPreviewSrc?: string;
}

export function ProductImageUploadBox({
  value,
  fileName,
  onChange,
  fallbackPreviewSrc,
}: ProductImageUploadBoxProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const optimized = await compressImageFileToDataUrl(file);
      onChange(optimized, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    onChange('', '');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-xs font-semibold text-slate-700">
          Product Image
        </span>
        <span className="text-[11px] text-slate-400">
          {value ? 'Custom photo ready' : 'Optional · uses section image if empty'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
        }}
        className="sr-only"
      />

      {value ? (
        <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
          <img
            src={value}
            alt="Uploaded product preview"
            className="w-20 h-16 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {fileName || 'Uploaded product image'}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              Optimized for instant storefront loading
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <motion.label
                htmlFor={inputId}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Change</span>
              </motion.label>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-700 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-[#1E3A8A] bg-blue-50/70'
              : 'border-slate-300 hover:border-[#1E3A8A] bg-slate-50/60 hover:bg-blue-50/30'
          }`}
        >
          {fallbackPreviewSrc ? (
            <img
              src={fallbackPreviewSrc}
              alt="Default section thumbnail"
              className="w-16 h-12 rounded-lg object-cover border border-slate-200 opacity-75 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
              <ImagePlus className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              {isProcessing ? 'Optimizing product photo...' : 'Tap or drop to upload product image'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports JPG, PNG, WebP · Auto-compressed for fast loading
            </p>
          </div>
        </label>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
