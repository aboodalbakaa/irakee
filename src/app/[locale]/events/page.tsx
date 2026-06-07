import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Calendar, MapPin, Plus } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; eventType?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: `Iraqee — ${t("title")}` };
}

const TYPE_COLORS: Record<string, string> = {
  online: "bg-blue-100 text-blue-700",
  in_person: "bg-amber-100 text-amber-700",
  hybrid: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-stone-200 text-stone-600",
};

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "events" });

  const where: Record<string, unknown> = {};
  if (sp.city) where.location = { contains: sp.city, mode: "insensitive" };
  if (sp.eventType) where.eventType = sp.eventType;

  let events: Array<{
    id: string;
    titleEn: string;
    titleAr: string | null;
    eventType: string;
    location: string | null;
    startTime: Date;
    endTime: Date;
    status: string;
    organizer: { name: string | null };
  }> = [];

  try {
    events = (await prisma.event.findMany({
      where,
      orderBy: { startTime: "desc" },
      include: { organizer: { select: { name: true } } },
      take: 50,
    })) as typeof events;
  } catch (err) {
    console.error("[events] db error:", err);
  }

  const now = new Date();

  return (
    <div className="min-h-screen bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-iraq-navy sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-iraq-stone">{t("subtitle")}</p>
          </div>
          <Link href="/events/create">
            <button className="flex items-center gap-2 rounded-xl bg-iraq-navy px-5 py-3 text-sm font-semibold text-white hover:bg-iraq-navy-light transition-colors shadow-lg">
              <Plus className="h-4 w-4" />
              {t("createEvent")}
            </button>
          </Link>
        </div>

        {/* Filters */}
        <form className="mt-8 flex flex-wrap gap-3">
          <input
            type="text"
            name="city"
            defaultValue={sp.city ?? ""}
            placeholder={t("filterCity")}
            className="h-11 rounded-lg border border-iraq-gold/20 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          />
          <select
            name="eventType"
            defaultValue={sp.eventType ?? ""}
            className="h-11 rounded-lg border border-iraq-gold/20 bg-white px-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          >
            <option value="">{t("allTypes")}</option>
            <option value="online">{t("online")}</option>
            <option value="in_person">{t("inPerson")}</option>
            <option value="hybrid">{t("hybrid")}</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-iraq-gold px-5 py-2.5 text-sm font-semibold text-iraq-navy hover:bg-iraq-gold-light transition-colors"
          >
            Filter
          </button>
        </form>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="mt-20 text-center">
            <Calendar className="mx-auto h-12 w-12 text-iraq-gold/40" />
            <p className="mt-4 text-iraq-stone">{t("noEvents")}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isPast = event.endTime < now;
              return (
                <Link
                  key={event.id}
                  href={{ pathname: "/events/[id]", params: { id: event.id } }}
                  className="group block"
                >
                  <div className="rounded-xl border border-iraq-gold/20 bg-white p-6 card-premium hover:border-iraq-gold/50">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          TYPE_COLORS[event.eventType] ?? "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {t(event.eventType) || event.eventType}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[event.status] ?? "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {t(event.status) || event.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-iraq-navy group-hover:text-iraq-gold transition-colors line-clamp-2">
                      {locale === "ar" && event.titleAr ? event.titleAr : event.titleEn}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-iraq-stone">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {event.startTime.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {isPast ? ` (${t("pastEvent")})` : ""}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}