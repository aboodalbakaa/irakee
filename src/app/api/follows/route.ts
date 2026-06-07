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

// POST /api/follows — Follow/unfollow
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { targetId } = await req.json();
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    if (targetId === user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      const count = await prisma.follow.count({ where: { followingId: targetId } });
      return NextResponse.json({ following: false, followerCount: count });
    }

    await prisma.follow.create({
      data: { followerId: user.id, followingId: targetId },
    });

    try {
      const existingNotif = await prisma.notification.findFirst({
        where: { userId: targetId, actorId: user.id, type: "follow" },
      });
      if (!existingNotif) {
        await prisma.notification.create({
          data: { userId: targetId, actorId: user.id, type: "follow" },
        });
      }
    } catch {}

    const count = await prisma.follow.count({ where: { followingId: targetId } });
    return NextResponse.json({ following: true, followerCount: count });
  } catch (err) {
    appendError("[follows POST]", err);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}

// GET /api/follows?userId=xxx — Get follow status
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ following: false, followerCount: 0, followingCount: 0 }, { status: 200 });
    }

    const url = new URL(req.url);
    const profileId = url.searchParams.get("userId");

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user || !profileId) {
      return NextResponse.json({ following: false, followerCount: 0, followingCount: 0 });
    }

    const [follow, followerCount, followingCount] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: profileId } },
      }),
      prisma.follow.count({ where: { followingId: profileId } }),
      prisma.follow.count({ where: { followerId: profileId } }),
    ]);

    return NextResponse.json({
      following: !!follow,
      followerCount,
      followingCount,
    });
  } catch (err) {
    appendError("[follows GET]", err);
    return NextResponse.json({ error: "Failed to get follow status" }, { status: 500 });
  }
}