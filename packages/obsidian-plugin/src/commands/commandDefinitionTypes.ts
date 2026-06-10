import type { App } from "obsidian";
import type { TFunction } from "i18next";

import type { ChapterMetadataObjectGenerator } from "../chapter-metadata/chapterMetadataExtraction";
import type { ToolOutput } from "../chapter-metadata/chapterMetadataTypes";
import type { GenerateChatResponseAdapter } from "../chat/ChatRouter";
import type { PromptRecipe } from "../core/ai/prompts/promptTypes";
import type { AureliusSettings } from "../settings/settingsTypes";

/**
 * Input source expected by a slash command workflow primitive.
 */
export interface CommandInputDefinition {
  readonly source: "active-markdown-file" | "chat-input" | "none";
}

/**
 * Output surface produced by a slash command workflow primitive.
 */
export interface CommandOutputDefinition {
  readonly kind: "markdown" | "tool-output";
  readonly renderer?: "chapter-metadata-review";
}

/**
 * Safety policy declared by commands with irreversible side effects.
 */
export interface CommandSafetyDefinition {
  readonly backupBeforeWrite?: boolean;
  readonly requiresApproval?: boolean;
}

/**
 * Parsed slash command input passed to command executors.
 */
export interface SlashCommandExecutionInput {
  readonly args: string;
  readonly rawInput: string;
}

/**
 * Dependencies and options passed to slash command executors.
 */
export interface SlashCommandContext {
  readonly app: App;
  readonly commandDefinition?: CommandRuntimeDefinition | undefined;
  readonly generateChapterMetadata?: ChapterMetadataObjectGenerator | undefined;
  readonly generateResponse?: GenerateChatResponseAdapter | undefined;
  readonly settings: AureliusSettings;
  readonly showModal?: boolean;
  readonly t: TFunction;
}

/**
 * Minimal command metadata made available while executing a command.
 */
export interface CommandRuntimeDefinition {
  readonly promptRecipe?: PromptRecipe | undefined;
}

/**
 * Result produced by programmatic slash command execution.
 */
export type SlashCommandResult =
  | { kind: "markdown"; markdown: string }
  | { kind: "tool-output"; output: ToolOutput };

/**
 * Executable service behind a slash command definition.
 */
export type CommandExecutor = (
  context: SlashCommandContext,
  input: SlashCommandExecutionInput
) => Promise<SlashCommandResult | undefined> | SlashCommandResult | undefined;

/**
 * Declarative metadata for one user-invokable workflow primitive.
 */
export interface SlashCommandDefinitionBase {
  readonly descriptionKey: string;
  readonly execute: CommandExecutor;
  readonly id: string;
  readonly input?: CommandInputDefinition;
  readonly name: string;
  readonly nameKey: string;
  readonly output?: CommandOutputDefinition;
  readonly promptRecipe?: PromptRecipe;
  readonly safety?: CommandSafetyDefinition;
}

/**
 * Preserves literal command metadata while checking definition shape.
 */
export const defineSlashCommand = <const TDefinition extends SlashCommandDefinitionBase>(
  definition: TDefinition
): TDefinition => definition;
