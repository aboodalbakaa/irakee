import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Calendar, MapPin, User, Tag } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const evt = await prisma.event.findUnique({ where: { id } });
  return {
    title: `Iraqee — ${evt?.titleEn ?? "Event"}`,
  };
}

function toEventData(raw: any) {
  return {
    id: raw.id as string,
    titleEn: raw.titleEn as string,
    titleAr: raw.titleAr as string | null,
    descriptionEn: raw.descriptionEn as string | null,
    descriptionAr: raw.descriptionAr as string | null,
    eventType: raw.eventType as string,
    location: raw.location as string | null,
    startTime: raw.startTime as Date,
    endTime: raw.endTime as Date,
    timezone: raw.timezone as string | null,
    maxAttendees: raw.maxAttendees as number | null,
    tags: raw.tags as string[],
    status: raw.status as string,
    organizer: raw.organizer as { name: string | null } | null,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "events" });

  let raw: any = null;
  try {
    raw = await prisma.event.findUnique({
      where: { id },
      include: { organizer: { select: { name: true } } },
    });
  } catch (err) {
    console.error("[event detail] db error:", err);
  }

  if (!raw) notFound();
  const event = toEventData(raw);

  const title = locale === "ar" && event.titleAr ? event.titleAr : event.titleEn;
  const description = locale === "ar" && event.descriptionAr ? event.descriptionAr : event.descriptionEn;

  const formatDate = (d: Date) =>
    d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLORS[event.eventType] ?? "bg-stone-100 text-stone-600"}`}>
              {t(event.eventType) || event.eventType}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[event.status] ?? "bg-stone-100 text-stone-600"}`}>
              {t(event.status) || event.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-iraq-navy sm:text-4xl">{title}</h1>
        </div>

        <div className="rounded-xl border border-iraq-gold/20 bg-white p-8 card-premium">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <div>
                <p className="text-sm font-medium text-iraq-stone">{t("eventDate")}</p>
                <p className="text-iraq-navy">{formatDate(event.startTime)} — {formatDate(event.endTime)}</p>
                <p className="text-sm text-iraq-stone">{formatTime(event.startTime)} — {formatTime(event.endTime)}{event.timezone && ` (${event.timezone})`}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                <div>
                  <p className="text-sm font-medium text-iraq-stone">{t("eventLocation")}</p>
                  <p className="text-iraq-navy">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
              <div>
                <p className="text-sm font-medium text-iraq-stone">{t("eventOrganizer")}</p>
                <p className="text-iraq-navy">{event.organizer?.name ?? "Anonymous"}</p>
              </div>
            </div>

            {event.maxAttendees && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                <div>
                  <p className="text-sm font-medium text-iraq-stone">{t("maxAttendees")}</p>
                  <p className="text-iraq-navy">{event.maxAttendees}</p>
                </div>
              </div>
            )}

            {event.tags.length > 0 && (
              <div className="sm:col-span-2 flex items-start gap-3">
                <Tag className="mt-0.5 h-5 w-5 shrink-0 text-iraq-gold" />
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-iraq-gold/10 px-3 py-1 text-xs font-medium text-iraq-gold-dark">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {description && (
          <div className="mt-8 rounded-xl border border-iraq-gold/20 bg-white p-8 card-premium">
            <h2 className="text-xl font-semibold text-iraq-navy mb-4">{t("listingDescription")}</h2>
            <p className="text-iraq-stone leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}