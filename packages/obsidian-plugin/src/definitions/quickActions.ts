import type { QuickActionGroup } from "./quickActionTypes";

/**
 * Source of truth for sidebar quick action groups and items.
 */
export const quickActions = [
  {
    id: "general",
    items: [
      {
        icon: "file-search",
        id: "chapter-metadata",
        slashCommand: "/chapter_metadata"
      },
      {
        icon: "help-circle",
        id: "help",
        slashCommand: "/help"
      }
    ],
    nameKey: "quickActions.general.name",
    openByDefault: true
  }
] as const satisfies readonly QuickActionGroup[];
