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

// GET /api/posts — Feed
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const type = url.searchParams.get("type") || "global";
    const limit = 20;
    const skip = (page - 1) * limit;

    let postIds: string[] | undefined;
    if (type === "following" && session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          following: { select: { followingId: true } },
        },
      });
      if (currentUser && currentUser.following.length > 0) {
        const ids = currentUser.following.map((f) => f.followingId);
        const followingPosts = await prisma.post.findMany({
          where: { authorId: { in: ids } },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        });
        postIds = followingPosts.map((p) => p.id);
        if (postIds.length === 0) {
          return NextResponse.json({ posts: [], hasMore: false, total: 0 });
        }
      } else {
        return NextResponse.json({ posts: [], hasMore: false, total: 0 });
      }
    }

    const where = postIds ? { id: { in: postIds } } : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, image: true, profile: { select: { displayName: true, avatarUrl: true } } },
          },
          likes: { select: { userId: true } },
          comments: {
            select: { id: true, content: true, createdAt: true, author: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
            take: 3,
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    let likedMap: Record<string, boolean> = {};
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (currentUser) {
        const userLikes = await prisma.postLike.findMany({
          where: { userId: currentUser.id, postId: { in: posts.map((p) => p.id) } },
          select: { postId: true },
        });
        userLikes.forEach((l) => { likedMap[l.postId] = true; });
      }
    }

    const formatted = posts.map((post) => ({
      id: post.id,
      content: post.content,
      media: post.media,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.profile?.displayName || post.author.name || "Anonymous",
        avatarUrl: post.author.profile?.avatarUrl || post.author.image,
      },
      likes: post._count.likes,
      comments: post._count.comments,
      liked: likedMap[post.id] || false,
      recentComments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.author.name || "Anonymous",
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ posts: formatted, hasMore: skip + limit < total, total });
  } catch (err) {
    appendError("[posts GET]", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

// POST /api/posts — Create
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { content, media } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: content.trim(),
        media: media || [],
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
      content: post.content,
      media: post.media,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.profile?.displayName || post.author.name || "Anonymous",
        avatarUrl: post.author.profile?.avatarUrl || post.author.image,
      },
      likes: 0,
      comments: 0,
      liked: false,
      recentComments: [],
    }, { status: 201 });
  } catch (err) {
    appendError("[posts POST]", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}