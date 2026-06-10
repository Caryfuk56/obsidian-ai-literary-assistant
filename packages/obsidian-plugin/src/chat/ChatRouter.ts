import { slashCommands } from "../commands/slashCommands";
import type { SlashCommandName } from "../commands/slashCommandTypes";
import { executeSlashCommand } from "../commands/executeSlashCommand";
import type { ChapterMetadataObjectGenerator } from "../chapter-metadata/chapterMetadataExtraction";
import { generateChatResponse } from "../llm/generateChatResponse";
import { LLMClientFactory } from "../llm/llmClientFactory";
import type { ModelTier } from "../settings/settingsTypes";
import type { ChatRouteResult, ChatRouterContext } from "./chatRouterTypes";

/**
 * Parsed slash command input.
 */
export interface ParsedSlashCommand {
  args: string;
  commandName: string;
  rawInput: string;
}

/**
 * Adapter signature used by the router for testable text generation.
 */
export type GenerateChatResponseAdapter = typeof generateChatResponse;

/**
 * Routes chat input to slash commands or generic model generation.
 */
export class ChatRouter {
  public constructor(
    private readonly context: ChatRouterContext,
    private readonly generateResponse: GenerateChatResponseAdapter = generateChatResponse,
    private readonly generateChapterMetadata?: ChapterMetadataObjectGenerator
  ) {}

  /**
   * Routes one submitted input string.
   */
  public async route(input: string): Promise<ChatRouteResult> {
    const trimmedInput = input.trim();

    if (trimmedInput.startsWith("/")) {
      return this.routeSlashCommand(trimmedInput);
    }

    const result = await this.generateResponse({
      factory: new LLMClientFactory(this.context.settings),
      prompt: trimmedInput,
      tier: this.context.settings.defaultModelTier
    });

    if (!result.ok) {
      return { kind: "error-markdown", message: this.context.t(result.messageKey) };
    }

    return { content: result.markdown, kind: "assistant-markdown" };
  }

  private async routeSlashCommand(input: string): Promise<ChatRouteResult> {
    const parsedCommand = parseSlashCommand(input);

    if (!isRegisteredSlashCommandName(parsedCommand.commandName)) {
      return {
        kind: "error-markdown",
        message: this.context.t("chat.errors.unknownCommand", { command: parsedCommand.commandName })
      };
    }

    const commandContext = {
      app: this.context.app,
      generateResponse: this.generateResponse,
      settings: this.context.settings,
      showModal: false,
      t: this.context.t
    };
    const result = await executeSlashCommand(parsedCommand.commandName, {
      ...commandContext,
      ...(this.generateChapterMetadata ? { generateChapterMetadata: this.generateChapterMetadata } : {})
    }, {
      args: parsedCommand.args,
      rawInput: parsedCommand.rawInput
    });

    if (!result) {
      return { content: "", kind: "programmatic-markdown" };
    }

    if (result.kind === "tool-output") {
      return { kind: "tool-output", output: result.output };
    }

    return { content: result.markdown, kind: "programmatic-markdown" };
  }
}

/**
 * Splits a slash command input into command name and raw arguments.
 */
export const parseSlashCommand = (input: string): ParsedSlashCommand => {
  const trimmedInput = input.trim();
  const [commandName = "", ...argumentParts] = trimmedInput.split(/\s+/u);

  return {
    args: argumentParts.join(" "),
    commandName,
    rawInput: trimmedInput
  };
};

/**
 * Checks whether a parsed command name exists in the command registry.
 */
export const isRegisteredSlashCommandName = (commandName: string): commandName is SlashCommandName => (
  Object.hasOwn(slashCommands, commandName)
);

/**
 * Checks whether a string is a configured model tier.
 */
export const parseModelTierArgument = (value: string): ModelTier | undefined => {
  const trimmedValue = value.trim();

  switch (trimmedValue) {
    case "basic":
    case "local":
    case "thoughtful":
      return trimmedValue;
    default:
      return undefined;
  }
};
