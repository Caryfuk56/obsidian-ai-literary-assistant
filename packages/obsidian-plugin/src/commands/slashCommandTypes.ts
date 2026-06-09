import type { App } from "obsidian";
import type { TFunction } from "i18next";

/**
 * Stable slash command identifiers supported by the plugin.
 */
export type SlashCommandId = "help";

/**
 * User-facing slash command names accepted by the chat input and quick actions.
 */
export type SlashCommandName = "/help";

/**
 * Dependencies and options passed to slash command executors.
 */
export interface SlashCommandContext {
  app: App;
  showModal?: boolean;
  t: TFunction;
}

/**
 * Markdown result produced by programmatic slash command execution.
 */
export interface SlashCommandResult {
  kind: "markdown";
  markdown: string;
}

/**
 * Registry entry describing one executable slash command.
 */
export interface SlashCommandDefinition {
  descriptionKey: string;
  execute: (context: SlashCommandContext) => Promise<SlashCommandResult | undefined> | SlashCommandResult | undefined;
  id: SlashCommandId;
  name: SlashCommandName;
  nameKey: string;
}
