import type { App } from "obsidian";
import type { TFunction } from "i18next";

import type { AureliusSettings } from "../settings/settingsTypes";

/**
 * UI-consumable result returned by chat routing.
 */
export type ChatRouteResult =
  | { content: string; kind: "assistant-markdown" }
  | { content: string; kind: "programmatic-markdown" }
  | { kind: "error-markdown"; message: string };

/**
 * Dependencies needed by the chat router.
 */
export interface ChatRouterContext {
  app: App;
  settings: AureliusSettings;
  t: TFunction;
}

