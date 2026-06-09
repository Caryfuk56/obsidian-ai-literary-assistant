import type { TFunction } from "i18next";

import type { AttachedFile } from "./attachmentState";

/**
 * Chat message variants displayed in the mock chat panel.
 */
export type ChatMessage =
  | { attachments: readonly AttachedFile[]; content: string; id: string; type: "user" }
  | { id: string; type: "ai-loading" }
  | { collapsed: boolean; entries: readonly string[]; id: string; type: "process-log" }
  | { id: string; markdown: string; type: "ai-response" }
  | { id: string; markdown: string; type: "programmatic-markdown" };

/**
 * Creates the initial non-persistent mock chat conversation.
 */
export const createMockChatMessages = (t: TFunction): ChatMessage[] => [
  {
    attachments: [
      {
        name: t("chat.mock.attachmentName"),
        path: "Drafts/chapter-one.md"
      }
    ],
    content: t("chat.mock.userMessage"),
    id: "mock-user",
    type: "user"
  },
  {
    id: "mock-loading",
    type: "ai-loading"
  },
  {
    collapsed: false,
    entries: [
      t("chat.mock.processLog.reading"),
      t("chat.mock.processLog.pacing"),
      t("chat.mock.processLog.preparing")
    ],
    id: "mock-log",
    type: "process-log"
  },
  {
    id: "mock-ai",
    markdown: t("chat.mock.aiResponse"),
    type: "ai-response"
  }
];
