import { executeHelpCommand } from "./helpCommand";
import { executeTestLlmCommand } from "./testLlmCommand";
import type { SlashCommandContext, SlashCommandDefinition } from "./slashCommandTypes";

/**
 * Central plugin-level registry for all available slash commands.
 */
export const slashCommands = {
  "/help": {
    descriptionKey: "slashCommands.help.description",
    execute: (context: SlashCommandContext) => executeHelpCommand(context),
    id: "help",
    name: "/help",
    nameKey: "slashCommands.help.name"
  },
  "/test-llm": {
    descriptionKey: "slashCommands.testLlm.description",
    execute: executeTestLlmCommand,
    id: "test-llm",
    name: "/test-llm",
    nameKey: "slashCommands.testLlm.name"
  }
} as const satisfies Record<string, SlashCommandDefinition>;

/**
 * Slash command names currently registered by the plugin.
 */
export type RegisteredSlashCommandName = keyof typeof slashCommands;
