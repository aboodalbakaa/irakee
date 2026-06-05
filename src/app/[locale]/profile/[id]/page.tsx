import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin, Globe, Calendar, Star, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const MOCK_PROFILES: Record<string, {
  id: string;
  name: string;
  profession: string;
  city: string;
  country: string;
  languages: string[];
  bio: string;
  memberSince: string;
  reviews: Array<{ id: string; reviewer: string; rating: number; content: string }>;
}> = {
  "1": {
    id: "1",
    name: "Layla Hassan",
    profession: "Software Engineer",
    city: "London",
    country: "UK",
    languages: ["English", "Arabic"],
    bio: "Full-stack developer with 8+ years of experience building web applications. Passionate about connecting the Iraqi diaspora through technology.",
    memberSince: "January 2026",
    reviews: [
      { id: "r1", reviewer: "Ahmed J.", rating: 5, content: "Excellent professional, highly recommend!" },
      { id: "r2", reviewer: "Mariam K.", rating: 4, content: "Great work on our community website project." },
    ],
  },
};

export default async function ProfilePage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });

  type ReviewRow = {
    id: string;
    rating: number;
    content: string | null;
    reviewer: { name: string | null };
  };

  type ProfileResult = {
    id: string;
    displayName: string | null;
    profession: string | null;
    city: string | null;
    country: string | null;
    languages: string[];
    bio: string | null;
    createdAt: Date;
    user: {
      name: string | null;
      received: ReviewRow[];
    };
  };

  let profile: {
    id: string;
    name: string;
    profession: string | null;
    city: string | null;
    country: string | null;
    languages: string[];
    bio: string | null;
    memberSince: string;
    reviews: Array<{ id: string; reviewer: string; rating: number; content: string | null }>;
  } | undefined;

  try {
    const dbProfile = (await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            received: {
              include: { reviewer: { select: { name: true } } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    })) as ProfileResult | null;

    if (dbProfile) {
      profile = {
        id: dbProfile.id,
        name: dbProfile.displayName ?? dbProfile.user.name ?? "Anonymous",
        profession: dbProfile.profession,
        city: dbProfile.city,
        country: dbProfile.country,
        languages: dbProfile.languages,
        bio: dbProfile.bio,
        memberSince: dbProfile.createdAt.toLocaleDateString(
          locale === "ar" ? "ar-SA" : "en-US",
          { year: "numeric", month: "long" }
        ),
        reviews: dbProfile.user.received.map((r) => ({
          id: r.id,
          reviewer: r.reviewer.name ?? "Anonymous",
          rating: r.rating,
          content: r.content,
        })),
      };
    }
  } catch (err) {
    console.error("[profile] db error:", err);
  }

  if (!profile) {
    profile = MOCK_PROFILES[id];
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-700">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  {profile.name}
                </h1>
                {profile.profession && (
                  <p className="mt-1 text-lg text-stone-500">{profile.profession}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
                  {profile.city && profile.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-stone-400" />
                      {profile.city}, {profile.country}
                    </span>
                  )}
                  {profile.languages && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-stone-400" />
                      {profile.languages.join(", ")}
                    </span>
                  )}
                  {profile.memberSince && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-stone-400" />
                      {t("memberSince")}: {profile.memberSince}
                    </span>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href="/auth">
                    <Button variant="primary">
                      <Mail className="h-4 w-4" />
                      {t("contact")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {profile.bio && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("bio")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("languages")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <Badge key={lang} variant="default">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("reviews")}</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.reviews && profile.reviews.length > 0 ? (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-900">
                        {review.reviewer}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">{t("noReviews")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
