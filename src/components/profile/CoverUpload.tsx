"use client";

import * as React from "react";
import { ImageIcon, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CoverUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.coverUrl) setCoverUrl(data.coverUrl);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/cover", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setCoverUrl(data.coverUrl);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Cover upload failed:", err);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-gradient-to-br from-iraq-navy/5 to-iraq-gold/5 border border-iraq-sand/30">
        {(preview || coverUrl) ? (
          <img
            src={preview || coverUrl!}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-iraq-gold/30" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
          {uploading ? "Uploading..." : "Upload Cover"}
        </Button>
        {success && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Saved</span>}
      </div>
      <p className="text-[11px] text-iraq-stone">Recommended: 1200×400px. JPEG, PNG or WebP. Max 10MB.</p>
    </div>
  );
}