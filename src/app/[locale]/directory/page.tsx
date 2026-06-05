import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { Input } from "@/components/ui/Input";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    profession?: string;
    city?: string;
    country?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "directory" });
  return {
    title: `Iraqee — ${t("title")}`,
  };
}

// Placeholder data
const PLACEHOLDER_PROFILES = [
  { id: "1", name: "Layla Hassan", profession: "Software Engineer", city: "London", country: "UK", languages: ["EN", "AR"] },
  { id: "2", name: "Omar Al-Jamil", profession: "Architect", city: "Dubai", country: "UAE", languages: ["EN", "AR"] },
  { id: "3", name: "Sara Noori", profession: "Physician", city: "Chicago", country: "USA", languages: ["EN", "AR", "KU"] },
  { id: "4", name: "Ahmed Al-Rashid", profession: "Lawyer", city: "Berlin", country: "Germany", languages: ["EN", "AR", "DE"] },
  { id: "5", name: "Zainab Ali", profession: "Graphic Designer", city: "Amman", country: "Jordan", languages: ["AR", "EN"] },
  { id: "6", name: "Karim Mansour", profession: "Civil Engineer", city: "Birmingham", country: "UK", languages: ["EN", "AR"] },
];

const PROFESSIONS = [
  "All Professions",
  "Software Engineer",
  "Architect",
  "Physician",
  "Lawyer",
  "Graphic Designer",
  "Civil Engineer",
];

export default async function DirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "directory" });

  // Build Prisma query with filters
  const where: Record<string, unknown> = {};
  if (sp.profession) where.profession = sp.profession;
  if (sp.city) where.city = sp.city;
  if (sp.country) where.country = sp.country;

  let dbProfiles: any[] = [];
  try {
    dbProfiles = await prisma.profile.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }) as unknown as any[];
  } catch {
    dbProfiles = [];
  }

  const allProfiles =
    dbProfiles.length > 0
      ? dbProfiles.map((p: any) => ({
          id: p.id,
          name: p.displayName || p.user?.name || "Anonymous",
          profession: p.profession || "",
          city: p.city || "",
          country: p.country || "",
          languages: p.languages,
        }))
      : PLACEHOLDER_PROFILES;

  const currentPage = sp.page ? parseInt(sp.page, 10) : 1;
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allProfiles.length / itemsPerPage);
  const paginatedProfiles = allProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-stone-500">{t("subtitle")}</p>
        </div>

        {/* Search & Filters */}
        <div className="mt-8">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="pl-10 h-12"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <select className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">{t("filterProfession")}</option>
              {PROFESSIONS.slice(1).map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">{t("filterCity")}</option>
              <option value="london">London</option>
              <option value="dubai">Dubai</option>
              <option value="chicago">Chicago</option>
              <option value="berlin">Berlin</option>
            </select>
            <select className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">{t("filterCountry")}</option>
              <option value="uk">UK</option>
              <option value="uae">UAE</option>
              <option value="usa">USA</option>
              <option value="germany">Germany</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedProfiles.map((profile) => (
            <ProfileCard key={profile.id} {...profile} />
          ))}
        </div>

        {paginatedProfiles.length === 0 && (
          <div className="mt-20 text-center">
            <p className="text-stone-500">{t("noResults")}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={{
                    pathname: "/directory",
                    query: pageNum === 1 ? undefined : { page: String(pageNum) },
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pageNum === currentPage
                      ? "bg-teal-700 text-white"
                      : "border border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}