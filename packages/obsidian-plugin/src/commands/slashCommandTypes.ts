import type { App } from "obsidian";
import type { TFunction } from "i18next";

import type { GenerateChatResponseAdapter } from "../chat/ChatRouter";
import type { AureliusSettings } from "../settings/settingsTypes";

/**
 * Stable slash command identifiers supported by the plugin.
 */
export type SlashCommandId = "help" | "test-llm";

/**
 * User-facing slash command names accepted by the chat input and quick actions.
 */
export type SlashCommandName = "/help" | "/test-llm";

/**
 * Parsed slash command input passed to command executors.
 */
export interface SlashCommandExecutionInput {
  args: string;
  rawInput: string;
}

/**
 * Dependencies and options passed to slash command executors.
 */
export interface SlashCommandContext {
  app: App;
  generateResponse?: GenerateChatResponseAdapter;
  settings: AureliusSettings;
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
  execute: (
    context: SlashCommandContext,
    input: SlashCommandExecutionInput
  ) => Promise<SlashCommandResult | undefined> | SlashCommandResult | undefined;
  id: SlashCommandId;
  name: SlashCommandName;
  nameKey: string;
}
