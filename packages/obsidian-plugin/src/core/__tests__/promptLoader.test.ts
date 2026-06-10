import {
  CHAPTER_METADATA_PROMPT_RECIPE,
  composeRuntimePrompts,
  loadRuntimePrompt
} from "../ai/prompts/promptLoader";
import { buildPromptInput } from "../ai/prompts/PromptFactory";
import { lintPrompts } from "../ai/prompts/promptLint";
import { assert, assertEqual } from "../../testUtils";

/**
 * Verifies markdown runtime prompt files load as bundled strings.
 */
export const testPromptLoaderLoadsMarkdownPrompt = (): void => {
  const result = loadRuntimePrompt({ id: "Archivist", kind: "soul" });

  assert(result.ok, "Expected prompt file to load");
  assert(result.ok ? result.content.includes("Archivist") : false, "Expected prompt content");
};

/**
 * Verifies multiple runtime prompts compose in stable order.
 */
export const testPromptLoaderComposesPrompts = (): void => {
  const result = composeRuntimePrompts(CHAPTER_METADATA_PROMPT_RECIPE);

  assert(result.ok, "Expected prompt composition to succeed");
  assert(result.ok ? result.content.indexOf("SOUL: Archivist") < result.content.indexOf("Expected object shape") : false, "Expected stable prompt order");
};

/**
 * Verifies missing prompt files return typed errors.
 */
export const testPromptLoaderMissingPromptReturnsError = (): void => {
  const result = loadRuntimePrompt({ id: "missing" as never, kind: "task" });

  assertEqual(result.ok, false, "Expected missing prompt to fail");
};

/**
 * Verifies PromptFactory builds stable system and user prompts.
 */
export const testPromptFactoryBuildsChapterTextInput = (): void => {
  const result = buildPromptInput(CHAPTER_METADATA_PROMPT_RECIPE, {
    kind: "chapter-text",
    text: "Body"
  });

  assert(result.ok, "Expected prompt factory to build chapter metadata prompt");
  assert(result.ok ? result.value.system.includes("Expected object shape") : false, "Expected task prompt in system input");
  assert(result.ok ? result.value.prompt.includes("Body") : false, "Expected chapter text in user prompt");
  assertEqual(result.ok ? result.value.diagnostics.promptFiles[0] : "", "souls/Archivist.md", "Expected soul prompt first");
};

/**
 * Verifies JSON prompt lint catches markdown code fences.
 */
export const testPromptLintRejectsMarkdownCodeFences = (): void => {
  const diagnostics = lintPrompts({
    outputMode: "json",
    system: "Expected object shape\nempty string\nempty array\nnever rewrite\n```json"
  });

  assert(diagnostics.some((diagnostic) => diagnostic.ruleId === "forbidMarkdownCodeFences"), "Expected code fence diagnostic");
};

/**
 * Verifies JSON prompt lint requires an output contract.
 */
export const testPromptLintRequiresOutputContract = (): void => {
  const diagnostics = lintPrompts({
    outputMode: "json",
    system: "empty string\nempty array\nnever rewrite"
  });

  assert(diagnostics.some((diagnostic) => diagnostic.ruleId === "requireOutputContract"), "Expected output contract diagnostic");
};
