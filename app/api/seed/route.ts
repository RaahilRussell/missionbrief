import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadSampleWorkspace } from "@/lib/loadWorkspace";

// Loads (or reloads) the BrightPath sample workspace. Backs the
// "Load Sample Data" button so the demo can be reset from the UI.
export async function POST() {
  try {
    const result = await loadSampleWorkspace(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("seed failed", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load sample data." },
      { status: 500 },
    );
  }
}
