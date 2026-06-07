"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw, Globe, Users, MessageCircle, Bell, LogIn } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type PostData = Parameters<typeof PostCard>[0]["post"];

export default function FeedPage() {
  const t = useTranslations("feed");
  const { data: session, status } = useSession();
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedType, setFeedType] = React.useState<"global" | "following">("global");
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-iraq-navy sm:text-3xl">Community Feed</h1>
          <p className="mt-1 text-sm text-iraq-stone">See what the Iraqi diaspora is talking about</p>
        </div>

        {/* Feed type tabs */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setFeedType("global")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              feedType === "global"
                ? "bg-iraq-navy text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200 hover:border-iraq-gold/30"
            }`}
          >
            <Globe className="h-4 w-4" />
            Global
          </button>
          <button
            onClick={() => setFeedType("following")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              feedType === "following"
                ? "bg-iraq-navy text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200 hover:border-iraq-gold/30"
            }`}
          >
            <Users className="h-4 w-4" />
            Following
          </button>
          <button
            onClick={() => fetchPosts(feedType)}
            className="ml-auto rounded-lg border border-stone-200 bg-white p-2 text-stone-500 hover:bg-iraq-gold/5 hover:text-iraq-gold transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Post composer (only for authenticated users) */}
        {isAuthenticated ? (
          <div className="mb-6">
            <PostComposer onSubmit={handleCreatePost} />
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-iraq-gold/20 bg-white p-6 text-center card-premium">
            <Bell className="mx-auto h-8 w-8 text-iraq-gold/40 mb-2" />
            <p className="text-sm text-iraq-stone mb-3">Sign in to join the conversation</p>
            <Link href="/auth">
              <Button variant="primary" size="sm">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-iraq-gold" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => fetchPosts(feedType)}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-iraq-gold/20 bg-white p-12 text-center card-premium">
            <MessageCircle className="mx-auto h-12 w-12 text-iraq-gold/30" />
            <h3 className="mt-4 text-lg font-semibold text-iraq-navy">No posts yet</h3>
            <p className="mt-1 text-sm text-iraq-stone">
              {feedType === "following"
                ? "Follow some people to see their posts here"
                : "Be the first to share something with the community"}
            </p>
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
    </div>
  );
}