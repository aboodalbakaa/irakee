"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/directory" as const, label: t("directory") },
    { href: "/about" as const, label: t("about") },
  ];

  const isActive = (href: string) => {
    if (href === `/`) return pathname === `/`;
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            I
          </div>
          <span className="text-xl font-bold tracking-tight text-teal-700">
            Irakee
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Link href={`/auth`}>
            <Button variant="primary" size="sm">
              {t("signIn")}
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("mobileMenu")}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href={`/auth`}
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="primary" size="sm" className="w-full">
                  {t("signIn")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}