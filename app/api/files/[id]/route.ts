import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.sourceFile.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete file failed", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete file." },
      { status: 500 },
    );
  }
}
