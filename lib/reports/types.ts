import type { CitationRecord } from "@/lib/extraction/citationBuilder";
import type { ReportEngine } from "@/lib/ai/llmClient";

export interface GeneratedReport {
  title: string;
  periodLabel: string;
  tone: string;
  engine: ReportEngine;
  contentMarkdown: string;
  citations: CitationRecord[];
}

export interface ReportTypeDef {
  id: string;
  name: string;
  description: string;
  sections: string[];
}

export const REPORT_TYPES: ReportTypeDef[] = [
  {
    id: "board-packet",
    name: "Monthly Board Packet",
    description:
      "Full board-meeting packet: executive summary, KPIs, finances, grant status, risks, and decisions needed.",
    sections: [
      "Executive Summary",
      "Program Highlights",
      "KPI Dashboard",
      "Financial Snapshot",
      "Grant Status",
      "Risks / Blockers",
      "Board Decisions Needed",
      "Appendix: Source Evidence",
    ],
  },
  {
    id: "grant-report",
    name: "Grant Progress Update",
    description:
      "Funder-ready progress report: goals, activities, outcomes, budget usage, variance, and next steps.",
    sections: [
      "Reporting Period",
      "Grant Goals",
      "Activities Completed",
      "Outcomes",
      "Budget Usage",
      "Variance Explanation",
      "Next Steps",
      "Missing Data",
    ],
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "A one-page narrative summary with the headline KPIs and citations.",
    sections: ["Executive Summary", "KPI Dashboard"],
  },
  {
    id: "kpi-snapshot",
    name: "KPI Snapshot",
    description: "A compact, source-backed KPI table for quick stakeholder updates.",
    sections: ["KPI Dashboard"],
  },
  {
    id: "risk-memo",
    name: "Risk & Needs Memo",
    description: "Focused memo on risks, blockers, grant status, and board decisions needed.",
    sections: ["Risks / Blockers", "Grant Status", "Board Decisions Needed"],
  },
];

export const REPORT_TONES = [
  "board-facing",
  "funder-facing",
  "concise",
  "detailed",
] as const;

export function getReportType(id: string): ReportTypeDef | undefined {
  return REPORT_TYPES.find((r) => r.id === id);
}
