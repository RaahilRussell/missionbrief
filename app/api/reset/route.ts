import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Clears all workspaces (and cascades to files, metrics, reports).
export async function POST() {
  try {
    await prisma.workspace.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset failed", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reset workspace." },
      { status: 500 },
    );
  }
}
