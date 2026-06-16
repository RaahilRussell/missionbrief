import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, Calendar, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CitationSidebar } from "@/components/reports/CitationSidebar";
import { ReportActions } from "@/components/reports/ReportActions";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { getReportType } from "@/lib/reports/types";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const ENGINE_LABEL: Record<string, string> = {
  deterministic: "Deterministic",
  openai: "OpenAI polish",
  ollama: "Ollama polish",
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { citations: { orderBy: { index: "asc" } } },
  });

  if (!report) notFound();

  return (
    <AppShell>
      <div className="no-print mb-6">
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to generator
        </Link>
      </div>

      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {report.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              <FileText className="h-3 w-3" />
              {getReportType(report.reportType)?.name ?? report.reportType}
            </Badge>
            <Badge tone="slate">
              <Calendar className="h-3 w-3" />
              {report.periodLabel}
            </Badge>
            <Badge tone="sky">
              <Cpu className="h-3 w-3" />
              {ENGINE_LABEL[report.engine] ?? report.engine}
            </Badge>
            <span className="text-xs text-slate-400">
              Generated {formatDate(report.createdAt)} · {report.citations.length}{" "}
              citations
            </span>
          </div>
        </div>
        <ReportActions reportId={report.id} contentMarkdown={report.contentMarkdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="print-full card p-7 lg:col-span-2">
          <MarkdownRenderer content={report.contentMarkdown} />
        </article>
        <aside className="no-print lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <CitationSidebar citations={report.citations} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
