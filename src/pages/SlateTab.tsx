import { useState, useRef, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Image as ImageIcon, Video, FileText, Lock,
  Globe, Users, Heart, Star, AlertCircle, X, Music
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useScrollLock } from "@/src/hooks/useScrollLock";

interface Slate {
  _id: Id<"slates">;
  type: "text" | "image" | "video" | "audio";
  content?: string;
  mediaUrl?: string;
  playbackId?: string;
  visibility: "public" | "followers" | "supporters" | "members";
}

interface SlateTabProps {
  convexCreator: any;
  createSlate: (args: {
    creatorId: Id<"creators">;
    type: "text" | "image" | "video" | "audio";
    content?: string;
    mediaUrl?: string;
    playbackId?: string;
    visibility: "public" | "followers" | "supporters" | "members";
  }) => Promise<Id<"slates">>;
  deleteSlate: (args: { slateId: Id<"slates"> }) => Promise<boolean>;
  slates: Slate[];
  generateUploadUrl: () => Promise<string>;
  hasProFeatures: boolean;
  createVideoUpload?: (args: { fileName: string; fileSize: number }) => Promise<{ uploadId: string; uploadUrl: string }>;
  getVideoPlaybackInfo?: (args: { uploadId: string }) => Promise<{ status: string; playbackId: string | null; playbackUrl: string | null }>;
}

