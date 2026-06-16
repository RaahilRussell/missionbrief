import type { MetricRecord } from "@/lib/extraction/citationBuilder";
import { polishNarrative } from "@/lib/ai/llmClient";
import { generateBoardPacket } from "./boardPacketGenerator";
import { generateGrantReport } from "./grantReportGenerator";
import { assemble } from "./assemble";
import {
  makeContext,
  executiveSummary,
  kpiDashboard,
  risksBlockers,
  grantStatus,
  boardDecisions,
} from "./sections";
import { getReportType, type GeneratedReport } from "./types";

export * from "./types";
export type { GeneratedReport } from "./types";

export interface GenerateReportInput {
  reportType: string;
  workspaceName: string;
  periodLabel: string;
  tone: string;
  metrics: MetricRecord[];
}

export async function generateReport(
  input: GenerateReportInput,
): Promise<GeneratedReport> {
  const { reportType, workspaceName, periodLabel, tone, metrics } = input;

  switch (reportType) {
    case "board-packet":
      return generateBoardPacket(workspaceName, periodLabel, tone, metrics);
    case "grant-report":
      return generateGrantReport(workspaceName, periodLabel, tone, metrics);
    case "executive-summary":
      return generateExecutiveSummary(workspaceName, periodLabel, tone, metrics);
    case "kpi-snapshot":
      return generateKpiSnapshot(workspaceName, periodLabel, tone, metrics);
    case "risk-memo":
      return generateRiskMemo(workspaceName, periodLabel, tone, metrics);
    default:
      // Default to a board packet for unknown types rather than failing.
      return generateBoardPacket(workspaceName, periodLabel, tone, metrics);
  }
}

async function generateExecutiveSummary(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): Promise<GeneratedReport> {
  const ctx = makeContext(workspaceName, periodLabel, tone, metrics);
  const polished = await polishNarrative(executiveSummary(ctx), tone);
  const sections = [
    { heading: "Executive Summary", body: polished.text },
    { heading: "KPI Dashboard", body: kpiDashboard(ctx) },
  ];
  const title = `${workspaceName} — Executive Summary`;
  const meta = [periodLabel, `Tone: ${tone}`, `Engine: ${polished.engineUsed}`];
  return {
    title,
    periodLabel,
    tone,
    engine: polished.engineUsed,
    contentMarkdown: assemble(title, meta, sections, ctx),
    citations: ctx.cite.getCitations(),
  };
}

async function generateKpiSnapshot(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): Promise<GeneratedReport> {
  const ctx = makeContext(workspaceName, periodLabel, tone, metrics);
  const sections = [{ heading: "KPI Dashboard", body: kpiDashboard(ctx) }];
  const title = `${workspaceName} — KPI Snapshot`;
  const meta = [periodLabel, `${ctx.cite.getCitations().length} source citations`];
  return {
    title,
    periodLabel,
    tone,
    engine: "deterministic",
    contentMarkdown: assemble(title, meta, sections, ctx),
    citations: ctx.cite.getCitations(),
  };
}

async function generateRiskMemo(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): Promise<GeneratedReport> {
  const ctx = makeContext(workspaceName, periodLabel, tone, metrics);
  const sections = [
    { heading: "Risks / Blockers", body: risksBlockers(ctx, metrics) },
    { heading: "Grant Status", body: grantStatus(ctx) },
    { heading: "Board Decisions Needed", body: boardDecisions(ctx) },
  ];
  const title = `${workspaceName} — Risk & Needs Memo`;
  const meta = [periodLabel, `${ctx.cite.getCitations().length} source citations`];
  return {
    title,
    periodLabel,
    tone,
    engine: "deterministic",
    contentMarkdown: assemble(title, meta, sections, ctx),
    citations: ctx.cite.getCitations(),
  };
}

export { getReportType };
