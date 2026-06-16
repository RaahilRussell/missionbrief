import type { MetricRecord } from "@/lib/extraction/citationBuilder";
import { polishNarrative } from "@/lib/ai/llmClient";
import { assemble } from "./assemble";
import {
  makeContext,
  executiveSummary,
  programHighlights,
  kpiDashboard,
  financialSnapshot,
  grantStatus,
  risksBlockers,
  boardDecisions,
  missingDataSection,
} from "./sections";
import type { GeneratedReport } from "./types";

export async function generateBoardPacket(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): Promise<GeneratedReport> {
  const ctx = makeContext(workspaceName, periodLabel, tone, metrics);

  // Build sections first so all citations are registered before the appendix.
  const summaryDraft = executiveSummary(ctx);
  const polished = await polishNarrative(summaryDraft, tone);

  const sections = [
    { heading: "Executive Summary", body: polished.text },
    { heading: "Program Highlights", body: programHighlights(ctx) },
    { heading: "KPI Dashboard", body: kpiDashboard(ctx) },
    { heading: "Financial Snapshot", body: financialSnapshot(ctx) },
    { heading: "Grant Status", body: grantStatus(ctx) },
    { heading: "Risks / Blockers", body: risksBlockers(ctx, metrics) },
    { heading: "Board Decisions Needed", body: boardDecisions(ctx) },
    { heading: "Missing Data Warnings", body: missingDataSection(ctx) },
  ];

  const title = `${workspaceName} — Monthly Board Packet`;
  const meta = [
    periodLabel,
    `Tone: ${tone}`,
    `Engine: ${polished.engineUsed}`,
    `${ctx.cite.getCitations().length} source citations`,
  ];

  return {
    title,
    periodLabel,
    tone,
    engine: polished.engineUsed,
    contentMarkdown: assemble(title, meta, sections, ctx),
    citations: ctx.cite.getCitations(),
  };
}
