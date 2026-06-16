import { FileSearch } from "lucide-react";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";

interface Citation {
  index: number;
  sourceFile: string;
  sourceLocation: string;
  claimText: string;
  evidenceSnippet: string;
  confidence: number;
}

export function CitationSidebar({ citations }: { citations: Citation[] }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileSearch className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900">
          Source Evidence
        </h3>
        <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {citations.length}
        </span>
      </div>

      {citations.length === 0 ? (
        <p className="text-sm text-slate-400">
          No source-backed metrics referenced.
        </p>
      ) : (
        <ol className="space-y-3">
          {citations.map((c) => (
            <li
              key={c.index}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-brand-600 text-[11px] font-semibold text-white">
                  {c.index}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {c.claimText}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    <code className="rounded bg-white px-1.5 py-0.5 text-brand-700 ring-1 ring-slate-200">
                      {c.sourceFile}
                    </code>{" "}
                    · {c.sourceLocation}
                  </p>
                  <p className="mt-1 text-xs italic text-slate-400">
                    {c.evidenceSnippet}
                  </p>
                  <div className="mt-2">
                    <ConfidenceBar value={c.confidence} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
