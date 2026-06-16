// Builds the numbered citation trail that backs every claim in a report.

export interface MetricRecord {
  metricName: string;
  metricValue: string;
  numericValue: number | null;
  unit: string;
  category: string;
  sourceFileName: string;
  sourceLocation: string;
  evidence: string;
  confidence: number;
}

export interface CitationRecord {
  index: number;
  sourceFile: string;
  sourceLocation: string;
  claimText: string;
  evidenceSnippet: string;
  confidence: number;
}

/**
 * Accumulates citations as a report is assembled. Each distinct source location
 * gets a stable [n] marker; repeated references to the same source reuse it.
 */
export class CitationCollector {
  private citations: CitationRecord[] = [];
  private byKey = new Map<string, CitationRecord>();

  /**
   * Register a citation for a metric and return the inline marker, e.g. "[3]".
   * `claimText` is the sentence the number supports.
   */
  cite(metric: MetricRecord, claimText: string): string {
    const key = `${metric.sourceFileName}::${metric.sourceLocation}::${metric.metricName}`;
    const existing = this.byKey.get(key);
    if (existing) return `[${existing.index}]`;

    const record: CitationRecord = {
      index: this.citations.length + 1,
      sourceFile: metric.sourceFileName,
      sourceLocation: metric.sourceLocation,
      claimText,
      evidenceSnippet: metric.evidence,
      confidence: metric.confidence,
    };
    this.citations.push(record);
    this.byKey.set(key, record);
    return `[${record.index}]`;
  }

  getCitations(): CitationRecord[] {
    return this.citations;
  }

  /** Render the citation list as a markdown appendix. */
  toMarkdownAppendix(): string {
    if (this.citations.length === 0) {
      return "_No source-backed metrics were referenced in this report._";
    }
    const lines = this.citations.map((c) => {
      const confidence = `${Math.round(c.confidence * 100)}% confidence`;
      return `${c.index}. **${c.claimText}**\n   - Source: \`${c.sourceFile}\` — ${c.sourceLocation}\n   - Evidence: ${c.evidenceSnippet}\n   - Extraction ${confidence}`;
    });
    return lines.join("\n");
  }
}

/** Index metrics by name for quick, explicit lookup inside generators. */
export function indexMetrics(metrics: MetricRecord[]): Map<string, MetricRecord> {
  const map = new Map<string, MetricRecord>();
  for (const m of metrics) {
    if (!map.has(m.metricName)) map.set(m.metricName, m);
  }
  return map;
}
