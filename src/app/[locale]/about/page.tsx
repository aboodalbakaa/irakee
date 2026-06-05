import { getTranslations } from "next-intl/server";
import { Heart, Target, Eye, Shield, Globe, Users, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `Iraqee — ${t("title")}`,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="min-h-screen bg-iraq-cream">
      {/* Header */}
      <section className="relative overflow-hidden bg-iraq-navy py-20">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C),
              linear-gradient(150deg, #C9A84C 12%, transparent 12.5%, transparent 87%, #C9A84C 87.5%, #C9A84C)
            `,
            backgroundSize: '80px 140px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-iraq-gold/20 border border-iraq-gold/30">
            <Heart className="h-8 w-8 text-iraq-gold" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            {t("title")}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <div className="grid gap-8 sm:grid-cols-2">
          <Card className="border-iraq-gold/20 card-premium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-iraq-gold/10">
                  <Target className="h-5 w-5 text-iraq-gold" />
                </div>
                <h2 className="text-xl font-bold text-iraq-navy">
                  {t("mission")}
                </h2>
              </div>
              <p className="mt-4 text-iraq-stone leading-relaxed">
                {t("missionDesc")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-iraq-gold/20 card-premium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-iraq-gold/10">
                  <Eye className="h-5 w-5 text-iraq-gold" />
                </div>
                <h2 className="text-xl font-bold text-iraq-navy">
                  {t("vision")}
                </h2>
              </div>
              <p className="mt-4 text-iraq-stone leading-relaxed">
                {t("visionDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Legal Structure */}
        <Card className="mt-8 border-iraq-gold/20 card-premium">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-iraq-gold/10">
                <Shield className="h-5 w-5 text-iraq-gold" />
              </div>
              <h2 className="text-xl font-bold text-iraq-navy">
                {t("structure")}
              </h2>
            </div>
            <p className="mt-4 text-iraq-stone leading-relaxed">
              {t("structureDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Team */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-iraq-navy sm:text-3xl">
            <span className="gold-underline">{t("team")}</span>
          </h2>

          {/* Team Message */}
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <Quote className="mx-auto h-8 w-8 text-iraq-gold/40" />
            <p className="mt-4 text-lg italic text-iraq-stone leading-relaxed">
              {t("teamMessage")}
            </p>
          </div>

          {/* Founders side by side */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {/* Abood */}
            <Card className="border-iraq-gold/20 card-premium text-center">
              <CardContent className="p-8">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-iraq-navy text-3xl font-bold text-iraq-gold border-2 border-iraq-gold/30">
                  AA
                </div>
                <h3 className="mt-5 text-xl font-bold text-iraq-navy">
                  {t("teamMember1Name")}
                </h3>
                <p className="mt-1 text-sm font-medium text-iraq-gold">
                  {t("teamMember1Role")}
                </p>
                <div className="mx-auto mt-3 h-px w-12 bg-iraq-gold/30" />
                <p className="mt-4 text-sm text-iraq-stone leading-relaxed">
                  {t("teamMember1Bio")}
                </p>
              </CardContent>
            </Card>

            {/* Maryan */}
            <Card className="border-iraq-gold/20 card-premium text-center">
              <CardContent className="p-8">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-iraq-navy text-3xl font-bold text-iraq-gold border-2 border-iraq-gold/30">
                  M
                </div>
                <h3 className="mt-5 text-xl font-bold text-iraq-navy">
                  {t("teamMember2Name")}
                </h3>
                <p className="mt-1 text-sm font-medium text-iraq-gold">
                  {t("teamMember2Role")}
                </p>
                <div className="mx-auto mt-3 h-px w-12 bg-iraq-gold/30" />
                <p className="mt-4 text-sm text-iraq-stone leading-relaxed">
                  {t("teamMember2Bio")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-iraq-navy sm:text-3xl">
            {t("values")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-iraq-gold/20 card-premium">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <span className="text-iraq-stone">{t("value1")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-iraq-gold/20 card-premium">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <span className="text-iraq-stone">{t("value2")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-iraq-gold/20 card-premium">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <span className="text-iraq-stone">{t("value3")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-iraq-gold/20 card-premium">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <span className="text-iraq-stone">{t("value4")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}