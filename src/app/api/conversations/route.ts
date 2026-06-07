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

// GET /api/conversations — List user's conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ conversations: [] });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ conversations: [] });

    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, image: true, profile: { select: { displayName: true, avatarUrl: true } } },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { sender: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    const formatted = participants
      .filter((p) => p.conversation.messages.length > 0)
      .map((p) => {
        const other = p.conversation.participants.find((pp) => pp.userId !== user.id);
        const lastMsg = p.conversation.messages[0];
        const unread = p.conversation.messages.some(
          (m) => m.senderId !== user.id && (!p.lastReadAt || new Date(m.createdAt) > new Date(p.lastReadAt))
        );
        return {
          id: p.conversation.id,
          otherUser: other
            ? {
                id: other.user.id,
                name: other.user.profile?.displayName || other.user.name || "Anonymous",
                avatarUrl: other.user.profile?.avatarUrl || other.user.image,
              }
            : null,
          lastMessage: lastMsg
            ? {
                content: lastMsg.content.substring(0, 100),
                senderName: lastMsg.sender.name || "Unknown",
                createdAt: lastMsg.createdAt.toISOString(),
              }
            : null,
          unread,
          updatedAt: p.conversation.updatedAt.toISOString(),
        };
      });

    return NextResponse.json({ conversations: formatted });
  } catch (err) {
    appendError("[conversations GET]", err);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}

// POST /api/conversations — Create or get existing conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { participantId } = await req.json();
    if (!participantId || participantId === user.id) {
      return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ id: existing.id, existing: true });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: user.id },
            { userId: participantId },
          ],
        },
      },
    });

    return NextResponse.json({ id: conversation.id, existing: false }, { status: 201 });
  } catch (err) {
    appendError("[conversations POST]", err);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}