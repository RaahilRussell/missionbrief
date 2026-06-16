import {
  CitationCollector,
  type MetricRecord,
  indexMetrics,
} from "@/lib/extraction/citationBuilder";

/** Shared context passed to every section builder. */
export interface ReportContext {
  workspaceName: string;
  periodLabel: string;
  tone: string;
  idx: Map<string, MetricRecord>;
  cite: CitationCollector;
}

export function makeContext(
  workspaceName: string,
  periodLabel: string,
  tone: string,
  metrics: MetricRecord[],
): ReportContext {
  return {
    workspaceName,
    periodLabel,
    tone,
    idx: indexMetrics(metrics),
    cite: new CitationCollector(),
  };
}

/** Return "value [n]" for a metric, registering its citation. "" if missing. */
function valueCite(ctx: ReportContext, name: string, claim?: string): string {
  const m = ctx.idx.get(name);
  if (!m) return "";
  const marker = ctx.cite.cite(m, claim ?? name);
  return `${m.metricValue} ${marker}`;
}

function has(ctx: ReportContext, name: string): boolean {
  return ctx.idx.has(name);
}

function val(ctx: ReportContext, name: string): string {
  return ctx.idx.get(name)?.metricValue ?? "";
}

// --- Section builders ------------------------------------------------------

export function executiveSummary(ctx: ReportContext): string {
  const sentences: string[] = [];

  if (has(ctx, "Unique youth served")) {
    const youth = valueCite(ctx, "Unique youth served", "Unique youth served");
    const avg = has(ctx, "Average session attendance")
      ? `, averaging ${valueCite(ctx, "Average session attendance", "Average session attendance")} youth per session`
      : "";
    sentences.push(
      `In ${ctx.periodLabel}, ${ctx.workspaceName} served ${youth} unique youth across its programs${avg}.`,
    );
  } else if (has(ctx, "Total program visits")) {
    sentences.push(
      `In ${ctx.periodLabel}, ${ctx.workspaceName} recorded ${valueCite(ctx, "Total program visits", "Total program visits")} program visits across ${valueCite(ctx, "Total program sessions", "Total program sessions")} sessions.`,
    );
  }

  if (has(ctx, "Grant funds spent") && has(ctx, "Total grant award")) {
    sentences.push(
      `The organization has spent ${valueCite(ctx, "Grant funds spent", "Grant funds spent")} of its ${valueCite(ctx, "Total grant award", "Total grant award")} grant${
        has(ctx, "Grant utilization")
          ? ` (${valueCite(ctx, "Grant utilization", "Grant utilization")} utilized)`
          : ""
      }.`,
    );
  }

  if (has(ctx, "Total funds raised")) {
    sentences.push(
      `${valueCite(ctx, "Total funds raised", "Total funds raised")} was raised from ${valueCite(ctx, "Active donors", "Active donors")} active donors.`,
    );
  }

  const riskBits: string[] = [];
  if (has(ctx, "Grant milestones missed")) {
    riskBits.push(
      `${valueCite(ctx, "Grant milestones missed", "Grant milestones missed")} grant milestone(s) needing attention`,
    );
  }
  if (has(ctx, "Open risks & blockers")) {
    riskBits.push(
      `${valueCite(ctx, "Open risks & blockers", "Open risks & blockers")} open risk(s)/blocker(s) flagged by staff`,
    );
  }
  if (riskBits.length > 0) {
    sentences.push(`Leadership is tracking ${riskBits.join(" and ")}.`);
  }

  if (sentences.length === 0) {
    return "_Not enough source data was extracted to summarize this period. Load or upload program files to populate this section._";
  }
  return sentences.join(" ");
}

export function kpiDashboard(ctx: ReportContext): string {
  const order = [
    "Unique youth served",
    "Average session attendance",
    "Total program sessions",
    "Total program visits",
    "Volunteer hours logged",
    "Program completion rate",
    "Mentoring match rate",
    "Total funds raised",
    "Active donors",
    "Grant utilization",
  ];
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const name of order) {
    const m = ctx.idx.get(name);
    if (!m || seen.has(name)) continue;
    seen.add(name);
    const marker = ctx.cite.cite(m, name);
    rows.push(`| ${m.metricName} | ${m.metricValue} | \`${m.sourceFileName}\` ${marker} |`);
  }
  if (rows.length === 0) return "_No KPIs available._";
  return ["| KPI | Value | Source |", "| --- | --- | --- |", ...rows].join("\n");
}

