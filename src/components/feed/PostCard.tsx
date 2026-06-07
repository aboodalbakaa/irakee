"use client";

import * as React from "react";
import { Heart, MessageCircle, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type PostAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type PostComment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

type PostData = {
  id: string;
  content: string;
  media: string[];
  createdAt: string;
  author: PostAuthor;
  likes: number;
  comments: number;
  liked: boolean;
  recentComments: PostComment[];
};

type PostCardProps = {
  post: PostData;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export function PostCard({ post, onLike, onComment, onDelete, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [liking, setLiking] = React.useState(false);
  const [animateHeart, setAnimateHeart] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleLike = async () => {
    setLiking(true);
    onLike(post.id);
    if (!post.liked) setAnimateHeart(true);
    setLiking(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    onComment(post.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  const focusComment = () => {
    setShowComments(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Avatar color based on name
  const avatarColors = [
    "from-iraq-gold to-amber-600",
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-pink-600",
    "from-rose-600 to-red-600",
  ];
  const colorIdx = post.author.name.length % avatarColors.length;

  return (
    <div className="post-enter rounded-2xl border border-iraq-sand/30 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Subtle gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-iraq-gold/60 via-iraq-gold to-iraq-gold-light/60" />

      <div className="p-5">
        {/* Author header */}
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group cursor-pointer">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow`}>
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(post.author.name)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-iraq-navy group-hover:text-iraq-gold transition-colors leading-tight">
                {post.author.name}
              </p>
              <p className="text-xs text-iraq-stone/70">{timeAgo(post.createdAt)}</p>
            </div>
          </Link>
          {currentUserId === post.author.id && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-stone-800 leading-relaxed whitespace-pre-wrap text-[15px]">{post.content}</p>

        {/* Media */}
        {post.media.length > 0 && (
          <div className="mt-3 rounded-xl overflow-hidden grid gap-1" style={{ gridTemplateColumns: post.media.length > 1 ? "1fr 1fr" : "1fr" }}>
            {post.media.map((url, i) => (
              <img key={i} src={url} alt="" className="object-cover w-full h-48 hover:scale-105 transition-transform duration-300" />
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="mt-4 flex items-center gap-1 pt-3 border-t border-stone-100">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              post.liked
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-stone-500 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            {liking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 transition-all duration-200 ${post.liked ? "fill-red-500 stroke-red-500" : ""} ${animateHeart ? "heart-animate" : ""}`}
                onAnimationEnd={() => setAnimateHeart(false)}
              />
            )}
            <span className="text-xs font-medium">{post.likes > 0 ? post.likes : ""}</span>
          </button>
          <button
            onClick={focusComment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-iraq-gold hover:bg-iraq-gold/5 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{post.comments > 0 ? post.comments : ""}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-stone-100 fade-in">
            {/* Existing comments */}
            {post.recentComments.length > 0 && (
              <div className="space-y-2 mb-3">
                {post.recentComments.map((c) => (
                  <div key={c.id} className="comment-enter flex items-start gap-2 text-sm bg-stone-50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-iraq-navy shrink-0 text-xs">
                      {c.authorName}
                    </span>
                    <span className="text-stone-600 leading-relaxed">{c.content}</span>
                  </div>
                ))}
                {post.comments > 3 && (
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-xs font-medium text-iraq-gold hover:text-iraq-gold-dark transition-colors"
                  >
                    View all {post.comments} comments
                  </button>
                )}
              </div>
            )}

            {/* Comment input */}
            <form onSubmit={handleComment} className="flex gap-2 items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold/20 to-iraq-gold/10 text-xs font-bold text-iraq-gold-dark">
                Y
              </div>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-iraq-gold/30 focus:border-iraq-gold transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-iraq-gold hover:bg-iraq-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}