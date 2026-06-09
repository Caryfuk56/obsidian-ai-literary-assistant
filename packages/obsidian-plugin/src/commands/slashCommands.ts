import { executeHelpCommand } from "./helpCommand";
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
  }
} as const satisfies Record<string, SlashCommandDefinition>;

/**
 * Slash command names currently registered by the plugin.
 */
export type RegisteredSlashCommandName = keyof typeof slashCommands;
