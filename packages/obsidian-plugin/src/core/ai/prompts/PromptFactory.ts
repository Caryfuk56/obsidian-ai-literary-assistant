import { composeRuntimePrompts } from "./promptLoader";
import { lintPrompts } from "./promptLint";
import type { PromptBuildResult, PromptDiagnostics, PromptRecipe, RuntimePromptInput } from "./promptTypes";

/**
 * Builds complete model input from a declarative prompt recipe and runtime input.
 */
export const buildPromptInput = (
  recipe: PromptRecipe,
  runtimeInput: RuntimePromptInput
): PromptBuildResult => {
  const promptResult = composeRuntimePrompts(recipe);
  const promptFiles = [
    ...recipe.souls.map((id) => `souls/${id}.md`),
    ...recipe.tasks.map((id) => `tasks/${id}.md`)
  ];
  const baseDiagnostics: PromptDiagnostics = {
    diagnostics: [],
    promptFiles
  };

  if (!promptResult.ok) {
    return {
      diagnostics: {
        ...baseDiagnostics,
        diagnostics: [
          {
            message: promptResult.errorKey,
            ruleId: "promptLoad",
            severity: "error"
          }
        ]
      },
      errorKey: promptResult.errorKey,
      ok: false
    };
  }

  const diagnostics = lintPrompts({
    outputMode: recipe.outputMode,
    system: promptResult.content
  });
  const builtDiagnostics: PromptDiagnostics = {
    diagnostics,
    promptFiles
  };
  const hasBlockingDiagnostic = diagnostics.some((diagnostic) => diagnostic.severity === "error");

  if (hasBlockingDiagnostic) {
    return {
      diagnostics: builtDiagnostics,
      errorKey: "chapterMetadata.errors.promptLoadFailed",
      ok: false
    };
  }

  return {
    ok: true,
    value: {
      diagnostics: builtDiagnostics,
      prompt: buildRuntimePrompt(runtimeInput),
      system: promptResult.content
    }
  };
};

const buildRuntimePrompt = (runtimeInput: RuntimePromptInput): string => {
  switch (runtimeInput.kind) {
    case "chapter-text":
      return [
        "Extract chapter metadata from this Markdown chapter.",
        "",
        "Chapter text:",
        runtimeInput.text
      ].join("\n");
    case "chat-message":
      return runtimeInput.text;
  }
};
