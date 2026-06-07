import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin, DollarSign, Tag, User, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const TYPE_COLORS: Record<string, string> = {
  professional: "bg-blue-100 text-blue-700",
  service: "bg-green-100 text-green-700",
  housing: "bg-amber-100 text-amber-700",
  goods: "bg-purple-100 text-purple-700",
  opportunity: "bg-rose-100 text-rose-700",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  return {
    title: `Iraqee — ${listing?.titleEn ?? "Listing"}`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "listings" });

  type ListingResult = {
    id: string;
    listingType: string;
    titleEn: string;
    titleAr: string | null;
    descriptionEn: string | null;
    descriptionAr: string | null;
    category: string | null;
    city: string | null;
    country: string | null;
    priceMin: number | null;
    priceMax: number | null;
    currency: string | null;
    tags: string[];
    status: string;
    createdAt: Date;
    profile: {
      displayName: string | null;
      phone: string | null;
      city: string | null;
      country: string | null;
    };
  };

  let listing: ListingResult | null = null;
  try {
    listing = (await prisma.listing.findUnique({
      where: { id },
      include: {
        profile: { select: { displayName: true, phone: true, city: true, country: true } },
      },
    })) as ListingResult | null;
  } catch (err) {
    console.error("[listing detail] db error:", err);
  }

  if (!listing) notFound();

  const title = locale === "ar" && listing.titleAr ? listing.titleAr : listing.titleEn;
  const description = locale === "ar" && listing.descriptionAr
    ? listing.descriptionAr
    : listing.descriptionEn;

  return (
    <div className="min-h-screen bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              TYPE_COLORS[listing.listingType] ?? "bg-stone-100 text-stone-600"
            }`}
          >
            {t(listing.listingType) || listing.listingType}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-iraq-navy sm:text-4xl">{title}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {description && (
              <Card className="border-iraq-gold/20 card-premium">
                <CardHeader>
                  <CardTitle className="text-iraq-navy">{t("listingDescription")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-iraq-stone leading-relaxed whitespace-pre-line">{description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {listing.tags.length > 0 && (
              <Card className="border-iraq-gold/20 card-premium">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Tag className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-iraq-gold/10 px-3 py-1 text-xs font-medium text-iraq-gold-dark"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price */}
            {(listing.priceMin || listing.priceMax) && (
              <Card className="border-iraq-gold/20 card-premium">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-lg font-bold text-iraq-navy">
                    <DollarSign className="h-5 w-5 text-iraq-gold" />
                    {listing.priceMin && listing.priceMax
                      ? `$${listing.priceMin} — $${listing.priceMax}`
                      : listing.priceMin
                      ? `From $${listing.priceMin}`
                      : `Up to $${listing.priceMax}`}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {(listing.city || listing.country) && (
              <Card className="border-iraq-gold/20 card-premium">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                    <div>
                      <p className="text-sm font-medium text-iraq-stone">{t("listingLocation")}</p>
                      <p className="text-iraq-navy">
                        {[listing.city, listing.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller */}
            <Card className="border-iraq-gold/20 card-premium">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                  <div>
                    <p className="text-sm font-medium text-iraq-stone">Seller</p>
                    <p className="text-iraq-navy">
                      {listing.profile.displayName ?? "Anonymous"}
                    </p>
                  </div>
                </div>
                <Link href="/auth" className="mt-4 block">
                  <Button variant="primary" size="sm" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    {t("contactSeller")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}