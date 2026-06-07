import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const DANIYA_UPLOAD = "http://localhost:3001/upload";

// POST /api/upload/post — Upload image for a post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    const daniyaForm = new FormData();
    daniyaForm.append("file", file);

    const daniyaRes = await fetch(DANIYA_UPLOAD, {
      method: "POST",
      body: daniyaForm,
    });

    if (!daniyaRes.ok) {
      return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
    }

    const daniyaData = await daniyaRes.json();
    const url = `https://153.92.210.54/files/${daniyaData.filename || daniyaData.name}`;

    return NextResponse.json({ url, success: true });
  } catch (err) {
    console.error("[post upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}