import type { ParsedFile, ParsedSection } from "@/lib/types";

/**
 * Splits markdown into sections by heading (#, ##, ###). The text before the
 * first heading is captured under a synthetic "Preamble" section so nothing is lost.
 */
export function parseMarkdown(raw: string): ParsedFile {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];

  let current: ParsedSection | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (current) {
      current.content = buffer.join("\n").trim();
      sections.push(current);
    }
    buffer.length = 0;
  };

  lines.forEach((line, idx) => {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flush();
      current = { heading: headingMatch[2].trim(), line: idx + 1, content: "" };
    } else {
      if (!current) {
        current = { heading: "Preamble", line: 1, content: "" };
      }
      buffer.push(line);
    }
  });
  flush();

  return {
    rows: [],
    headers: [],
    sections,
    lineCount: lines.filter((l) => l.trim().length > 0).length,
  };
}

/** Parse a GitHub-flavoured markdown table into row objects. */
export function parseMarkdownTable(
  block: string,
): { headers: string[]; rows: Record<string, string>[] } {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (lines.length < 2) return { headers: [], rows: [] };

  const toCells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const headers = toCells(lines[0]);
  const rows: Record<string, string>[] = [];

  // lines[1] is the separator row (---). Data starts at index 2.
  for (let i = 2; i < lines.length; i++) {
    const cells = toCells(lines[i]);
    if (cells.every((c) => c === "" || /^-+$/.test(c))) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = cells[idx] ?? ""));
    rows.push(row);
  }

  return { headers, rows };
}
