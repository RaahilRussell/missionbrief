import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateWorkspace, ingestFile } from "@/lib/loadWorkspace";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["csv", "md", "markdown", "txt", "text", "json"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No file provided." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File exceeds the 2 MB demo limit." },
        { status: 400 },
      );
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported file type ".${ext}". Use CSV, Markdown, TXT, or JSON.` },
        { status: 400 },
      );
    }

    const raw = await file.text();
    const workspace = await getOrCreateWorkspace(prisma);
    const result = await ingestFile(prisma, workspace.id, file.name, raw);

    return NextResponse.json({
      ok: true,
      filename: file.name,
      metricCount: result.metricCount,
    });
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json(
      { ok: false, error: "Failed to process the uploaded file." },
      { status: 500 },
    );
  }
}
