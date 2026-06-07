import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="bg-iraq-navy border-t border-iraq-gold/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href={`/`}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-iraq-gold text-xs font-bold text-iraq-navy">
                I
              </div>
              <span className="text-lg font-bold text-iraq-gold">
                Iraqee
              </span>
            </Link>
            <p className="mt-3 text-sm text-iraq-cream/60">
              {t("tagline")}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-iraq-cream/50">
              <Heart className="h-3 w-3 fill-iraq-gold text-iraq-gold" />
              <span>{t("notice")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-iraq-gold">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/directory`}
                  className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors"
                >
                  {navT("directory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/events`}
                  className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/listings`}
                  className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors"
                >
                  Listings
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors"
                >
                  {navT("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-iraq-gold">
              {t("legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors cursor-pointer">
                  {t("privacy")}
                </span>
              </li>
              <li>
                <span className="text-sm text-iraq-cream/60 hover:text-iraq-gold transition-colors cursor-pointer">
                  {t("terms")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 rounded-lg bg-iraq-navy-light/50 border border-iraq-gold/10 p-4">
          <p className="text-center text-xs text-iraq-cream/60">
            {t("notice")}
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-iraq-gold/10 pt-6 text-center">
          <p className="text-xs text-iraq-cream/40">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}