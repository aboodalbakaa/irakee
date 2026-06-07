import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Plus, DollarSign } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ listingType?: string; city?: string; country?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listings" });
  return { title: `Iraqee — ${t("title")}` };
}

const TYPE_COLORS: Record<string, string> = {
  professional: "bg-blue-100 text-blue-700",
  service: "bg-green-100 text-green-700",
  housing: "bg-amber-100 text-amber-700",
  goods: "bg-purple-100 text-purple-700",
  opportunity: "bg-rose-100 text-rose-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-stone-100 text-stone-600",
};

export default async function ListingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "listings" });

  const where: Record<string, unknown> = {};
  if (sp.listingType) where.listingType = sp.listingType;
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.country) where.country = { contains: sp.country, mode: "insensitive" };

  type ListingRow = {
    id: string;
    listingType: string;
    titleEn: string;
    titleAr: string | null;
    city: string | null;
    country: string | null;
    priceMin: number | null;
    priceMax: number | null;
    currency: string | null;
    status: string;
    tags: string[];
    profile: { displayName: string | null };
  };

  let listings: ListingRow[] = [];
  try {
    listings = (await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { profile: { select: { displayName: true } } },
      take: 50,
    })) as ListingRow[];
  } catch (err) {
    console.error("[listings] db error:", err);
  }

  return (
    <div className="min-h-screen bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-iraq-navy sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-iraq-stone">{t("subtitle")}</p>
          </div>
          <Link href="/listings/create">
            <button className="flex items-center gap-2 rounded-xl bg-iraq-navy px-5 py-3 text-sm font-semibold text-white hover:bg-iraq-navy-light transition-colors shadow-lg">
              <Plus className="h-4 w-4" />
              {t("createListing")}
            </button>
          </Link>
        </div>

        {/* Filters */}
        <form className="mt-8 flex flex-wrap gap-3">
          <select
            name="listingType"
            defaultValue={sp.listingType ?? ""}
            className="h-11 rounded-lg border border-iraq-gold/20 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          >
            <option value="">{t("allTypes")}</option>
            <option value="professional">{t("professional")}</option>
            <option value="service">{t("service")}</option>
            <option value="housing">{t("housing")}</option>
            <option value="goods">{t("goods")}</option>
            <option value="opportunity">{t("opportunity")}</option>
          </select>
          <input
            type="text"
            name="city"
            defaultValue={sp.city ?? ""}
            placeholder={t("filterCity")}
            className="h-11 rounded-lg border border-iraq-gold/20 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          />
          <input
            type="text"
            name="country"
            defaultValue={sp.country ?? ""}
            placeholder={t("filterCountry")}
            className="h-11 rounded-lg border border-iraq-gold/20 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          />
          <button
            type="submit"
            className="rounded-lg bg-iraq-gold px-5 py-2.5 text-sm font-semibold text-iraq-navy hover:bg-iraq-gold-light transition-colors"
          >
            Filter
          </button>
        </form>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="mt-20 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-iraq-gold/40" />
            <p className="mt-4 text-iraq-stone">{t("noListings")}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={{ pathname: "/listings/[id]", params: { id: listing.id } }}
                className="group block"
              >
                <div className="rounded-xl border border-iraq-gold/20 bg-white p-6 card-premium hover:border-iraq-gold/50">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        TYPE_COLORS[listing.listingType] ?? "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {t(listing.listingType) || listing.listingType}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[listing.status] ?? "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-iraq-navy group-hover:text-iraq-gold transition-colors line-clamp-2">
                    {locale === "ar" && listing.titleAr ? listing.titleAr : listing.titleEn}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {listing.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-iraq-gold/10 px-2 py-0.5 text-xs text-iraq-gold-dark"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    {(listing.city || listing.country) && (
                      <span className="text-iraq-stone">
                        {[listing.city, listing.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {(listing.priceMin || listing.priceMax) && (
                      <span className="font-semibold text-iraq-navy">
                        {listing.priceMin && listing.priceMax
                          ? `$${listing.priceMin} - $${listing.priceMax}`
                          : listing.priceMin
                          ? `From $${listing.priceMin}`
                          : `Up to $${listing.priceMax}`}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}