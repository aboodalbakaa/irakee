import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const DANIYA_UPLOAD = "http://localhost:3001/upload";

// POST /api/upload/avatar — Upload profile picture via Daniya
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 });
    }

    // Forward to Daniya
    const daniyaForm = new FormData();
    daniyaForm.append("file", file);

    const daniyaRes = await fetch(DANIYA_UPLOAD, {
      method: "POST",
      body: daniyaForm,
    });

    if (!daniyaRes.ok) {
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const daniyaData = await daniyaRes.json();
    const avatarUrl = `https://153.92.210.54/files/${daniyaData.filename || daniyaData.name}`;

    // Update profile
    await prisma.profile.update({
      where: { userId: user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl, success: true });
  } catch (err) {
    console.error("[avatar upload]", err);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}