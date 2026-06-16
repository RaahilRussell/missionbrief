import type { MetricRecord } from "@/lib/extraction/citationBuilder";
import { polishNarrative } from "@/lib/ai/llmClient";
import { assemble } from "./assemble";
import {
  makeContext,
  grantGoals,
  activitiesCompleted,
  outcomes,
  budgetUsage,
  varianceExplanation,
  nextSteps,
  missingDataSection,
  executiveSummary,
} from "./sections";
import type { GeneratedReport } from "./types";

export async function generateGrantReport(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): Promise<GeneratedReport> {
  const ctx = makeContext(workspaceName, periodLabel, tone, metrics);

  const summaryDraft = executiveSummary(ctx);
  const polished = await polishNarrative(summaryDraft, tone);

  const sections = [
    {
      heading: "Reporting Period",
      body: `This report covers **${periodLabel}** for ${workspaceName}.\n\n${polished.text}`,
    },
    { heading: "Grant Goals", body: grantGoals(ctx) },
    { heading: "Activities Completed", body: activitiesCompleted(ctx) },
    { heading: "Outcomes", body: outcomes(ctx, metrics) },
    { heading: "Budget Usage", body: budgetUsage(ctx) },
    { heading: "Variance Explanation", body: varianceExplanation(ctx) },
    { heading: "Next Steps", body: nextSteps() },
    { heading: "Missing Data", body: missingDataSection(ctx) },
  ];

  const title = `${workspaceName} — Grant Progress Update`;
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
