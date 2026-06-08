import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import fs from "fs";

const ERROR_LOG = "/root/irakee/.server-errors.log";

function logError(msg: string, err: unknown) {
  try {
    const ts = new Date().toISOString();
    const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    fs.appendFileSync(ERROR_LOG, `[${ts}] ${msg}\n${detail}\n---\n`);
  } catch {}
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    logError("[profile GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { displayName, bio, profession, industry, city, country, languages, phone, diasporaStatus, governorate, interests } = body;

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(profession !== undefined && { profession }),
        ...(industry !== undefined && { industry }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(languages !== undefined && { languages: typeof languages === "string" ? languages.split(",").map((l: string) => l.trim()).filter(Boolean) : languages }),
        ...(phone !== undefined && { phone }),
        ...(diasporaStatus !== undefined && { diasporaStatus }),
        ...(governorate !== undefined && { governorate }),
        ...(interests !== undefined && { interests: typeof interests === "string" ? interests.split(",").map((l: string) => l.trim()).filter(Boolean) : interests }),
      },
    });

    if (displayName !== undefined) {
      await prisma.user.update({ where: { id: session.user.id }, data: { name: displayName } });
    }

    return NextResponse.json(profile);
  } catch (err) {
    logError("[profile PUT]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}