import { Gauge, Quote } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SampleDataControls } from "@/components/SampleDataControls";
import { Badge, categoryTone } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/db";
import { getActiveWorkspace } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const workspace = await getActiveWorkspace();
  const metrics = workspace
    ? await prisma.extractedMetric.findMany({
        where: { workspaceId: workspace.id },
        include: { sourceFile: true },
        orderBy: [{ category: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const categories = Array.from(new Set(metrics.map((m) => m.category)));

  return (
    <AppShell>
      <PageHeader
        title="Extracted metrics"
        description="Deterministic, rule-based extraction. Every value carries the file, location, evidence, and a confidence score."
        actions={<SampleDataControls />}
      />

      {metrics.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-6 w-6" />}
          title="No metrics extracted"
          description="Load the BrightPath demo data or upload source files. MissionBrief will extract metrics with traceable citations."
          action={<SampleDataControls />}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">
              {metrics.length} metrics across {categories.length} categories:
            </span>
            {categories.map((c) => (
              <Badge key={c} tone={categoryTone(c)}>
                {c}
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.map((m) => (
                  <tr key={m.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{m.metricName}</p>
                      <p className="mt-0.5 text-xs italic text-slate-400">
                        {m.evidence}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {m.metricValue}
                      {m.unit && (
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          {m.unit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={categoryTone(m.category)}>{m.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-50 px-1.5 py-0.5 text-xs text-brand-700 ring-1 ring-slate-200">
                        {m.sourceFile.filename}
                      </code>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Quote className="h-3 w-3 shrink-0" /> {m.sourceLocation}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBar value={m.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
