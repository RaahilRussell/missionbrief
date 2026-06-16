import type {
  ExtractedMetricInput,
  FileCategory,
  ParsedFile,
} from "@/lib/types";
import { parseMarkdownTable } from "@/lib/parsers";
import { toNumber, formatMoney, formatNumber, formatPercent } from "@/lib/format";

/**
 * Rule-based metric extraction. Each file role has an explicit extractor so
 * every produced number can be traced back to specific rows or sections — no
 * opaque "AI magic". The optional LLM layer only polishes narrative prose; the
 * numbers themselves always come from here.
 */
export function extractMetrics(
  filename: string,
  category: FileCategory,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  switch (category) {
    case "attendance":
      return extractAttendance(filename, parsed);
    case "budget":
      return extractBudget(filename, parsed);
    case "donors":
      return extractDonors(filename, parsed);
    case "outcomes":
      return extractOutcomes(filename, parsed);
    case "grant":
      return extractGrant(filename, parsed);
    case "notes":
      return extractNotes(filename, parsed);
    default:
      return [];
  }
}

// --- helpers ---------------------------------------------------------------

/** Find a header whose name contains any of the given keywords. */
function findColumn(headers: string[], keywords: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function sumColumn(rows: Record<string, string>[], col: string): number {
  return rows.reduce((acc, r) => acc + (toNumber(r[col]) ?? 0), 0);
}

function rowRange(count: number): string {
  // CSV data starts at row 2 (row 1 is the header). The filename is tracked
  // separately on the metric record, so locations stay file-relative.
  return count > 0 ? `rows 2-${count + 1}` : "whole file";
}

// --- extractors ------------------------------------------------------------

function extractAttendance(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const { rows, headers } = parsed;
  if (rows.length === 0) return [];

  const attendeesCol = findColumn(headers, ["attendee", "present", "youth", "count"]);
  const hoursCol = findColumn(headers, ["volunteer_hour", "hours"]);
  const range = rowRange(rows.length);
  const metrics: ExtractedMetricInput[] = [];

  metrics.push({
    metricName: "Total program sessions",
    metricValue: formatNumber(rows.length),
    numericValue: rows.length,
    unit: "sessions",
    category: "Program Activity",
    sourceLocation: range,
    evidence: `${rows.length} session rows recorded in ${filename}.`,
    confidence: 0.97,
  });

  if (attendeesCol) {
    const total = sumColumn(rows, attendeesCol);
    const avg = Math.round(total / rows.length);
    metrics.push({
      metricName: "Total program visits",
      metricValue: formatNumber(total),
      numericValue: total,
      unit: "visits",
      category: "Program Activity",
      sourceLocation: range,
      evidence: `Sum of "${attendeesCol}" across ${rows.length} sessions.`,
      confidence: 0.95,
    });
    metrics.push({
      metricName: "Average session attendance",
      metricValue: formatNumber(avg),
      numericValue: avg,
      unit: "youth/session",
      category: "Program Activity",
      sourceLocation: range,
      evidence: `Mean of "${attendeesCol}" (${formatNumber(total)} ÷ ${rows.length}).`,
      confidence: 0.92,
    });
  }

  if (hoursCol) {
    const total = sumColumn(rows, hoursCol);
    metrics.push({
      metricName: "Volunteer hours logged",
      metricValue: formatNumber(total),
      numericValue: total,
      unit: "hours",
      category: "Program Activity",
      sourceLocation: range,
      evidence: `Sum of "${hoursCol}" across ${rows.length} sessions.`,
      confidence: 0.9,
    });
  }

  return metrics;
}

function extractBudget(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const { rows, headers } = parsed;
  if (rows.length === 0) return [];

  const budgetCol = findColumn(headers, ["budget", "planned", "allocated"]);
  const spentCol = findColumn(headers, ["spent", "actual", "used"]);
  const itemCol = findColumn(headers, ["line_item", "item", "name", "category"]);
  const fundingCol = findColumn(headers, ["funding", "source", "grant"]);
  const metrics: ExtractedMetricInput[] = [];
  const range = rowRange(rows.length);

  if (budgetCol && spentCol) {
    const totalBudget = sumColumn(rows, budgetCol);
    const totalSpent = sumColumn(rows, spentCol);
    const remaining = totalBudget - totalSpent;
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    metrics.push(
      {
        metricName: "Total budget",
        metricValue: formatMoney(totalBudget),
        numericValue: totalBudget,
        unit: "USD",
        category: "Financial",
        sourceLocation: range,
        evidence: `Sum of "${budgetCol}" across ${rows.length} line items.`,
        confidence: 0.97,
      },
      {
        metricName: "Total spent",
        metricValue: formatMoney(totalSpent),
        numericValue: totalSpent,
        unit: "USD",
        category: "Financial",
        sourceLocation: range,
        evidence: `Sum of "${spentCol}" across ${rows.length} line items.`,
        confidence: 0.97,
      },
      {
        metricName: "Budget remaining",
        metricValue: formatMoney(remaining),
        numericValue: remaining,
        unit: "USD",
        category: "Financial",
        sourceLocation: range,
        evidence: `${formatMoney(totalBudget)} budgeted − ${formatMoney(totalSpent)} spent.`,
        confidence: 0.96,
      },
      {
        metricName: "Overall budget utilization",
        metricValue: formatPercent(utilization, 1),
        numericValue: Math.round(utilization * 10) / 10,
        unit: "percent",
        category: "Financial",
        sourceLocation: range,
        evidence: `${formatMoney(totalSpent)} ÷ ${formatMoney(totalBudget)}.`,
        confidence: 0.94,
      },
    );

    // Grant-specific line. Prefer a row flagged as grant-funded, else the
    // youth-development line.
    const grantIdx = rows.findIndex((r) => {
      const funding = (fundingCol && r[fundingCol]) || "";
      const item = (itemCol && r[itemCol]) || "";
      return (
        /grant/i.test(funding) ||
        /youth development/i.test(item) ||
        /youth development/i.test(funding)
      );
    });

    if (grantIdx !== -1) {
      const r = rows[grantIdx];
      const gBudget = toNumber(r[budgetCol]) ?? 0;
      const gSpent = toNumber(r[spentCol]) ?? 0;
      const gRemaining = gBudget - gSpent;
      const gUtil = gBudget > 0 ? (gSpent / gBudget) * 100 : 0;
      const itemName = (itemCol && r[itemCol]) || "Grant-funded program";
      const loc = `row ${grantIdx + 2}`;

      metrics.push(
        {
          metricName: "Grant funds spent",
          metricValue: formatMoney(gSpent),
          numericValue: gSpent,
          unit: "USD",
          category: "Grant",
          sourceLocation: loc,
          evidence: `${itemName}: ${formatMoney(gSpent)} spent of ${formatMoney(gBudget)} budgeted.`,
          confidence: 0.95,
        },
        {
          metricName: "Grant funds remaining",
          metricValue: formatMoney(gRemaining),
          numericValue: gRemaining,
          unit: "USD",
          category: "Grant",
          sourceLocation: loc,
          evidence: `${formatMoney(gBudget)} grant − ${formatMoney(gSpent)} spent.`,
          confidence: 0.95,
        },
        {
          metricName: "Grant utilization",
          metricValue: formatPercent(gUtil, 1),
          numericValue: Math.round(gUtil * 10) / 10,
          unit: "percent",
          category: "Grant",
          sourceLocation: loc,
          evidence: `${formatMoney(gSpent)} ÷ ${formatMoney(gBudget)} (${itemName}).`,
          confidence: 0.93,
        },
      );
    }
  }

  return metrics;
}

function extractDonors(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const { rows, headers } = parsed;
  if (rows.length === 0) return [];

  const amountCol = findColumn(headers, ["amount", "gift", "donation", "value"]);
  const recurringCol = findColumn(headers, ["recurring", "monthly", "repeat"]);
  const range = rowRange(rows.length);
  const metrics: ExtractedMetricInput[] = [];

  metrics.push({
    metricName: "Active donors",
    metricValue: formatNumber(rows.length),
    numericValue: rows.length,
    unit: "donors",
    category: "Fundraising",
    sourceLocation: range,
    evidence: `${rows.length} donor records in ${filename}.`,
    confidence: 0.96,
  });

  if (amountCol) {
    const total = sumColumn(rows, amountCol);
    metrics.push({
      metricName: "Total funds raised",
      metricValue: formatMoney(total),
      numericValue: total,
      unit: "USD",
      category: "Fundraising",
      sourceLocation: range,
      evidence: `Sum of "${amountCol}" across ${rows.length} donations.`,
      confidence: 0.95,
    });
  }

  if (recurringCol) {
    const recurring = rows.filter((r) =>
      /^(yes|y|true|1)$/i.test((r[recurringCol] ?? "").trim()),
    ).length;
    metrics.push({
      metricName: "Recurring donors",
      metricValue: formatNumber(recurring),
      numericValue: recurring,
      unit: "donors",
      category: "Fundraising",
      sourceLocation: range,
      evidence: `${recurring} of ${rows.length} donors marked recurring.`,
      confidence: 0.9,
    });
  }

  return metrics;
}

function extractOutcomes(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const { rows, headers } = parsed;
  if (rows.length === 0) return [];

  const metricCol = findColumn(headers, ["metric", "name", "outcome", "indicator"]);
  const valueCol = findColumn(headers, ["value", "result", "number"]);
  const unitCol = findColumn(headers, ["unit", "measure"]);
  const noteCol = findColumn(headers, ["note", "detail", "description"]);
  if (!metricCol || !valueCol) return [];

  return rows.map((r, idx) => {
    const name = r[metricCol];
    const rawValue = r[valueCol];
    const numeric = toNumber(rawValue);
    const unit = (unitCol && r[unitCol]) || "";
    const display =
      unit === "percent" && numeric !== null
        ? formatPercent(numeric)
        : numeric !== null
          ? formatNumber(numeric)
          : rawValue;
    return {
      metricName: name,
      metricValue: display,
      numericValue: numeric,
      unit: unit || "count",
      category: "Outcome",
      sourceLocation: `row ${idx + 2}`,
      evidence: (noteCol && r[noteCol]) || `Reported outcome: ${name} = ${display}.`,
      confidence: 0.9,
    } satisfies ExtractedMetricInput;
  });
}

function extractGrant(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const metrics: ExtractedMetricInput[] = [];
  const sections = parsed.sections;

  // Grant amount: the section whose content names the grant amount / award.
  const amountSection = sections.find((s) =>
    /grant amount|total award|award:/i.test(s.content),
  );
  const amountLine = amountSection?.content
    .split("\n")
    .find((l) => /grant amount|total award|award:/i.test(l));
  const amountMatch = (amountLine ?? amountSection?.content ?? "").match(/\$\s?([\d,]+)/);
  if (amountSection && amountMatch) {
    const value = toNumber(amountMatch[1]);
    if (value !== null) {
      // Approximate the amount's absolute line: heading line + offset in content.
      const offset = amountLine
        ? amountSection.content.split("\n").indexOf(amountLine)
        : -1;
      const line = offset >= 0 ? amountSection.line + 1 + offset : amountSection.line;
      metrics.push({
        metricName: "Total grant award",
        metricValue: formatMoney(value),
        numericValue: value,
        unit: "USD",
        category: "Grant",
        sourceLocation: `${amountSection.heading} (line ${line})`,
        evidence: (amountLine ?? `Grant amount ${formatMoney(value)}`).trim(),
        confidence: 0.9,
      });
    }
  }

  // Milestones table.
  const milestoneSection = sections.find((s) => /milestone/i.test(s.heading));
  if (milestoneSection) {
    const { rows } = parseMarkdownTable(milestoneSection.content);
    const statusKey =
      rows.length > 0
        ? Object.keys(rows[0]).find((k) => /status/i.test(k)) ?? null
        : null;
    if (statusKey) {
      const statuses = rows.map((r) => r[statusKey].toLowerCase());
      const completed = statuses.filter((s) => s.includes("complete")).length;
      const missed = statuses.filter((s) => s.includes("miss")).length;
      const loc = `Milestones table (line ${milestoneSection.line})`;

      metrics.push(
        {
          metricName: "Grant milestones total",
          metricValue: formatNumber(rows.length),
          numericValue: rows.length,
          unit: "milestones",
          category: "Grant",
          sourceLocation: loc,
          evidence: `${rows.length} milestones defined in the grant agreement.`,
          confidence: 0.9,
        },
        {
          metricName: "Grant milestones completed",
          metricValue: formatNumber(completed),
          numericValue: completed,
          unit: "milestones",
          category: "Grant",
          sourceLocation: loc,
          evidence: `${completed} of ${rows.length} milestones marked complete.`,
          confidence: 0.88,
        },
        {
          metricName: "Grant milestones missed",
          metricValue: formatNumber(missed),
          numericValue: missed,
          unit: "milestones",
          category: "Risk",
          sourceLocation: loc,
          evidence:
            missed > 0
              ? `${missed} milestone(s) marked missed in the agreement.`
              : "No milestones currently marked missed.",
          confidence: 0.85,
        },
      );
    }
  }

  return metrics;
}

function extractNotes(
  filename: string,
  parsed: ParsedFile,
): ExtractedMetricInput[] {
  const metrics: ExtractedMetricInput[] = [];

  const countBullets = (content: string) =>
    content.split("\n").filter((l) => /^\s*[-*]\s+/.test(l));

  const riskSection = parsed.sections.find((s) =>
    /risk|blocker|challenge/i.test(s.heading),
  );
  if (riskSection) {
    const bullets = countBullets(riskSection.content);
    const first = bullets[0]?.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "") ?? "";
    metrics.push({
      metricName: "Open risks & blockers",
      metricValue: String(bullets.length),
      numericValue: bullets.length,
      unit: "items",
      category: "Risk",
      sourceLocation: `${riskSection.heading} (line ${riskSection.line})`,
      evidence: first ? `e.g. ${first.slice(0, 150)}` : "Risks noted by program staff.",
      confidence: 0.8,
    });
  }

  const askSection = parsed.sections.find((s) =>
    /board ask|decision|request/i.test(s.heading),
  );
  if (askSection) {
    const bullets = countBullets(askSection.content);
    metrics.push({
      metricName: "Board decisions requested",
      metricValue: String(bullets.length),
      numericValue: bullets.length,
      unit: "items",
      category: "Risk",
      sourceLocation: `${askSection.heading} (line ${askSection.line})`,
      evidence: "Items staff have flagged for board decision this period.",
      confidence: 0.8,
    });
  }

  return metrics;
}
