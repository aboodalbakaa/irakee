import { getTranslations } from "next-intl/server";
import { Users, Globe, FileText, ArrowRight, ArrowLeft, Star, Handshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { HeroSearch } from "@/components/ui/HeroSearch";
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
  type ProfileRow = {
    id: string;
    displayName: string | null;
    profession: string | null;
    city: string | null;
    country: string | null;
    languages: string[];
    user: { name: string | null };
  };

  let featuredProfiles: ProfileRow[] = [];
  try {
    featuredProfiles = (await prisma.profile.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    })) as ProfileRow[];
  } catch (err) {
    console.error("[home] db error:", err);
  }

  const profiles =
    featuredProfiles.length > 0
      ? featuredProfiles.map((p) => ({
          id: p.id,
          name: p.displayName ?? p.user?.name ?? "Anonymous",
          profession: p.profession ?? "",
          city: p.city ?? "",
          country: p.country ?? "",
          languages: p.languages,
        }))
      : FEATURED_PROFILES;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-iraq-navy">
        {/* Gold geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C),
              linear-gradient(150deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C),
              linear-gradient(30deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C),
              linear-gradient(150deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C),
              linear-gradient(60deg, rgba(201,168,76,0.3) 25%, transparent 25.5%, transparent 75%, rgba(201,168,76,0.3) 75%, rgba(201,168,76,0.3))
            `,
            backgroundSize: '80px 140px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}{" "}
              <span className="text-iraq-gold">🇮🇶</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-iraq-cream/80">
              {t("heroSubtitle")}
            </p>

            {/* Search */}
            <HeroSearch />

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/auth`}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-lg shadow-iraq-gold/20"
                >
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
                  className="border-iraq-gold/50 text-iraq-gold hover:bg-iraq-gold/10"
                >
                  {t("browseCta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-iraq-gold/10 bg-iraq-cream mesopotamian-pattern">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-iraq-gold" />
              </div>
              <p className="mt-3 text-3xl font-bold text-iraq-navy">
                {t("statsMembers")}
              </p>
              <p className="mt-1 text-sm text-iraq-stone">
                {t("statsMembersLabel")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Globe className="h-8 w-8 text-iraq-gold" />
              </div>
              <p className="mt-3 text-3xl font-bold text-iraq-navy">
                {t("statsCountries")}
              </p>
              <p className="mt-1 text-sm text-iraq-stone">
                {t("statsCountriesLabel")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <FileText className="h-8 w-8 text-iraq-gold" />
              </div>
              <p className="mt-3 text-3xl font-bold text-iraq-navy">
                {t("statsListings")}
              </p>
              <p className="mt-1 text-sm text-iraq-stone">
                {t("statsListingsLabel")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="bg-iraq-cream py-16 mesopotamian-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-iraq-navy sm:text-3xl">
            {t("featuredTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile: any) => (
              <ProfileCard
                key={profile.id}
                {...profile}
                className="card-premium border border-iraq-gold/20 hover:border-iraq-gold/50"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16 bg-white mesopotamian-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-iraq-navy sm:text-3xl">
            {t("whyJoin")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Card className="border-iraq-gold/20 card-premium">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-iraq-gold/10 border border-iraq-gold/20">
                  <Users className="h-6 w-6 text-iraq-gold" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-iraq-navy">
                  {t("reason1Title")}
                </h3>
                <p className="mt-2 text-sm text-iraq-stone">
                  {t("reason1Desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-iraq-gold/20 card-premium">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-iraq-gold/10 border border-iraq-gold/20">
                  <Star className="h-6 w-6 text-iraq-gold" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-iraq-navy">
                  {t("reason2Title")}
                </h3>
                <p className="mt-2 text-sm text-iraq-stone">
                  {t("reason2Desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-iraq-gold/20 card-premium">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-iraq-gold/10 border border-iraq-gold/20">
                  <Handshake className="h-6 w-6 text-iraq-gold" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-iraq-navy">
                  {t("reason3Title")}
                </h3>
                <p className="mt-2 text-sm text-iraq-stone">
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