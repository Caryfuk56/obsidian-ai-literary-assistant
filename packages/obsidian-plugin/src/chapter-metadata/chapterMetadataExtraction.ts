import { generateText, Output } from "ai";

import { buildPromptInput } from "../core/ai/prompts/PromptFactory";
import { CHAPTER_METADATA_PROMPT_RECIPE } from "../core/ai/prompts/promptLoader";
import type { PromptRecipe } from "../core/ai/prompts/promptTypes";
import type { LLMClientFactory } from "../llm/llmClientFactory";
import type { ModelTier } from "../settings/settingsTypes";
import { validateChapterMetadataSuggestionObject } from "./chapterMetadataSchema";
import type { ChapterMetadataDiagnostics, ChapterMetadataSuggestion } from "./chapterMetadataTypes";

/**
 * Result of chapter metadata extraction through an LLM.
 */
export type ChapterMetadataExtractionResult =
  | { diagnostics?: ChapterMetadataDiagnostics; metadata: ChapterMetadataSuggestion; ok: true }
  | { diagnostics: ChapterMetadataDiagnostics; errorKey: string; ok: false };

/**
 * Adapter signature used to keep structured metadata extraction testable.
 */
export type ChapterMetadataObjectGenerator = (input: {
  readonly factory: LLMClientFactory;
  readonly prompt: string;
  readonly system: string;
  readonly tier: ModelTier;
}) => Promise<
  | {
    metadata: unknown;
    diagnostics: ChapterMetadataDiagnostics;
    ok: true;
  }
  | {
    diagnostics: ChapterMetadataDiagnostics;
    errorKey: string;
    ok: false;
  }
>;

/**
 * Backward-compatible alias for command tests and workflow injection.
 */
export type RawChapterMetadataGenerator = ChapterMetadataObjectGenerator;

/**
 * Builds the user prompt containing chapter text for metadata extraction.
 */
export const buildChapterMetadataUserPrompt = (chapterText: string): string => [
  "Extract chapter metadata from this Markdown chapter.",
  "",
  "Chapter text:",
  chapterText
].join("\n");

/**
 * Generates structured metadata with the configured model tier.
 */
export const generateStructuredChapterMetadata: ChapterMetadataObjectGenerator = async ({
  factory,
  prompt,
  system,
  tier
}) => {
  const modelResult = factory.createModel(tier);
  const baseDiagnostics: ChapterMetadataDiagnostics = {
    promptFiles: [],
    stage: "model-call",
    tier,
    validationErrors: []
  };

  if (!modelResult.ok) {
    return {
      diagnostics: {
        ...baseDiagnostics,
        errorMessage: modelResult.messageKey,
        validationErrors: [modelResult.code]
      },
      errorKey: modelResult.messageKey,
      ok: false
    };
  }

  try {
    const result = await generateText({
      model: modelResult.model,
      output: Output.json(),
      prompt,
      system
    });

    return {
      diagnostics: {
        ...baseDiagnostics,
        modelId: modelResult.modelId,
        provider: modelResult.provider
      },
      metadata: result.output,
      ok: true
    };
  } catch (error) {
    return {
      diagnostics: {
        ...baseDiagnostics,
        modelId: modelResult.modelId,
        provider: modelResult.provider,
        errorMessage: error instanceof Error ? error.message : String(error)
      },
      errorKey: "chapterMetadata.errors.extractionFailedWithDebug",
      ok: false
    };
  }
};

/**
 * Backward-compatible export for older tests.
 */
export const generateRawChapterMetadata = generateStructuredChapterMetadata;

/**
 * Extracts and validates metadata suggestions from chapter text.
 */
export const extractChapterMetadataSuggestion = async ({
  factory,
  generateRaw = generateStructuredChapterMetadata,
  promptRecipe = CHAPTER_METADATA_PROMPT_RECIPE,
  settingsDefaultTier,
  text
}: {
  readonly factory: LLMClientFactory;
  readonly generateRaw?: ChapterMetadataObjectGenerator | undefined;
  readonly promptRecipe?: PromptRecipe | undefined;
  readonly settingsDefaultTier: ModelTier;
  readonly text: string;
}): Promise<ChapterMetadataExtractionResult> => {
  const promptResult = buildPromptInput(promptRecipe, {
    kind: "chapter-text",
    text
  });

  if (!promptResult.ok) {
    return {
      diagnostics: {
        promptFiles: [...promptResult.diagnostics.promptFiles],
        stage: "prompt-loading",
        validationErrors: promptResult.diagnostics.diagnostics.map((diagnostic) => diagnostic.ruleId)
      },
      errorKey: promptResult.errorKey,
      ok: false
    };
  }

  const rawResult = await generateRaw({
    factory,
    prompt: promptResult.value.prompt,
    system: promptResult.value.system,
    tier: settingsDefaultTier
  });

  if (rawResult.diagnostics.promptFiles.length === 0) {
    rawResult.diagnostics.promptFiles = [...promptResult.value.diagnostics.promptFiles];
  }

  if (!rawResult.ok) {
    logChapterMetadataDiagnostics(rawResult.diagnostics);
    return rawResult;
  }

  const validationResult = validateChapterMetadataSuggestionObject(rawResult.metadata);

  if (!validationResult.ok) {
    const diagnostics: ChapterMetadataDiagnostics = {
      ...rawResult.diagnostics,
      stage: "schema-validation",
      validationErrors: validationResult.validationErrors
    };
    logChapterMetadataDiagnostics(diagnostics);

    return {
      diagnostics,
      errorKey: "chapterMetadata.errors.extractionFailedWithDebug",
      ok: false
    };
  }

  return { diagnostics: rawResult.diagnostics, metadata: validationResult.suggestion, ok: true };
};

/**
 * Logs safe diagnostics for developer debugging without exposing secrets.
 */
export const logChapterMetadataDiagnostics = (diagnostics: ChapterMetadataDiagnostics): void => {
  console.warn("Chapter metadata extraction diagnostics", diagnostics);
};
