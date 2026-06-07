"use client";

import * as React from "react";
import { Camera, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AvatarUploadProps = {
  userId: string;
};

export function AvatarUpload({ userId }: AvatarUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally first
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSuccess(false);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5">
      {/* Preview */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold/20 to-iraq-gold/5 border-2 border-iraq-gold/30 overflow-hidden">
        {(preview || avatarUrl) ? (
          <img
            src={preview || avatarUrl!}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera className="h-8 w-8 text-iraq-gold/40" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload Photo
            </>
          )}
        </Button>
        <p className="mt-1 text-[11px] text-iraq-stone">JPEG, PNG or WebP. Max 5MB.</p>
        {success && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> Avatar updated!
          </p>
        )}
      </div>
    </div>
  );
}