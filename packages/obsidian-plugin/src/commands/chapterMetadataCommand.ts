import { createChapterMetadataReview } from "../chapter-metadata/chapterMetadataWorkflow";
import type { SlashCommandContext, SlashCommandResult } from "./slashCommandTypes";

/**
 * Executes `/chapter_metadata` and returns interactive metadata review output.
 */
export const executeChapterMetadataCommand = async (
  context: SlashCommandContext
): Promise<SlashCommandResult> => {
  let result;

  try {
    result = await createChapterMetadataReview({
      app: context.app,
      ...(context.generateChapterMetadata ? { generateRaw: context.generateChapterMetadata } : {}),
      ...(context.commandDefinition?.promptRecipe ? { promptRecipe: context.commandDefinition.promptRecipe } : {}),
      settings: context.settings
    });
  } catch {
    return {
      kind: "tool-output",
      output: {
        kind: "error",
        message: context.t("chapterMetadata.errors.extractionFailedWithDebug")
      }
    };
  }

  if (!result.ok) {
    return {
      kind: "tool-output",
      output: {
        kind: "error",
        message: context.t(result.messageKey)
      }
    };
  }

  return {
    kind: "tool-output",
    output: {
      kind: "chapter-metadata-review",
      review: result.review
    }
  };
};
