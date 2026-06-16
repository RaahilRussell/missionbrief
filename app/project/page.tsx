import {
  ScanSearch,
  Quote,
  ShieldCheck,
  Workflow,
  Database,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GithubMark } from "@/components/icons/GithubMark";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PIPELINE = [
  {
    icon: Database,
    title: "1 · Ingest",
    body: "CSV, Markdown, TXT, and JSON files are parsed into structured rows and headed sections. Each file is stored with its raw text and parsed form.",
  },
  {
    icon: ScanSearch,
    title: "2 · Extract",
    body: "Deterministic, rule-based extractors compute metrics — summing columns, reading milestone tables, scanning notes for risk flags. No model guesses the numbers.",
  },
  {
    icon: Quote,
    title: "3 · Cite",
    body: "Every metric stores its origin: source file, row range or section, an evidence snippet, and a confidence score. Citations are assembled into a numbered appendix.",
  },
  {
    icon: Workflow,
    title: "4 · Assemble",
    body: "Report sections are built from the cited metrics. An optional LLM may smooth the prose, but it is forbidden from touching figures and falls back to deterministic text.",
  },
];

const STACK = [
  ["Next.js (App Router)", "Server components, route handlers, server actions"],
  ["TypeScript", "Strict mode across parsing, extraction, and rendering"],
  ["Prisma + SQLite", "Local-first persistence — no cloud database to run the demo"],
  ["Tailwind CSS v4", "Design system with a small set of UI primitives"],
  ["Optional LLM", "OpenAI or local Ollama, isolated to narrative polish only"],
];

const FAQ = [
  {
    q: "Is this a real product?",
    a: "No — it's a portfolio demo. The BrightPath Youth Center data is fictional and internally consistent so the numbers always reconcile.",
  },
  {
    q: "Does it need an API key?",
    a: "No. The default engine is fully deterministic and runs offline. The OpenAI / Ollama integration is optional and only rephrases prose.",
  },
  {
    q: "Why does extraction avoid the LLM?",
    a: "Trust. A funder report is only useful if every figure is traceable. Computing metrics with explicit rules means each number can be audited back to a file and row.",
  },
];

export default function ProjectPage() {
  return (
    <AppShell>
      <PageHeader
        title="About this demo"
        description="MissionBrief turns messy nonprofit files into funder-ready reports where every number is traceable to its source."
        actions={
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <GithubMark className="h-4 w-4" /> View on GitHub
          </a>
        }
      />

      <Card className="mb-6 border-brand-100 bg-brand-50/50">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-brand-600 ring-1 ring-brand-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              The differentiator: source-backed reporting
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Most &ldquo;AI report generators&rdquo; hand a document to a model
              and hope the numbers are right. MissionBrief inverts that: metrics
              are extracted deterministically and cited, and the language model
              is confined to wording. The hard, valuable part is the audit
              trail — not the prose.
            </p>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        How the pipeline works
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {PIPELINE.map((p) => (
          <Card key={p.title}>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {p.body}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Tech stack
      </h2>
      <Card className="mb-8">
        <ul className="divide-y divide-slate-100">
          {STACK.map(([name, detail]) => (
            <li
              key={name}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="w-56 shrink-0 text-sm font-medium text-slate-800">
                {name}
              </span>
              <span className="text-sm text-slate-500">{detail}</span>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        FAQ
      </h2>
      <div className="space-y-3">
        {FAQ.map((f) => (
          <Card key={f.q}>
            <h3 className="text-sm font-semibold text-slate-900">{f.q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.a}</p>
          </Card>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <Badge tone="slate">Demo</Badge>
        Sample data is fictional. Built as a portfolio project.
      </p>
    </AppShell>
  );
}
