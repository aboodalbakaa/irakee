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
import { DollarSign, Loader2 } from "lucide-react";

export default function CreateListingPage() {
  const t = useTranslations("listings");
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();

  const [listingType, setListingType] = React.useState("service");
  const [titleEn, setTitleEn] = React.useState("");
  const [titleAr, setTitleAr] = React.useState("");
  const [descriptionEn, setDescriptionEn] = React.useState("");
  const [descriptionAr, setDescriptionAr] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [tags, setTags] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  if (status === "unauthenticated") {
    const prefix = locale === "ar" ? "/ar" : "/en";
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <DollarSign className="mx-auto h-12 w-12 text-iraq-gold/40" />
            <CardTitle className="mt-4 text-xl text-iraq-navy">{t("createTitle")}</CardTitle>
            <CardDescription className="mt-2">{t("signedInToCreate")}</CardDescription>
            <Link href="/auth" className="mt-6 inline-block">
              <Button variant="primary" size="lg">
                Sign in
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
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingType,
          titleEn,
          titleAr: titleAr || undefined,
          descriptionEn: descriptionEn || undefined,
          descriptionAr: descriptionAr || undefined,
          category: category || undefined,
          city: city || undefined,
          country: country || undefined,
          priceMin: priceMin || undefined,
          priceMax: priceMax || undefined,
          currency,
          tags: tags || undefined,
          status: "active",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/${locale}/listings`);
      } else {
        setError(data.error ?? t("listingCreateError"));
      }
    } catch {
      setError(t("listingCreateError"));
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
                    {t("listingTypeLabel")} *
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="h-11 w-full rounded-lg border border-stone-200 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
                    required
                  >
                    <option value="professional">{t("professional")}</option>
                    <option value="service">{t("service")}</option>
                    <option value="housing">{t("housing")}</option>
                    <option value="goods">{t("goods")}</option>
                    <option value="opportunity">{t("opportunity")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Web Development"
                  />
                </div>
              </div>

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
                    {t("city")}
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("cityPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("country")}
                  </label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t("countryPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("priceMin")}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder={t("priceMinPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("priceMax")}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder={t("priceMaxPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("currency")}
                  </label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder={t("currencyPlaceholder")}
                  />
                </div>
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