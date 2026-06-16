import { Sparkles, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ReportForm } from "@/components/reports/ReportForm";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { getActiveWorkspace } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const workspace = await getActiveWorkspace();
  const metricCount = workspace
    ? await prisma.extractedMetric.count({ where: { workspaceId: workspace.id } })
    : 0;

  return (
    <AppShell>
      <PageHeader
        title="Generate a report"
        description="Pick a report type, period, and tone. Every number is pulled from extracted metrics and cited."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <ReportForm hasData={metricCount > 0} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Numbers stay deterministic
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Metrics come from rule-based extraction, not the language
                  model. The optional LLM only smooths prose — it never invents
                  or alters a figure.
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {metricCount} metrics available
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {metricCount > 0
                    ? "Each claim in the generated report links to its source file and row in the citation appendix."
                    : "Load demo data or upload files first — the generator needs source-backed metrics to cite."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
