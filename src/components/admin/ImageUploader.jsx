import { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, ImageIcon } from 'lucide-react';
import { uploadApi } from '../../api/index.js';
import toast from 'react-hot-toast';

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));

      const { data } = await uploadApi.images(formData);
      const newImages = data.images.map((img, i) => ({
        url:        img.url,
        public_id:  img.public_id || '',
        caption:    '',
        isCover:    images.length === 0 && i === 0,
      }));
      onChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    // ensure at least one cover
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const setCover = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isCover: i === idx })));
  };

  const updateCaption = (idx, caption) => {
    onChange(images.map((img, i) => (i === idx ? { ...img, caption } : img)));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition group"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-brand-500 transition">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Drop images here or click to browse</span>
            <span className="text-xs">JPG, PNG, WEBP — up to 10MB each</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-stone-100 aspect-square">
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {/* Cover badge */}
              {img.isCover && (
                <div className="absolute top-1.5 left-1.5 badge bg-brand-500 text-white text-[10px]">
                  <Star className="w-2.5 h-2.5 fill-white" /> Cover
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {!img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(idx)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-brand-500 text-white transition"
                    title="Set as cover"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500 text-white transition"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-brand-400 hover:text-brand-500 transition text-xs gap-1"
          >
            <ImageIcon className="w-5 h-5" />
            Add more
          </button>
        </div>
      )}
    </div>
  );
}
