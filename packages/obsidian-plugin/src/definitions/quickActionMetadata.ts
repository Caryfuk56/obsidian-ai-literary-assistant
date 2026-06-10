import { slashCommands } from "../commands/slashCommands";
import type { QuickActionItem } from "./quickActionTypes";

/**
 * Resolves display metadata for command-backed quick actions.
 */
export const resolveQuickActionNameKey = (item: QuickActionItem): string => {
  if (item.nameKey) {
    return item.nameKey;
  }

  return item.slashCommand ? slashCommands[item.slashCommand].nameKey : "";
};

/**
 * Resolves description metadata for command-backed quick actions.
 */
export const resolveQuickActionDescriptionKey = (item: QuickActionItem): string => {
  if (item.descriptionKey) {
    return item.descriptionKey;
  }

  return item.slashCommand ? slashCommands[item.slashCommand].descriptionKey : "";
};
