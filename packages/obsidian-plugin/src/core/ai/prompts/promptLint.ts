import type { PromptDiagnostic, PromptOutputMode } from "./promptTypes";

/**
 * Runs conservative source-prompt lint rules for data-agent prompts.
 */
export const lintPrompts = ({
  outputMode,
  system
}: {
  readonly outputMode: PromptOutputMode;
  readonly system: string;
}): readonly PromptDiagnostic[] => {
  if (outputMode !== "json") {
    return [];
  }

  const diagnostics: PromptDiagnostic[] = [];
  const normalizedSystem = system.toLowerCase();

  if (system.includes("```")) {
    diagnostics.push({
      message: "JSON workflow prompts must not contain markdown code fences.",
      ruleId: "forbidMarkdownCodeFences",
      severity: "error"
    });
  }

  if (!normalizedSystem.includes("expected object shape") && !normalizedSystem.includes("output contract")) {
    diagnostics.push({
      message: "JSON workflow prompts must describe the expected output contract.",
      ruleId: "requireOutputContract",
      severity: "error"
    });
  }

  if (!normalizedSystem.includes("empty string") || !normalizedSystem.includes("empty array")) {
    diagnostics.push({
      message: "JSON workflow prompts must define uncertainty behavior for empty strings and arrays.",
      ruleId: "requireUncertaintyRules",
      severity: "error"
    });
  }

  if (!normalizedSystem.includes("do not create prose rewrites") && !normalizedSystem.includes("never rewrite")) {
    diagnostics.push({
      message: "Extraction prompts must forbid prose rewriting.",
      ruleId: "requireNoProseRewriteRule",
      severity: "error"
    });
  }

  return diagnostics;
};
