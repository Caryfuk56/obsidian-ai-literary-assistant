import type { SlashCommandContext } from "../../commands/slashCommandTypes";
import { DEFAULT_AURELIUS_SETTINGS } from "../../settings/defaultSettings";
import { executeQuickAction } from "../executeQuickAction";
import { resolveQuickActionDescriptionKey, resolveQuickActionNameKey } from "../quickActionMetadata";
import type { QuickActionItem } from "../quickActionTypes";
import { assert, assertEqual } from "../../testUtils";

/**
 * Verifies that quick actions prefer slash commands over custom commands.
 */
export const testQuickActionPrefersSlashCommand = async (): Promise<void> => {
  let customCommandExecuted = false;
  const item: QuickActionItem = {
    command: () => {
      customCommandExecuted = true;
    },
    icon: "help-circle",
    id: "help",
    slashCommand: "/help"
  };
  const context = {
    app: {},
    settings: DEFAULT_AURELIUS_SETTINGS,
    showModal: false,
    t: (key: string) => key
  } as SlashCommandContext;
  const result = await executeQuickAction(item, context);

  assert(result?.kind === "markdown", "Expected slash command quick action to return markdown.");
  assertEqual(customCommandExecuted, false, "Expected custom command not to run when slashCommand exists");
};

/**
 * Verifies command-backed quick actions inherit display metadata.
 */
export const testQuickActionMetadataFallsBackToCommand = (): void => {
  const item: QuickActionItem = {
    icon: "help-circle",
    id: "help",
    slashCommand: "/help"
  };

  assertEqual(resolveQuickActionNameKey(item), "slashCommands.help.name", "Expected name key fallback");
  assertEqual(resolveQuickActionDescriptionKey(item), "slashCommands.help.description", "Expected description key fallback");
};

/**
 * Verifies quick action preset args are passed to slash command execution.
 */
export const testQuickActionPassesPresetArgs = async (): Promise<void> => {
  const item: QuickActionItem = {
    icon: "bolt",
    id: "test-llm-local",
    presetArgs: "local",
    slashCommand: "/test-llm"
  };
  let capturedTier = "";
  const context = {
    app: {},
    generateResponse: ({ tier }) => {
      capturedTier = tier;

      return Promise.resolve({
        markdown: "ok",
        ok: true
      });
    },
    settings: DEFAULT_AURELIUS_SETTINGS,
    showModal: false,
    t: (key: string) => key
  } as SlashCommandContext;
  const result = await executeQuickAction(item, context);

  assertEqual(capturedTier, "local", "Expected preset args to reach slash command input");
  assertEqual(result?.kind, "markdown", "Expected preset quick action to execute command");
};
