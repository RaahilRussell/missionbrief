import Link from "next/link";
import {
  FileSpreadsheet,
  Gauge,
  FileText,
  AlertTriangle,
  ArrowRight,
  Database,
  Quote,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SampleDataControls } from "@/components/SampleDataControls";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { MilestoneBars } from "@/components/dashboard/MilestoneBars";
import { getDashboardData } from "@/lib/queries";
import { getReportType } from "@/lib/reports/types";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.workspace) {
    return (
      <AppShell>
        <PageHeader
          title="Dashboard"
          description="Load the BrightPath demo data to populate the workspace."
        />
        <EmptyState
          icon={<Database className="h-6 w-6" />}
          title="No workspace loaded"
          description="MissionBrief starts empty. Load the fictional BrightPath Youth Center dataset to explore source-backed metrics and reports."
          action={<SampleDataControls />}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={data.workspace.name}
        description={data.workspace.description}
        actions={<SampleDataControls />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Source files"
          value={data.fileCount}
          icon={<FileSpreadsheet className="h-5 w-5" />}
          hint="Parsed into rows & sections"
        />
        <StatCard
          label="Metrics extracted"
          value={data.metricCount}
          accent="emerald"
          icon={<Gauge className="h-5 w-5" />}
          hint="Each with a source citation"
        />
        <StatCard
          label="Reports generated"
          value={data.reportCount}
          accent="sky"
          icon={<FileText className="h-5 w-5" />}
          hint="Board packets & grant updates"
        />
        <StatCard
          label="Risk flags"
          value={data.missingDataCount}
          accent="amber"
          icon={<AlertTriangle className="h-5 w-5" />}
          hint="From program notes"
        />
      </div>

      {data.headlineMetrics.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.headlineMetrics.map((m) => (
            <Card key={m.name}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {m.name}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {m.value}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Quote className="h-3 w-3" /> {m.source}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Program attendance"
            subtitle="Attendees per session over the reporting period"
          />
          <AttendanceChart data={data.attendance} />
        </Card>
        <Card>
          <CardHeader
            title="Budget utilization"
            subtitle="Spent vs. remaining across all line items"
          />
          <BudgetDonut
            spent={data.budget.spent}
            remaining={data.budget.remaining}
            total={data.budget.total}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Grant milestones"
            subtitle="Status breakdown from the grant agreement"
          />
          <MilestoneBars data={data.milestones} />
        </Card>
        <Card>
          <CardHeader
            title="Recent reports"
            subtitle="Latest generated documents"
            action={
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                New report <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          {data.recentReports.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No reports yet. Generate your first board packet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentReports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/reports/${r.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(r.createdAt)} · {r.citationCount} citations
                      </p>
                    </div>
                    <Badge tone="brand">
                      {getReportType(r.reportType)?.name ?? r.reportType}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