export function programHighlights(ctx: ReportContext): string {
  const items: string[] = [];
  if (has(ctx, "Total program sessions")) {
    items.push(
      `Delivered ${valueCite(ctx, "Total program sessions", "Total program sessions")} program sessions with ${valueCite(ctx, "Total program visits", "Total program visits")} total youth visits.`,
    );
  }
  if (has(ctx, "Average session attendance")) {
    items.push(
      `Averaged ${valueCite(ctx, "Average session attendance", "Average session attendance")} youth per session.`,
    );
  }
  if (has(ctx, "Program completion rate")) {
    items.push(
      `Program completion rate of ${valueCite(ctx, "Program completion rate", "Program completion rate")}.`,
    );
  }
  if (has(ctx, "Mentoring match rate")) {
    items.push(
      `Mentoring match rate of ${valueCite(ctx, "Mentoring match rate", "Mentoring match rate")}.`,
    );
  }
  if (has(ctx, "Volunteer hours logged")) {
    items.push(
      `${valueCite(ctx, "Volunteer hours logged", "Volunteer hours logged")} volunteer hours contributed.`,
    );
  }
  if (items.length === 0) return "_No program activity metrics were extracted._";
  return items.map((i) => `- ${i}`).join("\n");
}

export function financialSnapshot(ctx: ReportContext): string {
  if (!has(ctx, "Total budget")) return "_No budget data was extracted._";
  const lines = [
    `- **Total budget:** ${valueCite(ctx, "Total budget", "Total budget")}`,
    `- **Spent to date:** ${valueCite(ctx, "Total spent", "Total spent")}`,
    `- **Remaining:** ${valueCite(ctx, "Budget remaining", "Budget remaining")}`,
  ];
  if (has(ctx, "Overall budget utilization")) {
    lines.push(
      `- **Utilization:** ${valueCite(ctx, "Overall budget utilization", "Overall budget utilization")}`,
    );
  }
  return lines.join("\n");
}

export function grantStatus(ctx: ReportContext): string {
  if (!has(ctx, "Total grant award") && !has(ctx, "Grant funds spent")) {
    return "_No grant data was extracted._";
  }
  const lines: string[] = [];
  if (has(ctx, "Total grant award")) {
    lines.push(`- **Award:** ${valueCite(ctx, "Total grant award", "Total grant award")}`);
  }
  if (has(ctx, "Grant funds spent")) {
    lines.push(`- **Spent:** ${valueCite(ctx, "Grant funds spent", "Grant funds spent")}`);
    lines.push(`- **Remaining:** ${valueCite(ctx, "Grant funds remaining", "Grant funds remaining")}`);
  }
  if (has(ctx, "Grant utilization")) {
    lines.push(`- **Utilization:** ${valueCite(ctx, "Grant utilization", "Grant utilization")}`);
  }
  if (has(ctx, "Grant milestones completed")) {
    lines.push(
      `- **Milestones:** ${valueCite(ctx, "Grant milestones completed", "Grant milestones completed")} of ${valueCite(ctx, "Grant milestones total", "Grant milestones total")} complete, ${valueCite(ctx, "Grant milestones missed", "Grant milestones missed")} missed.`,
    );
  }
  return lines.join("\n");
}

export function risksBlockers(ctx: ReportContext, metrics: MetricRecord[]): string {
  const items: string[] = [];
  if (has(ctx, "Grant milestones missed") && (ctx.idx.get("Grant milestones missed")?.numericValue ?? 0) > 0) {
    items.push(
      `${valueCite(ctx, "Grant milestones missed", "Grant milestones missed")} grant milestone(s) currently marked missed.`,
    );
  }
  const riskMetric = ctx.idx.get("Open risks & blockers");
  if (riskMetric) {
    const marker = ctx.cite.cite(riskMetric, "Open risks & blockers");
    items.push(
      `${riskMetric.metricValue} open risk(s)/blocker(s) noted by program staff ${marker} — ${riskMetric.evidence}`,
    );
  }
  // Surface any other Risk-category metrics not already covered.
  for (const m of metrics) {
    if (
      m.category === "Risk" &&
      m.metricName !== "Open risks & blockers" &&
      m.metricName !== "Grant milestones missed" &&
      m.metricName !== "Board decisions requested"
    ) {
      const marker = ctx.cite.cite(m, m.metricName);
      items.push(`${m.metricName}: ${m.metricValue} ${marker}`);
    }
  }
  if (items.length === 0) return "_No open risks or blockers were flagged this period._";
  return items.map((i) => `- ${i}`).join("\n");
}

