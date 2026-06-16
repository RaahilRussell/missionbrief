// Shared types used across parsing, extraction, and report generation.

export type FileType = "csv" | "markdown" | "text" | "json";

/** Role inferred for a source file. Drives which extraction rules apply. */
export type FileCategory =
  | "attendance"
  | "budget"
  | "donors"
  | "outcomes"
  | "grant"
  | "notes"
  | "report"
  | "generic";

export type MetricCategory =
  | "Program Activity"
  | "Financial"
  | "Grant"
  | "Fundraising"
  | "Outcome"
  | "Risk";

/** Normalised, parser-agnostic representation of a file's contents. */
export interface ParsedFile {
  /** Tabular rows (CSV / JSON arrays). Empty for prose files. */
  rows: Record<string, string>[];
  /** Column order for tabular files. */
  headers: string[];
  /** Markdown / text sections keyed by heading. */
  sections: ParsedSection[];
  /** Raw line count, used for citations. */
  lineCount: number;
}

export interface ParsedSection {
  heading: string;
  /** 1-based line number where the heading appears. */
  line: number;
  content: string;
}

/** A single extracted fact with a traceable origin. */
export interface ExtractedMetricInput {
  metricName: string;
  metricValue: string;
  numericValue: number | null;
  unit: string;
  category: MetricCategory;
  sourceLocation: string;
  evidence: string;
  confidence: number;
}
