/**
 * Sidebar view identifiers available from the main menu.
 */
export type MainViewId = "chat" | "quickActions";

/**
 * Definition for one icon-only sidebar main menu item.
 */
export interface MainMenuItem {
  descriptionKey: string;
  icon: string;
  id: string;
  nameKey: string;
  view: MainViewId;
}

/**
 * Source of truth for primary sidebar navigation.
 */
export const mainMenuItems = [
  {
    descriptionKey: "mainMenu.chat.description",
    icon: "message-square",
    id: "chat",
    nameKey: "mainMenu.chat.name",
    view: "chat"
  },
  {
    descriptionKey: "mainMenu.quickActions.description",
    icon: "zap",
    id: "quickActions",
    nameKey: "mainMenu.quickActions.name",
    view: "quickActions"
  }
] as const satisfies readonly MainMenuItem[];
