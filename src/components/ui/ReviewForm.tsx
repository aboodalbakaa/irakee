"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  targetId: string;
}

export function ReviewForm({ targetId }: ReviewFormProps) {
  const t = useTranslations("profile");
  const { data: session } = useSession();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [content, setContent] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!session) {
    return (
      <Card className="mt-6 border-iraq-gold/20">
        <CardContent className="p-8 text-center">
          <CardTitle className="text-iraq-navy mb-2">{t("writeReview")}</CardTitle>
          <CardDescription className="mb-4">{t("signInToReview")}</CardDescription>
          <Link href="/auth">
            <Button variant="primary" size="sm">
              {t("signInToReview")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, rating, content: content || undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: t("reviewSubmitted") });
        setRating(0);
        setContent("");
      } else {
        setMessage({ type: "error", text: data.error ?? t("reviewError") });
      }
    } catch {
      setMessage({ type: "error", text: t("reviewError") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-6 border-iraq-gold/20 card-premium">
      <CardHeader>
        <CardTitle className="text-iraq-navy">{t("writeReview")}</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              {t("rating")}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5 transition-colors"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hover || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="h-24 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || rating === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitReview")}
                </>
              ) : (
                t("submitReview")
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}