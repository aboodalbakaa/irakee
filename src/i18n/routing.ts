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
    "/dashboard": {
      en: "/dashboard",
      ar: "/لوحة-التحكم",
    },
    "/events": {
      en: "/events",
      ar: "/فعاليات",
    },
    "/events/create": {
      en: "/events/create",
      ar: "/فعاليات/جديد",
    },
    "/events/[id]": {
      en: "/events/[id]",
      ar: "/فعاليات/[id]",
    },
    "/listings": {
      en: "/listings",
      ar: "/إعلانات",
    },
    "/listings/create": {
      en: "/listings/create",
      ar: "/إعلانات/جديد",
    },
    "/listings/[id]": {
      en: "/listings/[id]",
      ar: "/إعلانات/[id]",
    },
    "/feed": {
      en: "/feed",
      ar: "/تغذية",
    },
    "/inbox": {
      en: "/inbox",
      ar: "/الرسائل",
    },
    "/inbox/[id]": {
      en: "/inbox/[id]",
      ar: "/الرسائل/[id]",
    },
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);