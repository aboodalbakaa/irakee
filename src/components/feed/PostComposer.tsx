"use client";

import * as React from "react";
import { Send, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PostComposerProps = {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
};

export function PostComposer({ onSubmit, placeholder = "What's on your mind?" }: PostComposerProps) {
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-iraq-gold/20 bg-white p-4 card-premium">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-lg border-0 bg-transparent text-stone-800 placeholder-stone-400 focus:outline-none text-sm leading-relaxed"
      />
      <div className="mt-2 flex items-center justify-between pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 rounded-lg text-stone-400 hover:text-iraq-gold hover:bg-iraq-gold/5 transition-colors"
            title="Add image"
            disabled
          >
            <Image className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400">{content.length}/2000</span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting || !content.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}