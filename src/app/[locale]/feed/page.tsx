"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2, RefreshCw, Globe, Users, TrendingUp, UserPlus, Sparkles } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type PostData = Parameters<typeof PostCard>[0]["post"];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedType, setFeedType] = React.useState<"global" | "following">("global");
  const [error, setError] = React.useState<string | null>(null);
  const [suggestedUsers, setSuggestedUsers] = React.useState<any[]>([]);

  const fetchPosts = React.useCallback(async (type: "global" | "following") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts?page=1&type=${type}`);
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts(feedType);
  }, [feedType, fetchPosts]);

  // Fetch suggested users
  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles) setSuggestedUsers(data.profiles.slice(0, 4));
      })
      .catch(() => {});
  }, [status]);

  const handleCreatePost = async (content: string) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create post");
    }
    const newPost = await res.json();
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked: data.liked, likes: data.likes } : p))
    );
  };

  const handleComment = async (postId: string, content: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return;
    const comment = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments + 1,
              recentComments: [
                ...p.recentComments,
                { id: comment.id, content: comment.content, authorName: comment.authorName, createdAt: comment.createdAt },
              ],
            }
          : p
      )
    );
  };

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  const isAuthenticated = status === "authenticated";
  const userId = (session as any)?.user?.id;
  const userName = (session as any)?.user?.name || "You";

  const avatarColors = [
    "from-iraq-gold to-amber-600",
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-pink-600",
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-iraq-navy sm:text-3xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-iraq-gold" />
            Community Feed
          </h1>
          <p className="mt-1 text-sm text-iraq-stone">See what the Iraqi diaspora is talking about</p>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* ===== MAIN FEED ===== */}
          <div className="flex-1 min-w-0 max-w-2xl">
            {/* Feed type tabs */}
            <div className="mb-5 flex items-center gap-1 p-1 bg-white rounded-xl border border-iraq-sand/20 shadow-sm">
              <button
                onClick={() => setFeedType("global")}
                className={`flex items-center gap-2 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  feedType === "global"
                    ? "bg-gradient-to-r from-iraq-navy to-iraq-navy-light text-white shadow-md"
                    : "text-stone-600 hover:text-iraq-navy"
                }`}
              >
                <Globe className="h-4 w-4" />
                Global
                <span className="hidden sm:inline">Feed</span>
              </button>
              <button
                onClick={() => setFeedType("following")}
                className={`flex items-center gap-2 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  feedType === "following"
                    ? "bg-gradient-to-r from-iraq-navy to-iraq-navy-light text-white shadow-md"
                    : "text-stone-600 hover:text-iraq-navy"
                }`}
              >
                <Users className="h-4 w-4" />
                Following
              </button>
              <button
                onClick={() => fetchPosts(feedType)}
                className="rounded-lg p-2.5 text-stone-500 hover:bg-iraq-gold/5 hover:text-iraq-gold transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Post composer */}
            {isAuthenticated ? (
              <div className="mb-5">
                <PostComposer onSubmit={handleCreatePost} userInitial={getInitials(userName)} />
              </div>
            ) : (
              <div className="mb-5 rounded-2xl border border-iraq-sand/30 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold/20 to-iraq-gold/10 mb-3">
                  <Users className="h-6 w-6 text-iraq-gold" />
                </div>
                <p className="text-sm text-iraq-stone mb-3">Sign in to join the conversation</p>
                <Link href="/auth">
                  <Button variant="primary" size="sm">Sign In</Button>
                </Link>
              </div>
            )}

            {/* Feed */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
                  <p className="text-sm text-iraq-stone">Loading feed...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => fetchPosts(feedType)}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-iraq-sand/30 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold/20 to-iraq-gold/5 mb-4">
                  <Users className="h-8 w-8 text-iraq-gold/40" />
                </div>
                <h3 className="text-lg font-semibold text-iraq-navy">No posts yet</h3>
                <p className="mt-1 text-sm text-iraq-stone max-w-sm mx-auto">
                  {feedType === "following"
                    ? "Follow some people to see their posts here. Check the Directory to find interesting people!"
                    : "Be the first to share something with the community. Your post could inspire someone."}
                </p>
                {feedType === "following" && (
                  <Link href="/directory">
                    <Button variant="secondary" size="sm" className="mt-4">
                      Browse Directory
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    currentUserId={userId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ===== SIDEBAR (Desktop) ===== */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 space-y-5">
              {/* Suggested connections */}
              {isAuthenticated && suggestedUsers.length > 0 && (
                <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="h-4 w-4 text-iraq-gold" />
                    <h3 className="text-sm font-semibold text-iraq-navy">Suggested</h3>
                  </div>
                  <div className="space-y-3">
                    {suggestedUsers.map((user: any, i: number) => (
                      <Link
                        key={user.id || i}
                        href={`/profile/${user.userId || user.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-white text-[10px] font-bold`}>
                          {getInitials(user.displayName || user.name || "?")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-iraq-navy group-hover:text-iraq-gold transition-colors truncate">
                            {user.displayName || user.name}
                          </p>
                          <p className="text-xs text-iraq-stone/70 truncate">
                            {[user.city, user.country].filter(Boolean).join(", ") || "Iraqi diaspora"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/directory"
                    className="mt-3 block text-center text-xs font-medium text-iraq-gold hover:text-iraq-gold-dark transition-colors"
                  >
                    View all →
                  </Link>
                </div>
              )}

              {/* Trending topics */}
              <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-iraq-gold" />
                  <h3 className="text-sm font-semibold text-iraq-navy">Trending</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { tag: "#IraqiFood", posts: 24, emoji: "🍽️" },
                    { tag: "#DiasporaLife", posts: 18, emoji: "🌍" },
                    { tag: "#BaghdadMemories", posts: 12, emoji: "🏛️" },
                    { tag: "#IraqiWeddings", posts: 9, emoji: "💍" },
                    { tag: "#NewToUK", posts: 7, emoji: "🇬🇧" },
                  ].map((item) => (
                    <div key={item.tag} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.emoji}</span>
                        <span className="text-sm font-medium text-iraq-navy group-hover:text-iraq-gold transition-colors">
                          {item.tag}
                        </span>
                      </div>
                      <span className="text-xs text-iraq-stone/60">{item.posts}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community stats */}
              <div className="rounded-2xl border border-iraq-sand/30 bg-gradient-to-br from-iraq-navy to-iraq-navy-dark p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-iraq-gold-light">Iraqee Community</h3>
                <div className="mt-3 flex gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">5</p>
                    <p className="text-xs text-iraq-stone">Members</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{posts.length}</p>
                    <p className="text-xs text-iraq-stone">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">2</p>
                    <p className="text-xs text-iraq-stone">Cities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}