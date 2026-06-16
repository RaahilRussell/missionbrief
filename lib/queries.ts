import { prisma } from "@/lib/db";
import { parseMarkdownTable } from "@/lib/parsers";
import { toNumber } from "@/lib/format";
import type { MetricRecord } from "@/lib/extraction/citationBuilder";
import type { ParsedFile } from "@/lib/types";

export async function getActiveWorkspace() {
  return prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function toMetricRecords(workspaceId: string): Promise<MetricRecord[]> {
  const metrics = await prisma.extractedMetric.findMany({
    where: { workspaceId },
    include: { sourceFile: true },
    orderBy: { createdAt: "asc" },
  });
  return metrics.map((m) => ({
    metricName: m.metricName,
    metricValue: m.metricValue,
    numericValue: m.numericValue,
    unit: m.unit,
    category: m.category,
    sourceFileName: m.sourceFile.filename,
    sourceLocation: m.sourceLocation,
    evidence: m.evidence,
    confidence: m.confidence,
  }));
}

export interface AttendancePoint {
  date: string;
  attendees: number;
}

export interface BudgetLine {
  label: string;
  budgeted: number;
  spent: number;
}

export interface MilestoneStatus {
  status: string;
  count: number;
}

export interface DashboardData {
  workspace: { id: string; name: string; description: string } | null;
  fileCount: number;
  metricCount: number;
  reportCount: number;
  missingDataCount: number;
  recentReports: {
    id: string;
    title: string;
    reportType: string;
    createdAt: Date;
    citationCount: number;
  }[];
  headlineMetrics: { name: string; value: string; source: string }[];
  attendance: AttendancePoint[];
  budget: { spent: number; remaining: number; total: number };
  milestones: MilestoneStatus[];
}

function parsed(file: { parsedJson: string }): ParsedFile {
  return JSON.parse(file.parsedJson) as ParsedFile;
}

export async function getDashboardData(): Promise<DashboardData> {
  const workspace = await getActiveWorkspace();
  if (!workspace) {
    return {
      workspace: null,
      fileCount: 0,
      metricCount: 0,
      reportCount: 0,
      missingDataCount: 0,
      recentReports: [],
      headlineMetrics: [],
      attendance: [],
      budget: { spent: 0, remaining: 0, total: 0 },
      milestones: [],
    };
  }

  const [files, metrics, reports] = await Promise.all([
    prisma.sourceFile.findMany({ where: { workspaceId: workspace.id } }),
    prisma.extractedMetric.findMany({
      where: { workspaceId: workspace.id },
      include: { sourceFile: true },
    }),
    prisma.report.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { citations: true } } },
      take: 5,
    }),
  ]);

  const metricByName = new Map(metrics.map((m) => [m.metricName, m]));
  const headlineNames = [
    "Unique youth served",
    "Average session attendance",
    "Grant utilization",
    "Total funds raised",
  ];
  const headlineMetrics = headlineNames
    .map((name) => metricByName.get(name))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({
      name: m.metricName,
      value: m.metricValue,
      source: m.sourceFile.filename,
    }));

  // Attendance over time, aggregated by date.
  const attendanceFile = files.find((f) => f.category === "attendance");
  let attendance: AttendancePoint[] = [];
  if (attendanceFile) {
    const rows = parsed(attendanceFile).rows;
    const byDate = new Map<string, number>();
    for (const r of rows) {
      const date = r["session_date"] ?? r["date"] ?? "";
      const att = toNumber(r["attendees"] ?? r["present"] ?? "") ?? 0;
      byDate.set(date, (byDate.get(date) ?? 0) + att);
    }
    attendance = Array.from(byDate.entries())
      .map(([date, attendees]) => ({ date, attendees }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Budget used vs remaining.
  const totalBudget = metricByName.get("Total budget")?.numericValue ?? 0;
  const totalSpent = metricByName.get("Total spent")?.numericValue ?? 0;
  const budget = {
    total: totalBudget,
    spent: totalSpent,
    remaining: Math.max(totalBudget - totalSpent, 0),
  };

  // Grant milestone status breakdown.
  const grantFile = files.find((f) => f.category === "grant");
  let milestones: MilestoneStatus[] = [];
  if (grantFile) {
    const section = parsed(grantFile).sections.find((s) => /milestone/i.test(s.heading));
    if (section) {
      const { rows } = parseMarkdownTable(section.content);
      const statusKey = rows[0]
        ? Object.keys(rows[0]).find((k) => /status/i.test(k))
        : undefined;
      if (statusKey) {
        const counts = new Map<string, number>();
        for (const r of rows) {
          const s = r[statusKey] || "Unknown";
          counts.set(s, (counts.get(s) ?? 0) + 1);
        }
        milestones = Array.from(counts.entries()).map(([status, count]) => ({
          status,
          count,
        }));
      }
    }
  }

  const missingDataCount = metrics.filter((m) => m.category === "Risk").length;

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
    },
    fileCount: files.length,
    metricCount: metrics.length,
    reportCount: await prisma.report.count({ where: { workspaceId: workspace.id } }),
    missingDataCount,
    recentReports: reports.map((r) => ({
      id: r.id,
      title: r.title,
      reportType: r.reportType,
      createdAt: r.createdAt,
      citationCount: r._count.citations,
    })),
    headlineMetrics,
    attendance,
    budget,
    milestones,
  };
}
