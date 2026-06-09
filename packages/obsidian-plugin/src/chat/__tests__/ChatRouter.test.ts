import type { App } from "obsidian";
import type { TFunction } from "i18next";

import { ChatRouter, parseSlashCommand } from "../ChatRouter";
import { DEFAULT_AURELIUS_SETTINGS, cloneSettings } from "../../settings/defaultSettings";
import { assertEqual } from "../../testUtils";

const t = ((key: string, options?: Record<string, string>): string => {
  if (key === "chat.errors.unknownCommand") {
    return `Unknown command: ${options?.["command"] ?? ""}`;
  }

  const translations: Record<string, string> = {
    "slashCommands.help.description": "Show available slash commands.",
    "slashCommands.help.markdownIntro": "These commands can be used from chat input or quick actions.",
    "slashCommands.help.markdownTitle": "Available slash commands",
    "slashCommands.help.name": "Help",
    "slashCommands.testLlm.description": "Test LLM connection.",
    "slashCommands.testLlm.name": "Test LLM"
  };

  return translations[key] ?? key;
}) as TFunction;

/**
 * Verifies slash command parsing.
 */
export const testSlashCommandParsing = (): void => {
  const parsed = parseSlashCommand("  /test-llm   local  ");

  assertEqual(parsed.commandName, "/test-llm", "Expected command name to parse");
  assertEqual(parsed.args, "local", "Expected command args to parse");
};

/**
 * Verifies unknown slash commands return a localized error result.
 */
export const testUnknownSlashCommandHandling = async (): Promise<void> => {
  const router = new ChatRouter({
    app: {} as App,
    settings: DEFAULT_AURELIUS_SETTINGS,
    t
  });
  const result = await router.route("/missing");

  assertEqual(result.kind, "error-markdown", "Expected unknown slash command to return an error result");
};

/**
 * Verifies generic chat uses the configured default model tier.
 */
export const testGenericChatUsesDefaultTier = async (): Promise<void> => {
  const settings = cloneSettings(DEFAULT_AURELIUS_SETTINGS);
  settings.defaultModelTier = "local";
  const router = new ChatRouter({
    app: {} as App,
    settings,
    t
  }, ({ tier }) => Promise.resolve({
    markdown: `tier:${tier}`,
    ok: true
  }));
  const result = await router.route("Hello");

  assertEqual(result.kind, "assistant-markdown", "Expected generic chat to return assistant markdown");
  assertEqual(result.kind === "assistant-markdown" ? result.content : "", "tier:local", "Expected default tier to be used");
};
