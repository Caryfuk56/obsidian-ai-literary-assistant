import type { AttachedFile } from "./attachmentState";

/**
 * Chat message variants displayed in the mock chat panel.
 */
export type ChatMessage =
  | { attachments: readonly AttachedFile[]; content: string; id: string; type: "user" }
  | { id: string; type: "ai-loading" }
  | { collapsed: boolean; entries: readonly string[]; id: string; type: "process-log" }
  | { id: string; markdown: string; type: "ai-response" }
  | { id: string; markdown: string; type: "programmatic-markdown" }
  | { id: string; markdown: string; type: "error" };
