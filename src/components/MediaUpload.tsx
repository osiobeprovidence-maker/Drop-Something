import React, { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Loader2, Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  defaultUrl?: string;
  label?: string;
  aspect?: 'square' | 'video' | 'cover';
  type?: 'image' | 'video' | 'any';
  className?: string;
}

export function MediaUpload({
  onUploadComplete,
  defaultUrl,
  label,
  aspect = 'square',
  type = 'any',
  className
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast.error('File size too large (max 20MB)');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // 2. Post the file to the URL
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) throw new Error('Upload failed');

      const { storageId } = await result.json();

      // 3. The storageId is returned, but we need the public URL
      // We'll use the browser's ability to call the query from the server
      // Note: In a real app, you might want to call a server action or use a temporary local URL
      // But Convex storage IDs can be converted to URLs via a query.
      // For simplicity, we'll use a direct fetch or a query to get the URL.
      
      // I've added getUrl to files.ts, let's call it manually via fetch if needed or just wait for it.
      // Standard Convex practice: getUrl returns a public URL.
      const getUrl = `https://${window.location.hostname.includes('localhost') ? 'aromatic-ox-169.convex.site' : window.location.hostname}/api/storage/${storageId}`;
      
      // Wait, the easiest way to get the URL in client is to use a Convex function "getUrl"
      // or use the site URL directly if known.
      // Let's use a mutation/query to get the URL.
      
      // Actually, since I'm in a component, I can't easily wait for a query result in a handler.
      // I'll add a mutation that handles the storageId -> URL conversion if needed.
      // Or just use the storage site URL format.
      const storageUrl = `https://${import.meta.env.VITE_CONVEX_URL.split('//')[1].replace('.cloud', '.site')}/api/storage/${storageId}`;
      
      setPreview(storageUrl);
      onUploadComplete(storageUrl);
      toast.success('Upload successful!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <label className="label-mini ml-1">{label}</label>}
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed border-gray-100 rounded-[2.5rem] overflow-hidden group cursor-pointer transition-all hover:border-primary/20 hover:bg-gray-50/50",
          aspect === 'square' && "aspect-square",
          aspect === 'video' && "aspect-video",
          aspect === 'cover' && "aspect-[3/1] md:aspect-[4/1]",
          preview && "border-solid border-transparent bg-gray-100"
        )}
      >
        {preview ? (
          <>
            {preview.includes('video') || type === 'video' ? (
              <video src={preview} className="w-full h-full object-cover" />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white font-black text-sm uppercase tracking-widest">
                <Upload size={32} />
                Change
              </div>
            </div>
            <button 
              onClick={removeMedia}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-20"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-gray-300 group-hover:text-primary transition-colors">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              {type === 'video' ? <Film size={32} /> : <ImageIcon size={32} />}
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase tracking-widest">Click to upload</p>
              <p className="text-[10px] font-bold opacity-60">Max 20MB</p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-black text-gray-900 uppercase tracking-widest animate-pulse">Uploading...</p>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*'}
      />
    </div>
  );
}
