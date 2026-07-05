import { mainMenuItems } from "../mainMenuItems";
import { assert } from "../../testUtils";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Verifies that required initial sidebar views are present.
 */
export const testMainMenuContainsInitialViews = (): void => {
  const views = new Set(mainMenuItems.map((item) => item.view));

  assert(views.has("chat"), "Expected main menu to contain the chat view.");
  assert(views.has("metadata"), "Expected main menu to contain the metadata view.");
  assert(views.has("quickActions"), "Expected main menu to contain the quick actions view.");
};

/**
 * Verifies each main menu view is represented by a dynamic sidebar panel.
 */
export const testMainMenuViewsHaveSidebarPanels = (): void => {
  const panelsSource = readFileSync(join(process.cwd(), "src", "ui", "panels.tsx"), "utf8");

  mainMenuItems.forEach((item) => {
    assert(
      panelsSource.includes(`id: "${item.view}"`),
      `Expected sidebar panel definition for ${item.view}.`
    );
  });
};
