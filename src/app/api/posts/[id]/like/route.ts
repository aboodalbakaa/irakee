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

// POST /api/posts/[id]/like — Toggle like
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false, likes: await prisma.postLike.count({ where: { postId: id } }) });
    }

    await prisma.postLike.create({
      data: { postId: id, userId: user.id },
    });

    // Create notification
    if (post.authorId !== user.id) {
      try {
        const existingNotif = await prisma.notification.findFirst({
          where: { userId: post.authorId, actorId: user.id, postId: id, type: "like" },
        });
        if (!existingNotif) {
          await prisma.notification.create({
            data: { userId: post.authorId, actorId: user.id, postId: id, type: "like" },
          });
        }
      } catch {}
    }

    return NextResponse.json({
      liked: true,
      likes: await prisma.postLike.count({ where: { postId: id } }),
    });
  } catch (err) {
    appendError("[like POST]", err);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}