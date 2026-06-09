import { generateHelpMarkdown } from "../helpCommand";
import { slashCommands } from "../slashCommands";
import { executeTestLlmCommand, TEST_LLM_PROMPT } from "../testLlmCommand";
import { DEFAULT_AURELIUS_SETTINGS, cloneSettings } from "../../settings/defaultSettings";
import { assert, assertEqual } from "../../testUtils";
import type { TFunction } from "i18next";
import type { SlashCommandContext } from "../slashCommandTypes";

const t = ((key: string): string => {
  const translations: Record<string, string> = {
    "slashCommands.help.description": "Show available slash commands.",
    "slashCommands.help.markdownIntro": "These commands can be used from chat input or quick actions.",
    "slashCommands.help.markdownTitle": "Available slash commands",
    "slashCommands.help.name": "Help",
    "slashCommands.testLlm.description": "Test LLM connection.",
    "slashCommands.testLlm.invalidTier": "Invalid tier.",
    "slashCommands.testLlm.name": "Test LLM"
  };

  return translations[key] ?? key;
}) as TFunction;

/**
 * Verifies that the central slash command registry exposes `/help`.
 */
export const testSlashCommandRegistryContainsHelp = (): void => {
  assert(Object.hasOwn(slashCommands, "/help"), "Expected slash command registry to contain /help.");
  assert(Object.hasOwn(slashCommands, "/test-llm"), "Expected slash command registry to contain /test-llm.");
};

/**
 * Verifies that `/test-llm` validates the required tier argument.
 */
export const testTestLlmValidatesTierArgument = async (): Promise<void> => {
  const result = await executeTestLlmCommand({
    app: {},
    settings: DEFAULT_AURELIUS_SETTINGS,
    t
  } as SlashCommandContext, {
    args: "",
    rawInput: "/test-llm"
  });

  assertEqual(result.markdown, "Invalid tier.", "Expected missing tier to return usage guidance");
};

/**
 * Verifies that `/test-llm` uses the requested tier instead of the default tier.
 */
export const testTestLlmBypassesDefaultTier = async (): Promise<void> => {
  const settings = cloneSettings(DEFAULT_AURELIUS_SETTINGS);
  settings.defaultModelTier = "basic";
  let capturedTier = "";
  let capturedPrompt = "";
  const result = await executeTestLlmCommand({
    app: {},
    generateResponse: ({ prompt, tier }) => {
      capturedPrompt = prompt;
      capturedTier = tier;

      return Promise.resolve({
        markdown: "Connection successful",
        ok: true
      });
    },
    settings,
    t
  } as SlashCommandContext, {
    args: "local",
    rawInput: "/test-llm local"
  });

  assertEqual(capturedTier, "local", "Expected /test-llm to use the requested tier");
  assertEqual(capturedPrompt, TEST_LLM_PROMPT, "Expected /test-llm to send the exact test prompt");
  assertEqual(result.markdown, "Connection successful", "Expected test result markdown");
};

/**
 * Verifies that help markdown lists registered command metadata.
 */
export const testHelpMarkdownContainsAvailableCommands = (): void => {
  const markdown = generateHelpMarkdown(slashCommands, t);

  assert(markdown.includes("Available slash commands"), "Expected help markdown to include a title.");
  assert(markdown.includes("`/help`"), "Expected help markdown to include /help.");
  assert(markdown.includes("`/test-llm`"), "Expected help markdown to include /test-llm.");
  assert(markdown.includes("Show available slash commands."), "Expected help markdown to include command description.");
};
