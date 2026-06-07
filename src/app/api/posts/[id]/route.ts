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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (post.authorId !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    appendError("[post DELETE]", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}