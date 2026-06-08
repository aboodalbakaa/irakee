import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// POST /api/upload/cover — Upload cover photo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("http://localhost:3001/upload", { method: "POST", body: fd });
    if (!res.ok) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    const data = await res.json();
    const url = `https://153.92.210.54/files/${data.filename || data.name}`;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.profile.update({
      where: { userId: user.id },
      data: { coverUrl: url },
    });

    return NextResponse.json({ coverUrl: url, success: true });
  } catch (err) {
    console.error("[cover upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}