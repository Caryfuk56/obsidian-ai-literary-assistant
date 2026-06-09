import type { SlashCommandContext } from "../../commands/slashCommandTypes";
import { executeQuickAction } from "../executeQuickAction";
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
    descriptionKey: "quickActions.help.description",
    icon: "help-circle",
    id: "help",
    nameKey: "quickActions.help.name",
    slashCommand: "/help"
  };
  const context = {
    app: {},
    showModal: false,
    t: (key: string) => key
  } as SlashCommandContext;
  const result = await executeQuickAction(item, context);

  assert(result?.kind === "markdown", "Expected slash command quick action to return markdown.");
  assertEqual(customCommandExecuted, false, "Expected custom command not to run when slashCommand exists");
};
