import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveWorkspace, toMetricRecords } from "@/lib/queries";
import { generateReport, getReportType } from "@/lib/reports";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      reportType?: string;
      periodLabel?: string;
      tone?: string;
    };
    const reportType = body.reportType || "board-packet";
    const periodLabel = (body.periodLabel || "May 2026").trim();
    const tone = body.tone || "board-facing";

    if (!getReportType(reportType)) {
      return NextResponse.json(
        { ok: false, error: "Unknown report type." },
        { status: 400 },
      );
    }

    const workspace = await getActiveWorkspace();
    if (!workspace) {
      return NextResponse.json(
        { ok: false, error: "No workspace. Load sample data or upload files first." },
        { status: 400 },
      );
    }

    const metrics = await toMetricRecords(workspace.id);
    const generated = await generateReport({
      reportType,
      workspaceName: workspace.name,
      periodLabel,
      tone,
      metrics,
    });

    const report = await prisma.report.create({
      data: {
        workspaceId: workspace.id,
        reportType,
        title: generated.title,
        periodLabel,
        tone,
        engine: generated.engine,
        contentMarkdown: generated.contentMarkdown,
        citations: {
          create: generated.citations.map((c) => ({
            index: c.index,
            sourceFile: c.sourceFile,
            sourceLocation: c.sourceLocation,
            claimText: c.claimText,
            evidenceSnippet: c.evidenceSnippet,
            confidence: c.confidence,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, id: report.id });
  } catch (err) {
    console.error("generate report failed", err);
    return NextResponse.json(
      { ok: false, error: "Failed to generate report." },
      { status: 500 },
    );
  }
}
