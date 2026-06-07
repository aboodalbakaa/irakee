"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, Bell, MessageCircle, Rss } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: session } = useSession();
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // Poll notifications
  React.useEffect(() => {
    if (!session) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notifications?page=1&limit=5");
        if (res.ok) {
          const data = await res.json();
          setUnreadNotifs(data.unreadCount || 0);
          setNotifications(data.notifications || []);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const handleMarkRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "PUT" });
      setUnreadNotifs(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/feed" as const, label: t("feed"), icon: Rss },
    { href: "/directory" as const, label: t("directory") },
    { href: "/events" as const, label: t("events") },
    { href: "/listings" as const, label: t("listings") },
    { href: "/about" as const, label: t("about") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const notifSummary = (n: any) => {
    switch (n.type) {
      case "follow": return `${n.actor.name} followed you`;
      case "like": return `${n.actor.name} liked your post`;
      case "comment": return `${n.actor.name} commented on your post`;
      case "message": return `${n.actor.name} sent you a message`;
      default: return `${n.actor.name} interacted with you`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-iraq-gold/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-iraq-navy text-sm font-bold text-iraq-gold">
            I
          </div>
          <span className="text-xl font-bold tracking-tight text-iraq-navy">
            Iraqee
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
                  ? "bg-iraq-gold/10 text-iraq-gold"
                  : "text-stone-600 hover:bg-iraq-gold/5 hover:text-iraq-navy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {session ? (
            <>
              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative rounded-lg p-2 text-stone-500 hover:bg-iraq-gold/5 hover:text-iraq-gold transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-iraq-navy">Notifications</h3>
                        {unreadNotifs > 0 && (
                          <button
                            onClick={handleMarkRead}
                            className="text-xs text-iraq-gold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-stone-400">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-stone-50 transition-colors ${
                                !n.read ? "bg-iraq-gold/5" : ""
                              }`}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-iraq-gold/20 text-xs font-bold text-iraq-navy">
                                {n.actor.name?.charAt(0) || "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-stone-700">{notifSummary(n)}</p>
                                <p className="mt-0.5 text-xs text-stone-400">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        href="/inbox"
                        onClick={() => setShowNotifDropdown(false)}
                        className="flex items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm text-iraq-gold hover:bg-stone-50 rounded-b-xl"
                      >
                        <MessageCircle className="h-4 w-4" />
                        View all messages
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Profile / Dashboard */}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  {session.user?.name ?? t("dashboard")}
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="primary" size="sm">
                {t("signIn")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          {session && unreadNotifs > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("mobileMenu")}
            className="text-iraq-navy hover:text-iraq-gold"
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
        <div className="border-t border-iraq-gold/10 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-iraq-gold/10 text-iraq-gold"
                    : "text-stone-600 hover:bg-iraq-gold/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <>
                <Link
                  href="/inbox"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/inbox")
                      ? "bg-iraq-gold/10 text-iraq-gold"
                      : "text-stone-600 hover:bg-iraq-gold/5"
                  )}
                >
                  {t("inbox")}
                  {unreadNotifs > 0 && ` (${unreadNotifs})`}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/dashboard")
                      ? "bg-iraq-gold/10 text-iraq-gold"
                      : "text-stone-600 hover:bg-iraq-gold/5"
                  )}
                >
                  {t("dashboard")}
                </Link>
              </>
            )}
            <div className="pt-2">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="primary" size="sm" className="w-full">
                    {session.user?.name ?? t("dashboard")}
                  </Button>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="primary" size="sm" className="w-full">
                    {t("signIn")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}