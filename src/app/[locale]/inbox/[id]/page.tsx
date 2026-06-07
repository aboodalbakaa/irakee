"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

export default function ConversationPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [conversation, setConversation] = React.useState<any>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const convId = params.id as string;

  React.useEffect(() => {
    if (!convId || status !== "authenticated") return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${convId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [convId, status]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch {}
    setSending(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  const userId = (session as any)?.user?.id;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-iraq-cream">
      {/* Header */}
      <div className="border-b border-iraq-gold/10 bg-white px-4 py-3">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1 text-sm text-iraq-stone hover:text-iraq-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inbox
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-iraq-stone">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? "bg-iraq-navy text-white rounded-br-md"
                        : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-stone-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 bg-white px-4 py-3">
        <form onSubmit={handleSend} className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            className="flex-1 h-11 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-iraq-gold"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={sending || !newMessage.trim()}
            className="h-11 min-w-[44px]"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}