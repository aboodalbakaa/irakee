import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/directory": {
      en: "/directory",
      ar: "/دليل",
    },
    "/about": {
      en: "/about",
      ar: "/حول",
    },
    "/auth": {
      en: "/auth",
      ar: "/تسجيل-الدخول",
    },
    "/profile/[id]": {
      en: "/profile/[id]",
      ar: "/profile/[id]",
    },
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);