import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Search, Users, Globe, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
};

// Placeholder featured profiles data
const FEATURED_PROFILES = [
  {
    id: "1",
    name: "Layla Hassan",
    profession: "Software Engineer",
    city: "London",
    country: "UK",
    languages: ["EN", "AR"],
  },
  {
    id: "2",
    name: "Omar Al-Jamil",
    profession: "Architect",
    city: "Dubai",
    country: "UAE",
    languages: ["EN", "AR"],
  },
  {
    id: "3",
    name: "Sara Noori",
    profession: "Physician",
    city: "Chicago",
    country: "USA",
    languages: ["EN", "AR", "KU"],
  },
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const navT = await getTranslations({ locale, namespace: "nav" });

  // Fetch featured profiles from database, fall back to placeholder
  let featuredProfiles: any;
  try {
    featuredProfiles = await prisma.profile.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
  } catch {
    featuredProfiles = [];
  }

  const profiles =
    featuredProfiles.length > 0
      ? featuredProfiles.map((p: any) => ({
          id: p.id,
          name: p.displayName || p.user?.name || "Anonymous",
          profession: p.profession || "",
          city: p.city || "",
          country: p.country || "",
          languages: p.languages,
        }))
      : FEATURED_PROFILES;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0tMTgtMThjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6bTM2IDBjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              {t("heroSubtitle")}
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-300" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="h-14 w-full rounded-xl border-0 bg-white/10 pl-12 pr-4 text-base text-white placeholder:text-teal-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/auth`}>
                <Button variant="secondary" size="lg" className="font-semibold">
                  {t("joinCta")}
                  {locale === "ar" ? (
                    <ArrowLeft className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                  ) : (
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                  )}
                </Button>
              </Link>
              <Link href={`/${locale}/directory`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t("browseCta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-amber-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-teal-800">
                {t("statsMembers")}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {t("statsMembersLabel")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Globe className="h-8 w-8 text-amber-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-teal-800">
                {t("statsCountries")}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {t("statsCountriesLabel")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <FileText className="h-8 w-8 text-amber-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-teal-800">
                {t("statsListings")}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {t("statsListingsLabel")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="bg-stone-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("featuredTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile: any) => (
              <ProfileCard key={profile.id} {...profile} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("whyJoin")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Card className="border-teal-100">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <Users className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {t("reason1Title")}
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  {t("reason1Desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-teal-100">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <FileText className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {t("reason2Title")}
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  {t("reason2Desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-teal-100">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <Globe className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {t("reason3Title")}
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  {t("reason3Desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}