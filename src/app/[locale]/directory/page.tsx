import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DirectoryFilters } from "@/components/ui/DirectoryFilters";
import { ProfileCard } from "@/components/ui/ProfileCard";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
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

const PLACEHOLDER_PROFILES = [
  { id: "1", name: "Layla Hassan", profession: "Software Engineer", city: "London", country: "UK", languages: ["EN", "AR"] },
  { id: "2", name: "Omar Al-Jamil", profession: "Architect", city: "Dubai", country: "UAE", languages: ["EN", "AR"] },
  { id: "3", name: "Sara Noori", profession: "Physician", city: "Chicago", country: "USA", languages: ["EN", "AR", "KU"] },
  { id: "4", name: "Ahmed Al-Rashid", profession: "Lawyer", city: "Berlin", country: "Germany", languages: ["EN", "AR", "DE"] },
  { id: "5", name: "Zainab Ali", profession: "Graphic Designer", city: "Amman", country: "Jordan", languages: ["AR", "EN"] },
  { id: "6", name: "Karim Mansour", profession: "Civil Engineer", city: "Birmingham", country: "UK", languages: ["EN", "AR"] },
];

const ITEMS_PER_PAGE = 12;

export default async function DirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "directory" });

  const currentPage = sp.page ? Math.max(1, parseInt(sp.page, 10)) : 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const where: Parameters<typeof prisma.profile.findMany>[0]["where"] = {};
  if (sp.profession) where.profession = sp.profession;
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.country) where.country = { contains: sp.country, mode: "insensitive" };
  if (sp.q) {
    where.OR = [
      { displayName: { contains: sp.q, mode: "insensitive" } },
      { profession: { contains: sp.q, mode: "insensitive" } },
      { city: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  type ProfileRow = {
    id: string;
    displayName: string | null;
    profession: string | null;
    city: string | null;
    country: string | null;
    languages: string[];
    user: { name: string | null };
  };

  let profiles: Array<{ id: string; name: string; profession: string; city: string; country: string; languages: string[] }> = [];
  let totalPages = 1;
  let usingPlaceholder = false;

  try {
    const [rows, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        take: ITEMS_PER_PAGE,
        skip,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }) as Promise<ProfileRow[]>,
      prisma.profile.count({ where }),
    ]);

    if (total === 0 && !sp.profession && !sp.city && !sp.country && !sp.q) {
      usingPlaceholder = true;
      profiles = PLACEHOLDER_PROFILES;
    } else {
      profiles = rows.map((p) => ({
        id: p.id,
        name: p.displayName ?? p.user?.name ?? "Anonymous",
        profession: p.profession ?? "",
        city: p.city ?? "",
        country: p.country ?? "",
        languages: p.languages,
      }));
      totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    }
  } catch (err) {
    console.error("[directory] db error:", err);
    usingPlaceholder = true;
    profiles = PLACEHOLDER_PROFILES;
  }

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
        <DirectoryFilters
          currentQ={sp.q}
          currentProfession={sp.profession}
          currentCity={sp.city}
          currentCountry={sp.country}
        />

        {/* Results */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} {...profile} />
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="mt-20 text-center">
            <p className="text-stone-500">{t("noResults")}</p>
          </div>
        )}

        {/* Pagination — only shown when using real DB data */}
        {!usingPlaceholder && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={{
                  pathname: "/directory",
                  query: {
                    ...(sp.q && { q: sp.q }),
                    ...(sp.profession && { profession: sp.profession }),
                    ...(sp.city && { city: sp.city }),
                    ...(sp.country && { country: sp.country }),
                    ...(pageNum > 1 && { page: String(pageNum) }),
                  },
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-teal-700 text-white"
                    : "border border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
