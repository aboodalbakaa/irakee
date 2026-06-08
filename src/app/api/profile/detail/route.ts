import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import fs from "fs";

const ERROR_LOG = "/root/irakee/.server-errors.log";
function logError(msg: string, err: unknown) {
  try {
    const ts = new Date().toISOString();
    const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    fs.appendFileSync(ERROR_LOG, `[${ts}] ${msg}\n${detail}\n---\n`);
  } catch {}
}

// GET /api/profile/detail?id=xxx — Public profile with posts and stats
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Find profile by userId or profile ID
    const profile = await prisma.profile.findFirst({
      where: { OR: [{ userId: id }, { id }] },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Get posts by this user
    const rawPosts = await prisma.post.findMany({
      where: { authorId: profile.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
          take: 3,
        },
      },
    });

    // Check likes for current user
    let likedMap: Record<string, boolean> = {};
    const session = await auth();
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (currentUser) {
        const userLikes = await prisma.postLike.findMany({
          where: { userId: currentUser.id, postId: { in: rawPosts.map((p) => p.id) } },
          select: { postId: true },
        });
        userLikes.forEach((l) => { likedMap[l.postId] = true; });
      }
    }

    const posts = rawPosts.map((p) => ({
      id: p.id,
      content: p.content,
      media: p.media,
      createdAt: p.createdAt.toISOString(),
      author: {
        id: profile.userId,
        name: profile.displayName || profile.user.name || "Anonymous",
        avatarUrl: profile.avatarUrl,
      },
      likes: p._count.likes,
      comments: p._count.comments,
      liked: likedMap[p.id] || false,
      recentComments: p.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.author.name || "Anonymous",
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    // Get follower/following counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: profile.userId } }),
      prisma.follow.count({ where: { followerId: profile.userId } }),
    ]);

    return NextResponse.json({
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        bio: profile.bio,
        profession: profile.profession,
        city: profile.city,
        country: profile.country,
        governorate: profile.governorate,
        languages: profile.languages,
        interests: profile.interests,
        diasporaStatus: profile.diasporaStatus,
        verificationStatus: profile.verificationStatus,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
        createdAt: profile.createdAt.toISOString(),
        user: { name: profile.user.name, email: profile.user.email },
      },
      posts,
      followerCount,
      followingCount,
    });
  } catch (err) {
    logError("[profile/public]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}