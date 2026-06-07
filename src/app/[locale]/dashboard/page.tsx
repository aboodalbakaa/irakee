"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Save, User, Loader2, Camera } from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data: session, status } = useSession();

  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [profession, setProfession] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [languages, setLanguages] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [diasporaStatus, setDiasporaStatus] = React.useState("first_gen");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) return;
          setDisplayName(data.displayName ?? "");
          setBio(data.bio ?? "");
          setProfession(data.profession ?? "");
          setCity(data.city ?? "");
          setCountry(data.country ?? "");
          setLanguages((data.languages ?? []).join(", "));
          setPhone(data.phone ?? "");
          setDiasporaStatus(data.diasporaStatus ?? "first_gen");
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          profession,
          city,
          country,
          languages,
          phone,
          diasporaStatus,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("saved") });
      } else {
        setMessage({ type: "error", text: t("saveError") });
      }
    } catch {
      setMessage({ type: "error", text: t("saveError") });
    } finally {
      setSaving(false);
    }
  };

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-iraq-gold/10 border border-iraq-gold/20">
              <User className="h-8 w-8 text-iraq-gold" />
            </div>
            <CardTitle className="mt-6 text-2xl">{t("title")}</CardTitle>
            <CardDescription className="mt-2">{t("notSignedIn")}</CardDescription>
            <Link href="/auth" className="mt-6 inline-block">
              <Button variant="primary" size="lg">
                {t("signInLink")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-iraq-navy sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-iraq-stone">{t("subtitle")}</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Avatar Upload */}
        <Card className="mb-6 border-iraq-gold/20 card-premium">
          <CardHeader>
            <CardTitle className="text-iraq-navy flex items-center gap-2">
              <Camera className="h-5 w-5 text-iraq-gold" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUpload userId={session?.user?.id || ""} />
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-iraq-gold/20 card-premium">
          <CardHeader>
            <CardTitle className="text-iraq-navy flex items-center gap-2">
              <User className="h-5 w-5 text-iraq-gold" />
              {t("profileSection")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("displayName")}
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("displayNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("profession")}
                  </label>
                  <Input
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder={t("professionPlaceholder")}
                  />
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("languages")}
                  </label>
                  <Input
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder={t("languagesPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t("phone")}
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {t("diasporaStatus")}
                </label>
                <select
                  value={diasporaStatus}
                  onChange={(e) => setDiasporaStatus(e.target.value)}
                  className="h-11 w-full rounded-lg border border-stone-200 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
                >
                  <option value="first_gen">{t("firstGen")}</option>
                  <option value="second_gen">{t("secondGen")}</option>
                  <option value="friend_of_iraq">{t("friendOfIraq")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {t("bio")}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("bioPlaceholder")}
                  rows={4}
                  className="h-28 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={saving}
                  className="min-w-[160px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("saveButton")}
                    </>
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