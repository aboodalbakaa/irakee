import { getTranslations } from "next-intl/server";
import { Heart, Target, Eye, Shield, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `Irakee — ${t("title")}`,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
            <Heart className="h-8 w-8 text-teal-700" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl">
            {t("title")}
          </h1>
        </div>

        {/* Mission & Vision */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <Card className="border-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-teal-700" />
                <h2 className="text-xl font-bold text-stone-900">
                  {t("mission")}
                </h2>
              </div>
              <p className="mt-4 text-stone-600 leading-relaxed">
                {t("missionDesc")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-teal-700" />
                <h2 className="text-xl font-bold text-stone-900">
                  {t("vision")}
                </h2>
              </div>
              <p className="mt-4 text-stone-600 leading-relaxed">
                {t("visionDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Legal Structure */}
        <Card className="mt-8 border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-amber-600" />
              <h2 className="text-xl font-bold text-stone-900">
                {t("structure")}
              </h2>
            </div>
            <p className="mt-4 text-stone-600 leading-relaxed">
              {t("structureDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mt-12">
          <h2 className="text-center text-2xl font-bold text-stone-900">
            {t("values")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-stone-200">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <span className="text-stone-700">{t("value1")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-stone-200">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <span className="text-stone-700">{t("value2")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-stone-200">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <span className="text-stone-700">{t("value3")}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-stone-200">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <span className="text-stone-700">{t("value4")}</span>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-12">
          <h2 className="text-center text-2xl font-bold text-stone-900">
            {t("team")}
          </h2>
          <Card className="mx-auto mt-8 max-w-md border-teal-100">
            <CardContent className="p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-2xl font-bold text-white">
                AA
              </div>
              <h3 className="mt-4 text-lg font-bold text-stone-900">
                {t("teamMember1Name")}
              </h3>
              <p className="mt-1 text-sm font-medium text-teal-700">
                {t("teamMember1Role")}
              </p>
              <p className="mt-3 text-sm text-stone-500">
                {t("teamMember1Bio")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}