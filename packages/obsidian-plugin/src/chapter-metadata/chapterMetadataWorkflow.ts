import type { App } from "obsidian";

import type { PromptRecipe } from "../core/ai/prompts/promptTypes";
import { LLMClientFactory } from "../llm/llmClientFactory";
import type { AureliusSettings } from "../settings/settingsTypes";
import { getActiveMarkdownFile } from "./activeMarkdownFile";
import { extractChapterText } from "./chapterTextExtraction";
import type { ChapterMetadataReviewState } from "./chapterMetadataTypes";
import { extractChapterMetadataSuggestion, type ChapterMetadataObjectGenerator } from "./chapterMetadataExtraction";
import { mergeChapterMetadataSuggestion } from "./chapterMetadataMerge";

/**
 * Result of preparing chapter metadata review state.
 */
export type ChapterMetadataWorkflowResult =
  | { ok: true; review: ChapterMetadataReviewState }
  | { messageKey: string; ok: false };

/**
 * Runs chapter metadata analysis without writing to the vault.
 */
export const createChapterMetadataReview = async ({
  app,
  generateRaw,
  now = new Date(),
  promptRecipe,
  settings
}: {
  readonly app: App;
  readonly generateRaw?: ChapterMetadataObjectGenerator;
  readonly now?: Date;
  readonly promptRecipe?: PromptRecipe | undefined;
  readonly settings: AureliusSettings;
}): Promise<ChapterMetadataWorkflowResult> => {
  const activeFileResult = getActiveMarkdownFile(app);

  if (!activeFileResult.ok) {
    return { messageKey: "chapterMetadata.errors.noActiveMarkdownFile", ok: false };
  }

  const rawContent = await app.vault.read(activeFileResult.file);
  const chapterText = extractChapterText(rawContent);

  if (!chapterText) {
    return { messageKey: "chapterMetadata.errors.extractionFailed", ok: false };
  }

  const extractionResult = await extractChapterMetadataSuggestion({
    factory: new LLMClientFactory(settings),
    ...(generateRaw ? { generateRaw } : {}),
    ...(promptRecipe ? { promptRecipe } : {}),
    settingsDefaultTier: settings.defaultModelTier,
    text: chapterText
  });

  if (!extractionResult.ok) {
    return { messageKey: extractionResult.errorKey, ok: false };
  }

  const originalFrontmatter = app.metadataCache.getFileCache(activeFileResult.file)?.frontmatter ?? {};
  const pendingMetadata = mergeChapterMetadataSuggestion({
    existingFrontmatter: originalFrontmatter,
    now,
    suggestion: extractionResult.metadata
  });

  return {
    ok: true,
    review: {
      editableFields: {},
      filePath: activeFileResult.file.path,
      originalFrontmatter,
      pendingMetadata
    }
  };
};
