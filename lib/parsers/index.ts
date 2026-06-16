import type { FileCategory, FileType, ParsedFile } from "@/lib/types";
import { parseCsv } from "./csvParser";
import { parseMarkdown } from "./markdownParser";
import { parseText } from "./textParser";
import { parseJson } from "./jsonParser";

export { parseCsv, parseMarkdown, parseText, parseJson };
export { parseMarkdownTable } from "./markdownParser";

const EXTENSION_TYPE: Record<string, FileType> = {
  csv: "csv",
  md: "markdown",
  markdown: "markdown",
  txt: "text",
  text: "text",
  json: "json",
};

export function detectFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPE[ext] ?? "text";
}

export function parseFile(filename: string, raw: string): ParsedFile {
  switch (detectFileType(filename)) {
    case "csv":
      return parseCsv(raw);
    case "markdown":
      return parseMarkdown(raw);
    case "json":
      return parseJson(raw);
    default:
      return parseText(raw);
  }
}

/**
 * Infer a file's role from its name. The role decides which extraction rules
 * run, so we keep the matching deliberately conservative and explainable.
 */
export function detectCategory(filename: string): FileCategory {
  const name = filename.toLowerCase();
  if (name.includes("attendance")) return "attendance";
  if (name.includes("budget") || name.includes("finance")) return "budget";
  if (name.includes("donor") || name.includes("fundrais")) return "donors";
  if (name.includes("outcome") || name.includes("impact") || name.includes("metric"))
    return "outcomes";
  if (name.includes("grant") || name.includes("agreement")) return "grant";
  if (name.includes("note")) return "notes";
  if (name.includes("board") || name.includes("packet") || name.includes("report"))
    return "report";
  return "generic";
}

export const CATEGORY_LABELS: Record<FileCategory, string> = {
  attendance: "Program Attendance",
  budget: "Budget & Finance",
  donors: "Donors & Fundraising",
  outcomes: "Outcome Metrics",
  grant: "Grant Agreement",
  notes: "Program Notes",
  report: "Prior Report",
  generic: "General Document",
};
