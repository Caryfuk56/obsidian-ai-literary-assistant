/**
 * Stable identifiers for bundled soul prompts.
 */
export type PromptSoulId = "Archivist";

/**
 * Stable identifiers for bundled task prompts.
 */
export type PromptTaskId = "chapter-metadata";

/**
 * Model output guidance requested by a workflow prompt recipe.
 */
export type PromptOutputMode = "json" | "text";

/**
 * Declarative recipe used to assemble runtime model input.
 */
export interface PromptRecipe {
  readonly outputMode: PromptOutputMode;
  readonly souls: readonly PromptSoulId[];
  readonly tasks: readonly PromptTaskId[];
}

/**
 * Runtime data appended to the reusable system prompt.
 */
export interface RuntimePromptInput {
  readonly kind: "chapter-text" | "chat-message";
  readonly text: string;
}

/**
 * Prompt diagnostic severity.
 */
export type PromptDiagnosticSeverity = "error" | "warning";

/**
 * Prompt composition or lint diagnostic.
 */
export interface PromptDiagnostic {
  readonly message: string;
  readonly ruleId: string;
  readonly severity: PromptDiagnosticSeverity;
}

/**
 * Metadata emitted by prompt assembly for tests and debug logging.
 */
export interface PromptDiagnostics {
  readonly diagnostics: readonly PromptDiagnostic[];
  readonly promptFiles: readonly string[];
}

/**
 * Fully assembled model input.
 */
export interface BuiltPromptInput {
  readonly diagnostics: PromptDiagnostics;
  readonly prompt: string;
  readonly system: string;
}

/**
 * Typed prompt assembly result.
 */
export type PromptBuildResult =
  | { ok: true; value: BuiltPromptInput }
  | {
    diagnostics: PromptDiagnostics;
    errorKey: string;
    ok: false;
  };
