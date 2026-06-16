import type { ParsedFile } from "@/lib/types";

/**
 * JSON parser. Arrays of flat objects become tabular rows so the same metric
 * extractors that work on CSV also work on JSON. Other shapes are stored as a
 * single section containing the pretty-printed JSON.
 */
export function parseJson(raw: string): ParsedFile {
  const lineCount = raw.split("\n").filter((l) => l.trim().length > 0).length;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {
      rows: [],
      headers: [],
      sections: [{ heading: "Invalid JSON", line: 1, content: raw.trim() }],
      lineCount,
    };
  }

  // Accept either a top-level array, or { rows: [...] } / { data: [...] }.
  const arrayCandidate = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.rows)
      ? data.rows
      : isRecord(data) && Array.isArray(data.data)
        ? data.data
        : null;

  if (arrayCandidate && arrayCandidate.every(isRecord)) {
    const headers = Array.from(
      arrayCandidate.reduce<Set<string>>((set, item) => {
        Object.keys(item).forEach((k) => set.add(k));
        return set;
      }, new Set()),
    );
    const rows = arrayCandidate.map((item) => {
      const row: Record<string, string> = {};
      headers.forEach((h) => {
        const value = (item as Record<string, unknown>)[h];
        row[h] = value === undefined || value === null ? "" : String(value);
      });
      return row;
    });
    return { rows, headers, sections: [], lineCount };
  }

  return {
    rows: [],
    headers: [],
    sections: [
      { heading: "JSON", line: 1, content: JSON.stringify(data, null, 2) },
    ],
    lineCount,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
