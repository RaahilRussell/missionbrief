import {
  FileSpreadsheet,
  FileCode,
  FileJson,
  FileText,
  Files,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SampleDataControls } from "@/components/SampleDataControls";
import { UploadForm } from "@/components/files/UploadForm";
import { DeleteFileButton } from "@/components/files/DeleteFileButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/db";
import { getActiveWorkspace } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/parsers";
import type { FileCategory, FileType } from "@/lib/types";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_ICON: Record<FileType, typeof FileText> = {
  csv: FileSpreadsheet,
  markdown: FileCode,
  json: FileJson,
  text: FileText,
};

export default async function FilesPage() {
  const workspace = await getActiveWorkspace();
  const files = workspace
    ? await prisma.sourceFile.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { metrics: true } } },
      })
    : [];

  return (
    <AppShell>
      <PageHeader
        title="Source files"
        description="Every report traces back to these files. Upload your own or load the demo set."
        actions={<SampleDataControls />}
      />

      <Card className="mb-6">
        <UploadForm />
      </Card>

      {files.length === 0 ? (
        <EmptyState
          icon={<Files className="h-6 w-6" />}
          title="No files yet"
          description="Upload a CSV, Markdown, TXT, or JSON file, or load the BrightPath demo dataset to get started."
          action={<SampleDataControls />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Rows</th>
                <th className="px-4 py-3 text-right font-medium">Metrics</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((f) => {
                const Icon = TYPE_ICON[f.fileType as FileType] ?? FileText;
                return (
                  <tr key={f.id} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                        <code className="text-xs text-slate-700">
                          {f.filename}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="slate">
                        {CATEGORY_LABELS[f.category as FileCategory] ??
                          f.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {f.rowCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {f._count.metrics}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(f.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteFileButton id={f.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
