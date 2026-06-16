import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  ScanSearch,
  Quote,
  FileText,
  Download,
  ShieldCheck,
  Database,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { SampleDataControls } from "@/components/SampleDataControls";
import { GithubMark } from "@/components/icons/GithubMark";

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: "Ingest messy files",
    body: "Drop in CSVs, markdown, TXT, or JSON exports. MissionBrief parses each into structured rows and sections.",
  },
  {
    icon: ScanSearch,
    title: "Extract metrics by rule",
    body: "Deterministic extractors pull youth served, attendance, budget, grant spend, donors, and risk flags — no opaque guessing.",
  },
  {
    icon: Quote,
    title: "Cite every number",
    body: "Each metric carries its exact source: file name, row range or section, an evidence snippet, and a confidence score.",
  },
  {
    icon: FileText,
    title: "Generate board-ready reports",
    body: "Board packets, grant updates, KPI snapshots, and risk memos — assembled from the cited metrics, not invented prose.",
  },
  {
    icon: Download,
    title: "Export anywhere",
    body: "Download as Markdown, copy to clipboard, or print to PDF with a clean, print-optimized layout.",
  },
  {
    icon: ShieldCheck,
    title: "Local-first, no keys",
    body: "Runs on SQLite with deterministic extraction. Optional OpenAI/Ollama polish is isolated and never touches the numbers.",
  },
];

const STEPS = [
  { n: "01", t: "Load data", d: "Click Load BrightPath Demo Data or upload your own files." },
  { n: "02", t: "Review metrics", d: "See every extracted metric with its source and confidence." },
  { n: "03", t: "Generate", d: "Pick a report type, period, and tone — then generate." },
  { n: "04", t: "Verify & export", d: "Trace each claim in the citation sidebar, then export." },
];

const STACK = ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "SQLite", "Optional LLM"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-slate-900">MissionBrief</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline"
            >
              Dashboard
            </Link>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <GithubMark className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Portfolio demo · source-backed reporting
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Turn messy nonprofit files into{" "}
              <span className="text-brand-600">source-backed</span> board packets
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              MissionBrief is an AI reporting copilot for small nonprofits. It
              extracts metrics from program logs, budgets, and grant docs — then
              generates funder-ready reports where{" "}
              <span className="font-medium text-slate-900">every number is traceable</span>{" "}
              to the file and row it came from.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                View Demo Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <SampleDataControls variant="compact" />
            </div>
          </div>

          {/* Source-backed proof snippet */}
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-xs text-slate-400">Monthly Board Packet — Executive Summary</span>
              </div>
              <div className="space-y-3 p-5 text-sm leading-relaxed text-slate-700">
                <p>
                  In May 2026, BrightPath Youth Center served{" "}
                  <span className="font-semibold text-slate-900">214 youth</span>
                  <Cite n={1} /> across its programs, averaging{" "}
                  <span className="font-semibold text-slate-900">31</span>
                  <Cite n={2} /> per session. The organization spent{" "}
                  <span className="font-semibold text-slate-900">$18,420</span>
                  <Cite n={3} /> of its $25,000 grant.
                </p>
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-500">
                  <span className="font-semibold text-brand-700">[3]</span>{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-brand-700 ring-1 ring-slate-200">
                    monthly_budget.csv
                  </code>{" "}
                  · row 2 — Youth Development Program: $18,420 spent of $25,000 budgeted ·
                  95% confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Not another &ldquo;upload doc → AI summary&rdquo; wrapper
          </h2>
          <p className="mt-3 text-slate-600">
            The hard part is trust. MissionBrief keeps the numbers deterministic
            and every claim auditable.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Demo in two minutes
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="text-3xl font-bold text-brand-200">{s.n}</span>
                <h3 className="mt-2 text-base font-semibold text-slate-900">
                  {s.t}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + stack */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="card flex flex-col items-center gap-6 bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white">
          <Database className="h-10 w-10" />
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Clone it, seed it, and generate a board packet in under a minute
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Open the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <GithubMark className="h-4 w-4" /> View source
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {STACK.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-slate-400 sm:flex-row">
          <p>MissionBrief — a portfolio demo. Sample data is fictional.</p>
          <p>Built with Next.js, Prisma & SQLite.</p>
        </div>
      </footer>
    </div>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 rounded bg-brand-100 px-1 text-[10px] font-semibold text-brand-700">
      [{n}]
    </sup>
  );
}