export default function SlateTab({
  convexCreator,
  createSlate,
  deleteSlate,
  slates,
  generateUploadUrl,
  hasProFeatures,
  createVideoUpload,
  getVideoPlaybackInfo,
}: SlateTabProps) {
  const [activeType, setActiveType] = useState<"text" | "image" | "video" | "audio">("text");
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "supporters" | "members">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slateToDelete, setSlateToDelete] = useState<Id<"slates"> | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proFeatureType, setProFeatureType] = useState<"video" | "audio" | "locked" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaCaptionLimit = hasProFeatures ? 700 : 300;

  // Lock body scroll when modals are open
  useScrollLock(deleteModalOpen);
  useScrollLock(showProModal);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const visibilityOptions = [
    { value: "public" as const, label: "Public", icon: Globe, description: "Anyone can see", color: "text-blue-600" },
    { value: "followers" as const, label: "Followers", icon: Users, description: "Followers only", color: "text-purple-600" },
    { value: "supporters" as const, label: "Supporters", icon: Heart, description: "Supporters only", color: "text-pink-600" },
    { value: "members" as const, label: "Members", icon: Star, description: "Members only", color: "text-amber-600" },
  ];

  const uploadFileToStorage = async (file: File) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error("Upload failed");
    }

    const { storageId } = await result.json();
    return storageId as string;
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("Video size must be less than 100MB.");
      return;
    }

    // All users can upload videos, no Pro check needed
    setVideoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Audio size must be less than 50MB.");
      return;
    }

    // Check if user has Pro features for audio upload
    if (!hasProFeatures) {
      setProFeatureType("audio");
      setShowProModal(true);
      setAudioFile(null);
      setAudioPreview("");
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
      return;
    }

    setAudioFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVisibilityChange = (value: "public" | "followers" | "supporters" | "members") => {
    // Check if user has Pro features for locked visibility
    if (value !== "public" && !hasProFeatures) {
      setProFeatureType("locked");
      setShowProModal(true);
      setVisibility("public");
      return;
    }
    setVisibility(value);
  };

  const handleSubmit = async () => {
    if (!convexCreator) return;
    const trimmedTextContent = textContent.trim();

    // Validation
    if (activeType === "text" && !trimmedTextContent) {
      alert("Please enter some content");
      return;
    }

    if (activeType === "image" && !imageFile) {
      alert("Please select an image");
      return;
    }

    if ((activeType === "image" || activeType === "video" || activeType === "audio") && trimmedTextContent.length > mediaCaptionLimit) {
      alert(`Captions are limited to ${mediaCaptionLimit} characters on your current plan.`);
      return;
    }

    if (activeType === "video" && !videoFile) {
      alert("Please select a video");
      return;
    }

    if (activeType === "audio" && !audioFile) {
      alert("Please select an audio file");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl: string | undefined;
      let playbackId: string | undefined;

      if (activeType === "image" && imageFile) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadFileToStorage(imageFile);
        } finally {
          setIsUploading(false);
        }
      }

      if (activeType === "video" && videoFile) {
        setIsUploading(true);

        try {
          if (videoFile.size > 100 * 1024 * 1024) {
            throw new Error("Video file is too large. Maximum size is 100MB.");
          }

          if (createVideoUpload && getVideoPlaybackInfo) {
            try {
              const { uploadId, uploadUrl } = await createVideoUpload({
                fileName: videoFile.name,
                fileSize: videoFile.size,
              });

              const uploadResult = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": videoFile.type },
                body: videoFile,
              });

              if (!uploadResult.ok) {
                throw new Error(`Mux upload failed with status ${uploadResult.status}`);
              }

              let playbackInfo = await getVideoPlaybackInfo({ uploadId });
              let attempts = 0;
              const maxAttempts = 60;

              while (!playbackInfo.playbackId && attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                playbackInfo = await getVideoPlaybackInfo({ uploadId });
                attempts++;
              }

              if (playbackInfo.playbackId) {
                playbackId = playbackInfo.playbackId;
              }
            } catch (muxError) {
              console.warn("Mux upload failed, falling back to direct file storage:", muxError);
            }
          }

          if (!playbackId) {
            mediaUrl = await uploadFileToStorage(videoFile);
          }
        } finally {
          setIsUploading(false);
        }
      }

      if (activeType === "audio" && audioFile) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadFileToStorage(audioFile);
          playbackId = mediaUrl;
        } finally {
          setIsUploading(false);
        }
      }

      await createSlate({
        creatorId: convexCreator._id,
        type: activeType,
        content:
          activeType === "text" || activeType === "image" || activeType === "video" || activeType === "audio"
            ? trimmedTextContent || undefined
            : undefined,
        mediaUrl,
        playbackId,
        visibility,
      });

      // ✅ Success - Reset form and error
      console.log("✅ Slate created successfully");
      setErrorMessage(null);
      setTextContent("");
      setImageFile(null);
      setImagePreview("");
      setVideoFile(null);
      setVideoPreview("");
      setAudioFile(null);
      setAudioPreview("");
      setVisibility("public");
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
    } catch (err) {
      // ❌ Extract real error message from caught error
      let detailedError = "Failed to create slate. Please try again.";
      
      if (err instanceof Error) {
        detailedError = err.message;
        console.error("❌ Error details:", {
          message: err.message,
          stack: err.stack,
          type: err.constructor.name,
        });
      } else if (typeof err === "string") {
        detailedError = err;
        console.error("❌ String error:", err);
      } else {
        console.error("❌ Unknown error type:", err);
      }
      
      setErrorMessage(detailedError);
      console.error("❌ [Frontend] Error creating slate:", detailedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!slateToDelete) return;
    try {
      await deleteSlate({ slateId: slateToDelete });
    } catch (err) {
      console.error("Error deleting slate:", err);
    } finally {
      setDeleteModalOpen(false);
      setSlateToDelete(null);
    }
  };

  const openDeleteModal = (slateId: Id<"slates">) => {
    setSlateToDelete(slateId);
    setDeleteModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Slate</h2>
        <p className="text-sm text-black/40">Share updates, images, and videos with your audience.</p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Error Creating Slate</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveType("text")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeType === "text"
                ? "bg-black text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10"
            )}
          >
            <FileText size={16} />
            Text
          </button>
          <button
            onClick={() => setActiveType("image")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeType === "image"
                ? "bg-black text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10"
            )}
          >
            <ImageIcon size={16} />
            Image
          </button>
          <button
            onClick={() => setActiveType("video")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeType === "video"
                ? "bg-black text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10"
            )}
          >
            <Video size={16} />
            Video
          </button>
          <button
            onClick={() => setActiveType("audio")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeType === "audio"
                ? "bg-black text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10"
            )}
          >
            <Music size={16} />
            Audio
          </button>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          {activeType === "text" && (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          )}

          {activeType === "image" && (
            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/80 p-2 text-white hover:bg-black"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-black/20 bg-black/5 flex flex-col items-center justify-center gap-3 text-black/40 hover:border-black/40 hover:bg-black/10 transition-all"
                >
                  <ImageIcon size={32} />
                  <span className="text-sm font-bold">Click to upload image</span>
                  <span className="text-xs">PNG, JPG up to 10MB</span>
                </button>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Image Caption
                  </label>
                  <span className={cn(
                    "text-[11px] font-bold",
                    textContent.length > mediaCaptionLimit ? "text-red-500" : "text-black/40"
                  )}>
                    {textContent.length}/{mediaCaptionLimit}
                  </span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Add an optional caption for this image..."
                  rows={4}
                  maxLength={mediaCaptionLimit}
                  className="w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <p className="mt-2 text-xs text-black/40">
                  Optional caption. Free plan: 300 characters. Pro: 700 characters.
                </p>
              </div>
            </div>
          )}

          {activeType === "video" && (
            <div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              {videoPreview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <video src={videoPreview} controls className="w-full h-64 object-cover" />
                  <button
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview("");
                      if (videoInputRef.current) videoInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/80 p-2 text-white hover:bg-black"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-black/20 bg-black/5 flex flex-col items-center justify-center gap-3 text-black/40 hover:border-black/40 hover:bg-black/10 transition-all"
                >
                  <Video size={32} />
                  <span className="text-sm font-bold">Click to upload video</span>
                  <span className="text-xs text-center px-4">MP4 up to 100MB, max 15 min (Free for all users)</span>
                </button>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Video Caption
                  </label>
                  <span className={cn(
                    "text-[11px] font-bold",
                    textContent.length > mediaCaptionLimit ? "text-red-500" : "text-black/40"
                  )}>
                    {textContent.length}/{mediaCaptionLimit}
                  </span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Add an optional caption for this video..."
                  rows={4}
                  maxLength={mediaCaptionLimit}
                  className="w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <p className="mt-2 text-xs text-black/40">
                  Optional caption. Free plan: 300 characters. Pro: 700 characters.
                </p>
              </div>
            </div>
          )}

          {activeType === "audio" && (
            <div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="hidden"
              />
              {audioPreview ? (
                <div className="rounded-2xl border border-black/10 bg-black/5 p-6">
                  <audio src={audioPreview} controls className="w-full" />
                  <button
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview("");
                      if (audioInputRef.current) audioInputRef.current.value = "";
                    }}
                    className="mt-3 text-xs font-bold text-red-500 hover:text-red-600"
                  >
                    Remove audio
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-black/20 bg-black/5 flex flex-col items-center justify-center gap-3 text-black/40 hover:border-black/40 hover:bg-black/10 transition-all"
                >
                  <Music size={32} />
                  <span className="text-sm font-bold">Click to upload audio</span>
                  <span className="text-xs">MP3, WAV, OGG up to 50MB (Pro feature)</span>
                </button>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">
                    Audio Caption
                  </label>
                  <span className={cn(
                    "text-[11px] font-bold",
                    textContent.length > mediaCaptionLimit ? "text-red-500" : "text-black/40"
                  )}>
                    {textContent.length}/{mediaCaptionLimit}
                  </span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Add an optional caption for this audio..."
                  rows={4}
                  maxLength={mediaCaptionLimit}
                  className="w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black placeholder:text-black/30 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <p className="mt-2 text-xs text-black/40">
                  Optional caption. Free plan: 300 characters. Pro: 700 characters.
                </p>
              </div>
            </div>
          )}

          {/* Visibility Selector */}
          <div>
            <label className="text-xs font-bold text-black/40 uppercase tracking-wider mb-3 block">
              Visibility
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleVisibilityChange(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all",
                    visibility === option.value
                      ? "border-black bg-black/5"
                      : "border-black/5 bg-white hover:border-black/20"
                  )}
                >
                  <option.icon size={18} className={option.color} />
                  <span className="text-xs font-bold text-black">{option.label}</span>
                  <span className="text-[10px] text-black/40">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="w-full h-12 rounded-full bg-black text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Uploading...
              </>
            ) : isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Posting...
              </>
            ) : (
              <>
                <Plus size={18} />
                Post to Slate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slates Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-black/40 uppercase tracking-wider">Your Posts</h3>
        {slates.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
            <FileText size={40} className="text-black/20 mx-auto" />
            <p className="mt-4 font-bold text-black/40">No posts yet</p>
            <p className="text-sm text-black/30">Create your first slate post above</p>
          </div>
        ) : (
          slates.map((slate) => (
            <div
              key={slate._id}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    slate.type === "text" ? "bg-blue-50 text-blue-600" :
                    slate.type === "image" ? "bg-purple-50 text-purple-600" :
                    slate.type === "video" ? "bg-pink-50 text-pink-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {slate.type}
                  </span>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    slate.visibility === "public" ? "bg-gray-50 text-gray-600" :
                    slate.visibility === "followers" ? "bg-purple-50 text-purple-600" :
                    slate.visibility === "supporters" ? "bg-pink-50 text-pink-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    {slate.visibility}
                  </span>
                </div>
                <button
                  onClick={() => openDeleteModal(slate._id)}
                  className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {slate.type === "text" && (
                <p className="text-sm font-medium text-black whitespace-pre-wrap">{slate.content}</p>
              )}

              {slate.type === "image" && slate.mediaUrl && (
                <div className="space-y-3">
                  <img
                    src={slate.mediaUrl}
                    alt="Slate image"
                    className="w-full rounded-2xl object-cover max-h-96"
                  />
                  {slate.content && (
                    <p className="text-sm font-medium text-black whitespace-pre-wrap">{slate.content}</p>
                  )}
                </div>
              )}

              {slate.type === "video" && (slate.playbackId || slate.mediaUrl) && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <video
                      controls
                      className="w-full max-h-96 object-cover"
                      poster=""
                    >
                      <source
                        src={slate.playbackId ? `https://stream.mux.com/${slate.playbackId}.m3u8` : slate.mediaUrl}
                        type={slate.playbackId ? "application/x-mpegURL" : "video/mp4"}
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  {slate.content && (
                    <p className="text-sm font-medium text-black whitespace-pre-wrap">{slate.content}</p>
                  )}
                </div>
              )}

              {slate.type === "audio" && (slate.playbackId || slate.mediaUrl) && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                    <audio controls className="w-full">
                      <source src={slate.mediaUrl || `https://stream.mux.com/${slate.playbackId}.m3u8`} />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                  {slate.content && (
                    <p className="text-sm font-medium text-black whitespace-pre-wrap">{slate.content}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6"
            >
              <h3 className="text-lg font-bold text-black">Delete Post?</h3>
              <p className="mt-2 text-sm text-black/60">This action cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 h-11 rounded-full bg-black/5 text-sm font-bold text-black hover:bg-black/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 h-11 rounded-full bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pro Feature Modal */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Upgrade to Pro</h3>
                  <p className="text-sm text-black/60">Unlock premium features</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {proFeatureType === "locked" && (
                  <div className="flex items-start gap-3 rounded-xl bg-black/5 p-4">
                    <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-black">Lock Content for Monetization</p>
                      <p className="text-xs text-black/60 mt-1">Restrict content to followers, supporters, or members to earn recurring revenue.</p>
                    </div>
                  </div>
                )}
                {proFeatureType === "audio" && (
                  <div className="flex items-start gap-3 rounded-xl bg-black/5 p-4">
                    <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-black">Audio Uploads</p>
                      <p className="text-xs text-black/60 mt-1">Upload audio files up to 50MB (MP3, WAV, OGG) for podcasts, music, and voice notes.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProModal(false)}
                  className="flex-1 h-11 rounded-full bg-black/5 text-sm font-bold text-black hover:bg-black/10 transition-colors"
                >
                  Maybe Later
                </button>
                <a
                  href="/settings?tab=subscription"
                  className="flex-1 flex h-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-colors hover:bg-black/90"
                >
                  Upgrade Now
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
