// Engine selection + safe narrative polish.
//
// The report generators are fully deterministic and always produce a complete,
// source-backed draft on their own. The LLM layer is an OPTIONAL pass that only
// rephrases narrative prose — it can never touch the underlying numbers, and if
// it fails for any reason we transparently fall back to the deterministic draft.

import { mockPolish } from "./mockLLM";
import { openaiPolish } from "./openaiClient";
import { ollamaPolish } from "./ollamaClient";

export type ReportEngine = "deterministic" | "openai" | "ollama";

/** Resolve the engine from env, downgrading to deterministic if misconfigured. */
export function getConfiguredEngine(): ReportEngine {
  const raw = (process.env.REPORT_ENGINE || "deterministic").toLowerCase();
  if (raw === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (raw === "ollama") return "ollama";
  return "deterministic";
}

export interface PolishResult {
  text: string;
  engineUsed: ReportEngine;
}

/**
 * Optionally polish narrative prose. Returns which engine actually ran so the
 * report can be labelled honestly.
 */
export async function polishNarrative(
  draft: string,
  tone: string,
): Promise<PolishResult> {
  const engine = getConfiguredEngine();
  if (engine === "deterministic") {
    return { text: await mockPolish(draft), engineUsed: "deterministic" };
  }
  try {
    const text =
      engine === "openai"
        ? await openaiPolish({ draft, tone })
        : await ollamaPolish({ draft, tone });
    return { text, engineUsed: engine };
  } catch {
    // Never break the demo because an optional LLM call failed.
    return { text: draft, engineUsed: "deterministic" };
  }
}
