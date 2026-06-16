import { promises as fs } from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import {
  detectCategory,
  detectFileType,
  parseFile,
} from "@/lib/parsers";
import { extractMetrics } from "@/lib/extraction/metricExtractor";

export const SAMPLE_WORKSPACE = {
  name: "BrightPath Youth Center",
  description:
    "Demo nonprofit running after-school programs, mentoring, STEM workshops, and family support. Reporting period: May 2026.",
};

const SAMPLE_DIR = path.join(
  process.cwd(),
  "sample-data",
  "brightpath-youth-center",
);

// Order controls how files appear in the UI.
const SAMPLE_FILES = [
  "grant_agreement.md",
  "program_attendance.csv",
  "monthly_budget.csv",
  "donor_snapshot.csv",
  "outcome_metrics.csv",
  "program_notes.md",
  "previous_board_packet.md",
];

export async function readSampleFiles(): Promise<
  { filename: string; raw: string }[]
> {
  const files: { filename: string; raw: string }[] = [];
  for (const filename of SAMPLE_FILES) {
    const raw = await fs.readFile(path.join(SAMPLE_DIR, filename), "utf8");
    files.push({ filename, raw });
  }
  return files;
}

/**
 * Parse + extract a single file and persist it (and its metrics) under a
 * workspace. Shared by the seed script and the upload API route.
 */
export async function ingestFile(
  prisma: PrismaClient,
  workspaceId: string,
  filename: string,
  raw: string,
): Promise<{ sourceFileId: string; metricCount: number }> {
  const fileType = detectFileType(filename);
  const category = detectCategory(filename);
  const parsed = parseFile(filename, raw);

  const sourceFile = await prisma.sourceFile.create({
    data: {
      workspaceId,
      filename,
      fileType,
      category,
      rawText: raw,
      parsedJson: JSON.stringify(parsed),
      rowCount: parsed.rows.length,
    },
  });

  const metrics = extractMetrics(filename, category, parsed);
  if (metrics.length > 0) {
    await prisma.extractedMetric.createMany({
      data: metrics.map((m) => ({
        workspaceId,
        sourceFileId: sourceFile.id,
        metricName: m.metricName,
        metricValue: m.metricValue,
        numericValue: m.numericValue,
        unit: m.unit,
        category: m.category,
        sourceLocation: m.sourceLocation,
        evidence: m.evidence,
        confidence: m.confidence,
      })),
    });
  }

  return { sourceFileId: sourceFile.id, metricCount: metrics.length };
}

/**
 * Reset the database to a single freshly-seeded BrightPath workspace.
 * Idempotent: safe to call repeatedly (the "Load Sample Data" button uses this).
 */
export async function loadSampleWorkspace(prisma: PrismaClient): Promise<{
  workspaceId: string;
  fileCount: number;
  metricCount: number;
}> {
  // Single-workspace demo: clear everything first.
  await prisma.workspace.deleteMany({});

  const workspace = await prisma.workspace.create({
    data: SAMPLE_WORKSPACE,
  });

  const files = await readSampleFiles();
  let metricCount = 0;
  for (const { filename, raw } of files) {
    const result = await ingestFile(prisma, workspace.id, filename, raw);
    metricCount += result.metricCount;
  }

  return {
    workspaceId: workspace.id,
    fileCount: files.length,
    metricCount,
  };
}

/** The active demo workspace, creating an empty one if none exists. */
export async function getOrCreateWorkspace(prisma: PrismaClient) {
  const existing = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.workspace.create({ data: SAMPLE_WORKSPACE });
}
