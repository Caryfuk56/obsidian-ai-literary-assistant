import { mainMenuItems } from "../mainMenuItems";
import { assert } from "../../testUtils";

/**
 * Verifies that required initial sidebar views are present.
 */
export const testMainMenuContainsInitialViews = (): void => {
  const views = new Set(mainMenuItems.map((item) => item.view));

  assert(views.has("chat"), "Expected main menu to contain the chat view.");
  assert(views.has("quickActions"), "Expected main menu to contain the quick actions view.");
};
