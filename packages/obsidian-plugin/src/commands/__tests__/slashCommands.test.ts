import { generateHelpMarkdown } from "../helpCommand";
import { slashCommands } from "../slashCommands";
import { assert } from "../../testUtils";
import type { TFunction } from "i18next";

const t = ((key: string): string => {
  const translations: Record<string, string> = {
    "slashCommands.help.description": "Show available slash commands.",
    "slashCommands.help.markdownIntro": "These commands can be used from chat input or quick actions.",
    "slashCommands.help.markdownTitle": "Available slash commands",
    "slashCommands.help.name": "Help"
  };

  return translations[key] ?? key;
}) as TFunction;

/**
 * Verifies that the central slash command registry exposes `/help`.
 */
export const testSlashCommandRegistryContainsHelp = (): void => {
  assert(Object.hasOwn(slashCommands, "/help"), "Expected slash command registry to contain /help.");
};

/**
 * Verifies that help markdown lists registered command metadata.
 */
export const testHelpMarkdownContainsAvailableCommands = (): void => {
  const markdown = generateHelpMarkdown(slashCommands, t);

  assert(markdown.includes("Available slash commands"), "Expected help markdown to include a title.");
  assert(markdown.includes("`/help`"), "Expected help markdown to include /help.");
  assert(markdown.includes("Show available slash commands."), "Expected help markdown to include command description.");
};
