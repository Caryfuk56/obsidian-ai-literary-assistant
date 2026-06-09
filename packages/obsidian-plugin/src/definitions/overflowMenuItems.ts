/**
 * Minimal overflow menu action definition prepared for future sidebar actions.
 */
export interface OverflowMenuItem {
  descriptionKey: string;
  id: string;
  nameKey: string;
}

/**
 * Source of truth for the sidebar overflow menu.
 */
export const overflowMenuItems = [
  {
    descriptionKey: "overflowMenu.help.description",
    id: "help",
    nameKey: "overflowMenu.help.name"
  }
] as const satisfies readonly OverflowMenuItem[];
