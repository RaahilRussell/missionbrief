import { prisma } from "@/lib/db";
import { toMarkdownDocument, toSlug } from "@/lib/reports/markdownExporter";

// Markdown download for a generated report.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return new Response("Report not found", { status: 404 });
  }
  const markdown = toMarkdownDocument(report.contentMarkdown, {
    generatedAt: report.createdAt,
  });
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${toSlug(report.title)}.md"`,
    },
  });
}
