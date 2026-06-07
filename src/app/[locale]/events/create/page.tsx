"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Calendar, Loader2 } from "lucide-react";

export default function CreateEventPage() {
  const t = useTranslations("events");
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();

  const [titleEn, setTitleEn] = React.useState("");
  const [titleAr, setTitleAr] = React.useState("");
  const [descriptionEn, setDescriptionEn] = React.useState("");
  const [descriptionAr, setDescriptionAr] = React.useState("");
  const [eventType, setEventType] = React.useState("online");
  const [location, setLocation] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [maxAttendees, setMaxAttendees] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  if (status === "unauthenticated") {
    const prefix = locale === "ar" ? "/ar" : "/en";
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <Calendar className="mx-auto h-12 w-12 text-iraq-gold/40" />
            <CardTitle className="mt-4 text-xl text-iraq-navy">{t("createTitle")}</CardTitle>
            <CardDescription className="mt-2">{t("signedInToCreate")}</CardDescription>
            <Link href="/auth" className="mt-6 inline-block">
              <Button variant="primary" size="lg">
                {t("signInLink") || "Sign in"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleAr: titleAr || undefined,
          descriptionEn: descriptionEn || undefined,
          descriptionAr: descriptionAr || undefined,
          eventType,
          location: location || undefined,
          startTime,
          endTime,
          maxAttendees: maxAttendees || undefined,
          tags: tags || undefined,
          status: "published",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/${locale}/events`);
      } else {
        setError(data.error ?? t("eventCreateError"));
      }
    } catch {
      setError(t("eventCreateError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-iraq-navy sm:text-4xl">{t("createTitle")}</h1>
          <p className="mt-2 text-iraq-stone">{t("createDescription")}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="border-iraq-gold/20 card-premium">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("titleEn")} *
                  </label>
                  <Input
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder={t("titleEnPlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("titleAr")}
                  </label>
                  <Input
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder={t("titleArPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("eventTypeLabel")} *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="h-11 w-full rounded-lg border border-stone-200 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
                    required
                  >
                    <option value="online">{t("online")}</option>
                    <option value="in_person">{t("inPerson")}</option>
                    <option value="hybrid">{t("hybrid")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("location")}
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("locationPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("startTime")} *
                  </label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("endTime")} *
                  </label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("maxAttendees")}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    placeholder={t("maxAttendeesPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("tags")}
                  </label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={t("tagsPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {t("descriptionEn")}
                </label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder={t("descriptionEnPlaceholder")}
                  rows={3}
                  className="h-24 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {t("descriptionAr")}
                </label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={t("descriptionArPlaceholder")}
                  rows={3}
                  className="h-24 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("publish")}
                    </>
                  ) : (
                    t("publish")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}