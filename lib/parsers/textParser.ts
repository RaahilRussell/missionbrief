import type { ParsedFile } from "@/lib/types";

/** Plain text: treat the whole file as one section. */
export function parseText(raw: string): ParsedFile {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return {
    rows: [],
    headers: [],
    sections: [{ heading: "Document", line: 1, content: text.trim() }],
    lineCount: text.split("\n").filter((l) => l.trim().length > 0).length,
  };
}
