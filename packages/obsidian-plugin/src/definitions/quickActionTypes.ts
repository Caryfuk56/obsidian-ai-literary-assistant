import type { SlashCommandName } from "../commands/slashCommandTypes";

/**
 * One executable item inside a quick action group.
 */
export interface QuickActionItem {
  command?: () => unknown;
  descriptionKey: string;
  icon: string;
  id: string;
  nameKey: string;
  slashCommand?: SlashCommandName;
}

/**
 * Accordion group for related quick actions.
 */
export interface QuickActionGroup {
  id: string;
  items: readonly QuickActionItem[];
  nameKey: string;
  openByDefault: boolean;
}
