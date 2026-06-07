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

// GET /api/posts/[id]/comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.postComment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.author.name || "Anonymous",
      authorId: c.author.id,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) {
    appendError("[comments GET]", err);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = await prisma.postComment.create({
      data: { postId: id, authorId: user.id, content: content.trim() },
      include: { author: { select: { id: true, name: true } } },
    });

    // Notify post author
    if (post.authorId !== user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: user.id,
            postId: id,
            type: "comment",
          },
        });
      } catch {}
    }

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      authorName: comment.author.name || "Anonymous",
      authorId: comment.author.id,
      createdAt: comment.createdAt.toISOString(),
    }, { status: 201 });
  } catch (err) {
    appendError("[comments POST]", err);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}