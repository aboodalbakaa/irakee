"use client";

import * as React from "react";
import { Heart, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
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

export function PostCard({ post, onLike, onComment, onDelete, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [liking, setLiking] = React.useState(false);

  const handleLike = async () => {
    setLiking(true);
    onLike(post.id);
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

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl border border-iraq-gold/20 bg-white p-5 card-premium">
      {/* Author header */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iraq-gold/20 text-sm font-bold text-iraq-navy">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-iraq-navy group-hover:text-iraq-gold transition-colors">
              {post.author.name}
            </p>
            <p className="text-xs text-iraq-stone">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {currentUserId === post.author.id && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: post.media.length > 1 ? "1fr 1fr" : "1fr" }}>
          {post.media.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="rounded-lg object-cover w-full h-48"
            />
          ))}
        </div>
      )}

      {/* Actions bar */}
      <div className="mt-4 flex items-center gap-4 pt-3 border-t border-stone-100">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            post.liked ? "text-red-500" : "text-stone-500 hover:text-red-500"
          }`}
        >
          {liking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`} />
          )}
          <span>{post.likes > 0 ? post.likes : ""}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-iraq-gold transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments > 0 ? post.comments : ""}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          {/* Existing comments */}
          {post.recentComments.length > 0 && (
            <div className="space-y-2 mb-3">
              {post.recentComments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-xs font-semibold text-iraq-navy shrink-0">
                    {c.authorName}:
                  </span>
                  <span className="text-sm text-stone-600">{c.content}</span>
                </div>
              ))}
              {post.comments > 3 && (
                <p className="text-xs text-iraq-stone">+{post.comments - 3} more comments</p>
              )}
            </div>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 h-9 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-iraq-gold"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Post"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}