export function boardDecisions(ctx: ReportContext): string {
  const m = ctx.idx.get("Board decisions requested");
  if (!m) {
    return "_No specific board decisions were flagged in the source notes._";
  }
  const marker = ctx.cite.cite(m, "Board decisions requested");
  return `Program staff have flagged ${m.metricValue} item(s) for board decision this period ${marker}. See program notes for the full list of asks.`;
}

// --- Grant-report-specific sections ---------------------------------------

export function grantGoals(ctx: ReportContext): string {
  const lines: string[] = [];
  if (has(ctx, "Total grant award")) {
    lines.push(
      `This grant provides ${valueCite(ctx, "Total grant award", "Total grant award")} toward youth development programming.`,
    );
  }
  if (has(ctx, "Grant milestones total")) {
    lines.push(
      `The agreement defines ${valueCite(ctx, "Grant milestones total", "Grant milestones total")} milestones.`,
    );
  }
  return lines.length > 0 ? lines.join(" ") : "_No grant goals were extracted._";
}

export function activitiesCompleted(ctx: ReportContext): string {
  return programHighlights(ctx);
}

export function outcomes(ctx: ReportContext, metrics: MetricRecord[]): string {
  const rows = metrics
    .filter((m) => m.category === "Outcome")
    .map((m) => {
      const marker = ctx.cite.cite(m, m.metricName);
      return `| ${m.metricName} | ${m.metricValue} | \`${m.sourceFileName}\` ${marker} |`;
    });
  if (rows.length === 0) return "_No outcome metrics were extracted._";
  return ["| Outcome | Result | Source |", "| --- | --- | --- |", ...rows].join("\n");
}

export function budgetUsage(ctx: ReportContext): string {
  return grantStatus(ctx);
}

export function varianceExplanation(ctx: ReportContext): string {
  if (!has(ctx, "Grant utilization")) {
    return "_Insufficient data to compute grant variance._";
  }
  const util = ctx.idx.get("Grant utilization")?.numericValue ?? 0;
  const pacing =
    util >= 90
      ? "ahead of a linear spend pace"
      : util >= 60
        ? "broadly on pace"
        : "behind a linear spend pace";
  return `At ${valueCite(ctx, "Grant utilization", "Grant utilization")} utilization, grant spending is ${pacing} for the reporting period. Remaining funds of ${valueCite(ctx, "Grant funds remaining", "Grant funds remaining")} are committed to programming through the grant term.`;
}

export function nextSteps(): string {
  const steps = [
    "Continue program delivery and outcome tracking for the next reporting period.",
    "Resolve open milestones and address flagged blockers below.",
    "Submit the next scheduled outcomes report to the funder on time.",
  ];
  return steps.map((s) => `- ${s}`).join("\n");
}

// --- Missing-data detection ------------------------------------------------

const EXPECTED_FOR_BOARD = [
  "Unique youth served",
  "Average session attendance",
  "Total budget",
  "Grant funds spent",
  "Total funds raised",
];

export function missingDataWarnings(ctx: ReportContext): string[] {
  const warnings: string[] = [];
  for (const name of EXPECTED_FOR_BOARD) {
    if (!has(ctx, name)) {
      warnings.push(`No metric found for "${name}". Upload the relevant source file to complete this report.`);
    }
  }
  // Qualitative data-quality flag carried from program notes.
  const riskEvidence = ctx.idx.get("Open risks & blockers")?.evidence ?? "";
  if (/data gap|undercount|paper/i.test(riskEvidence)) {
    warnings.push("Source notes flag a possible data-quality gap (some figures logged on paper).");
  }
  return warnings;
}

export function missingDataSection(ctx: ReportContext): string {
  const warnings = missingDataWarnings(ctx);
  if (warnings.length === 0) {
    return "_No missing-data warnings. All expected source files were present._";
  }
  return warnings.map((w) => `- ⚠️ ${w}`).join("\n");
}

export { val };
