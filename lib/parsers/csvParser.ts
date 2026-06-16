import type { ParsedFile } from "@/lib/types";

/**
 * Minimal CSV parser that handles quoted fields, escaped quotes (""), and
 * commas inside quotes. Returns rows keyed by header name plus the header order.
 */
export function parseCsv(raw: string): ParsedFile {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const records = splitRecords(text);

  if (records.length === 0) {
    return { rows: [], headers: [], sections: [], lineCount: 0 };
  }

  const headers = records[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < records.length; i++) {
    const fields = records[i];
    // Skip fully empty trailing lines.
    if (fields.length === 1 && fields[0].trim() === "") continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (fields[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return {
    rows,
    headers,
    sections: [],
    lineCount: text.split("\n").filter((l) => l.length > 0).length,
  };
}

/** Split CSV text into records of fields, respecting quotes. */
function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush the final field/record if the file does not end with a newline.
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}
