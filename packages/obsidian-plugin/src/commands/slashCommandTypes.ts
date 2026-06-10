import type { slashCommands } from "./slashCommands";
import type {
  CommandExecutor,
  CommandInputDefinition,
  CommandOutputDefinition,
  CommandSafetyDefinition,
  SlashCommandContext,
  SlashCommandDefinitionBase,
  SlashCommandExecutionInput,
  SlashCommandResult
} from "./commandDefinitionTypes";

/**
 * Stable slash command identifiers supported by the plugin.
 */
export type SlashCommandName = keyof typeof slashCommands;

/**
 * User-facing slash command names accepted by the chat input and quick actions.
 */
export type SlashCommandId = (typeof slashCommands)[SlashCommandName]["id"];

/**
 * Parsed slash command input passed to command executors.
 */
export type SlashCommandDefinition = SlashCommandDefinitionBase & {
  readonly id: SlashCommandId;
  readonly name: SlashCommandName;
};

export type {
  CommandExecutor,
  CommandInputDefinition,
  CommandOutputDefinition,
  CommandSafetyDefinition,
  SlashCommandContext,
  SlashCommandExecutionInput,
  SlashCommandResult
};
