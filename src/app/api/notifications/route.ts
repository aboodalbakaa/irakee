import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import fs from "fs";

const ERROR_LOG = "/root/irakee/.server-errors.log";

function appendError(msg: string, err: unknown) {
  try {
    const ts = new Date().toISOString();
    const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    fs.appendFileSync(ERROR_LOG, `[${ts}] ${msg}\n${detail}\n---\n`);
  } catch {}
}

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, name: true, image: true, profile: { select: { displayName: true, avatarUrl: true } } } },
          post: { select: { id: true, content: true } },
        },
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
      prisma.notification.count({ where: { userId: user.id } }),
    ]);

    const formatted = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      actor: {
        id: n.actor.id,
        name: n.actor.profile?.displayName || n.actor.name || "Someone",
        avatarUrl: n.actor.profile?.avatarUrl || n.actor.image,
      },
      post: n.post ? { id: n.post.id, snippet: n.post.content.substring(0, 100) } : null,
    }));

    return NextResponse.json({ notifications: formatted, unreadCount, hasMore: skip + limit < total });
  } catch (err) {
    appendError("[notifications GET]", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}