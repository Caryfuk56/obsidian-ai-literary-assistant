import type { QuickActionGroup } from "./quickActionTypes";

/**
 * Source of truth for sidebar quick action groups and items.
 */
export const quickActions = [
  {
    id: "general",
    items: [
      {
        descriptionKey: "quickActions.help.description",
        icon: "help-circle",
        id: "help",
        nameKey: "quickActions.help.name",
        slashCommand: "/help"
      }
    ],
    nameKey: "quickActions.general.name",
    openByDefault: true
  }
] as const satisfies readonly QuickActionGroup[];
