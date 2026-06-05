"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { Button } from "./Button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname as any, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center gap-1.5 text-sm"
      aria-label={`Switch language to ${locale === "en" ? "Arabic" : "English"}`}
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{locale === "en" ? "AR" : "EN"}</span>
    </Button>
  );
}