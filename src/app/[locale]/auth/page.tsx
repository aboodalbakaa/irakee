import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import AuthForm from "./AuthForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: `Iraqee — ${t("title")}`,
  };
}

export default function AuthPage() {
  return <AuthForm />;
}