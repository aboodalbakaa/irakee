"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream px-4">
        <div className="max-w-md text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-iraq-gold/40 mb-4" />
          <h1 className="text-2xl font-bold text-iraq-navy mb-2">Messages</h1>
          <p className="text-iraq-stone mb-6">Sign in to view your conversations</p>
          <Link href="/auth">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-iraq-navy sm:text-3xl">Messages</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-iraq-gold" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border border-iraq-gold/20 bg-white p-12 text-center card-premium">
            <MessageCircle className="mx-auto h-12 w-12 text-iraq-gold/30" />
            <h3 className="mt-4 text-lg font-semibold text-iraq-navy">No conversations yet</h3>
            <p className="mt-1 text-sm text-iraq-stone">
              Visit someone's profile and click "Contact" to start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className="flex items-center gap-4 rounded-xl border border-iraq-gold/10 bg-white p-4 hover:border-iraq-gold/30 hover:shadow-sm transition-all card-premium"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-iraq-gold/20 text-lg font-bold text-iraq-navy">
                  {conv.otherUser?.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${conv.unread ? "text-iraq-navy" : "text-stone-700"}`}>
                      {conv.otherUser?.name || "Unknown"}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-stone-400">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className={`mt-0.5 text-sm truncate ${conv.unread ? "font-medium text-iraq-navy" : "text-stone-500"}`}>
                      {conv.lastMessage.senderName}: {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.unread && (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-iraq-gold" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}