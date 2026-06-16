import type { ReportContext } from "./sections";

export interface Section {
  heading: string;
  body: string;
}

/** Assemble a report's markdown: header, body sections, and citation appendix. */
export function assemble(
  title: string,
  metaLines: string[],
  sections: Section[],
  ctx: ReportContext,
): string {
  const header = [`# ${title}`, "", `*${metaLines.join(" · ")}*`, ""].join("\n");
  const body = sections
    .map((s) => `## ${s.heading}\n\n${s.body}`)
    .join("\n\n");
  const appendix = `## Appendix: Source Evidence\n\n${ctx.cite.toMarkdownAppendix()}`;
  return `${header}\n${body}\n\n${appendix}\n`;
}
