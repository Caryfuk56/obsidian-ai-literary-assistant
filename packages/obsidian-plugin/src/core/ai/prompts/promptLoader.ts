import archivistSoulPrompt from "./souls/Archivist.md";
import chapterMetadataTaskPrompt from "./tasks/chapter-metadata.md";
import type { PromptRecipe, PromptSoulId, PromptTaskId } from "./promptTypes";

/**
 * Runtime prompt part identifiers available to the plugin bundle.
 */
export type RuntimePromptPart =
  | { id: PromptSoulId; kind: "soul" }
  | { id: PromptTaskId; kind: "task" };

/**
 * Result of loading a runtime prompt file.
 */
export type PromptLoadResult =
  | { content: string; fileName: string; ok: true }
  | { errorKey: string; fileName: string; ok: false };

const soulPrompts: Record<PromptSoulId, string> = {
  Archivist: archivistSoulPrompt
};

const taskPrompts: Record<PromptTaskId, string> = {
  "chapter-metadata": chapterMetadataTaskPrompt
};

/**
 * Loads a bundled markdown runtime prompt by typed prompt part id.
 */
export const loadRuntimePrompt = (part: RuntimePromptPart): PromptLoadResult => {
  const fileName = formatPromptPartFileName(part);

  if (part.kind === "soul") {
    if (!isPromptSoulId(part.id)) {
      return { errorKey: "chapterMetadata.errors.promptLoadFailed", fileName, ok: false };
    }

    return {
      content: soulPrompts[part.id],
      fileName,
      ok: true
    };
  }

  if (!isPromptTaskId(part.id)) {
    return { errorKey: "chapterMetadata.errors.promptLoadFailed", fileName, ok: false };
  }

  return {
    content: taskPrompts[part.id],
    fileName,
    ok: true
  };
};

/**
 * Composes multiple bundled markdown prompts in stable order.
 */
export const composeRuntimePrompts = (recipe: PromptRecipe): PromptLoadResult => {
  const parts: RuntimePromptPart[] = [
    ...recipe.souls.map((id) => ({ id, kind: "soul" as const })),
    ...recipe.tasks.map((id) => ({ id, kind: "task" as const }))
  ];
  const promptParts: string[] = [];

  for (const part of parts) {
    const result = loadRuntimePrompt(part);

    if (!result.ok) {
      return result;
    }

    promptParts.push(result.content.trim());
  }

  return {
    content: promptParts.join("\n\n"),
    fileName: parts.map(formatPromptPartFileName).join(" + "),
    ok: true
  };
};

/**
 * Runtime prompt recipe used by chapter metadata extraction.
 */
export const CHAPTER_METADATA_PROMPT_RECIPE = {
  outputMode: "json",
  souls: ["Archivist"],
  tasks: ["chapter-metadata"]
} as const satisfies PromptRecipe;

const isPromptSoulId = (id: string): id is PromptSoulId => (
  Object.hasOwn(soulPrompts, id)
);

const isPromptTaskId = (id: string): id is PromptTaskId => (
  Object.hasOwn(taskPrompts, id)
);

const formatPromptPartFileName = (part: RuntimePromptPart): string => (
  part.kind === "soul" ? `souls/${part.id}.md` : `tasks/${part.id}.md`
);
