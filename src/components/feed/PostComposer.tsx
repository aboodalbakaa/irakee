"use client";

import * as React from "react";
import { Send, Loader2, Image, AtSign, X } from "lucide-react";

type PostComposerProps = {
  onPostCreated: () => void;
  placeholder?: string;
  userInitial?: string;
};

export function PostComposer({
  onPostCreated,
  placeholder = "Share something with the Iraqi community...",
  userInitial = "Y",
}: PostComposerProps) {
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageUrls.length === 0) return;
    if (submitting || uploading) return;
    setSubmitting(true);
    try {
      // If there are images, create a post with media
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || "📷",
          media: imageUrls,
        }),
      });
      if (res.ok) {
        const post = await res.json();
        setContent("");
        setImageUrls([]);
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/post", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrls((prev) => [...prev, data.url]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = (content.trim().length > 0 || imageUrls.length > 0) && !submitting && !uploading;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
        focused
          ? "border-iraq-gold/50 shadow-md shadow-iraq-gold/5"
          : "border-iraq-sand/30 shadow-sm"
      }`}
    >
      {/* Image file input (hidden) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top bar accent */}
      <div className={`h-1 bg-gradient-to-r from-iraq-gold/60 via-iraq-gold to-iraq-gold-light/60 transition-opacity ${focused ? "opacity-100" : "opacity-40"}`} />

      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold to-amber-600 text-xs font-bold text-white shadow-sm">
            {userInitial}
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={focused || content.length > 0 || imageUrls.length > 0 ? 3 : 2}
              maxLength={2000}
              className="w-full resize-none rounded-xl border-0 bg-transparent text-stone-800 placeholder-stone-400 focus:outline-none text-sm leading-relaxed transition-all"
              style={{ minHeight: focused || content.length > 0 || imageUrls.length > 0 ? "72px" : "48px" }}
            />
          </div>
        </div>

        {/* Upload preview */}
        {imageUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt="Upload preview"
                  className="h-20 w-20 rounded-lg object-cover border border-iraq-gold/20"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || imageUrls.length >= 4}
              className="p-2 rounded-lg text-stone-400 hover:text-iraq-gold hover:bg-iraq-gold/5 transition-colors disabled:opacity-30"
              title="Add image"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-stone-400 hover:text-iraq-gold hover:bg-iraq-gold/5 transition-colors disabled:opacity-30"
              title="Mention someone"
              disabled
            >
              <AtSign className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs transition-colors ${content.length > 1900 ? "text-red-500" : "text-stone-400"}`}>
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-iraq-navy to-iraq-navy-light text-white text-sm font-medium hover:from-iraq-navy-light hover:to-iraq-navy disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}