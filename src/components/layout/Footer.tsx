import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href={`/`}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-xs font-bold text-white">
                I
              </div>
              <span className="text-lg font-bold text-teal-700">
                Irakee
              </span>
            </Link>
            <p className="mt-3 text-sm text-stone-500">
              {t("tagline")}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-stone-400">
              <Heart className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Community Interest Company</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-stone-900">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/directory`}
                  className="text-sm text-stone-500 hover:text-teal-700 transition-colors"
                >
                  {navT("directory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-stone-500 hover:text-teal-700 transition-colors"
                >
                  {navT("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-stone-900">
              {t("legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-stone-500 hover:text-teal-700 transition-colors cursor-pointer">
                  {t("privacy")}
                </span>
              </li>
              <li>
                <span className="text-sm text-stone-500 hover:text-teal-700 transition-colors cursor-pointer">
                  {t("terms")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* CIC Notice */}
        <div className="mt-8 rounded-lg bg-teal-50 p-4">
          <p className="text-center text-xs text-teal-700">
            {t("cicNotice")}
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-stone-200 pt-6 text-center">
          <p className="text-xs text-stone-400">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}