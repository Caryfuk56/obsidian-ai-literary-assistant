import type { SlashCommandContext, SlashCommandResult } from "../commands/slashCommandTypes";
import { executeSlashCommand } from "../commands/executeSlashCommand";
import type { QuickActionItem } from "./quickActionTypes";

/**
 * Executes a quick action, preferring slash command routing over custom commands.
 */
export const executeQuickAction = async (
  item: QuickActionItem,
  context: SlashCommandContext
): Promise<SlashCommandResult | undefined> => {
  if (item.slashCommand) {
    const args = item.presetArgs ?? "";
    const rawInput = args ? `${item.slashCommand} ${args}` : item.slashCommand;

    return executeSlashCommand(item.slashCommand, context, {
      args,
      rawInput
    });
  }

  if (item.command) {
    await Promise.resolve(item.command());
  }

  return undefined;
};
