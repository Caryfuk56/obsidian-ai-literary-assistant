import type { ChatRouteResult } from "../../chat/chatRouterTypes";
import type { AttachedFile } from "./attachmentState";
import type { ChatMessage } from "./chatState";

/**
 * Constants for chat draft textarea sizing.
 */
export const CHAT_TEXTAREA_MIN_ROWS = 3;

/**
 * Maximum visible rows before the chat draft textarea scrolls internally.
 */
export const CHAT_TEXTAREA_MAX_ROWS = 10;

/**
 * Pixel height used for one chat draft textarea row.
 */
export const CHAT_TEXTAREA_ROW_HEIGHT = 20;

/**
 * Result of handling a chat draft submission.
 */
export interface ChatSubmissionResult {
  clearDraft: boolean;
  inputForRouter: string;
  messages: ChatMessage[];
}

/**
 * Converts a submitted chat draft into immediate user/loading messages.
 */
export const resolveChatSubmission = ({
  attachedFiles,
  attachmentOnlyMessage,
  content,
  id
}: {
  readonly attachedFiles: readonly AttachedFile[];
  readonly attachmentOnlyMessage: string;
  readonly content: string;
  readonly id: string;
}): ChatSubmissionResult => {
  const trimmedContent = content.trim();

  if (!trimmedContent && attachedFiles.length === 0) {
    return {
      clearDraft: false,
      inputForRouter: "",
      messages: []
    };
  }

  return {
    clearDraft: true,
    inputForRouter: trimmedContent || attachmentOnlyMessage,
    messages: [
      {
        attachments: attachedFiles,
        content: trimmedContent || attachmentOnlyMessage,
        id,
        type: "user"
      },
      {
        id: `${id}-loading`,
        type: "ai-loading"
      }
    ]
  };
};

/**
 * Converts a router result into a display message.
 */
export const chatRouteResultToMessage = (result: ChatRouteResult, id: string): ChatMessage => {
  switch (result.kind) {
    case "assistant-markdown":
      return {
        id,
        markdown: result.content,
        type: "ai-response"
      };
    case "programmatic-markdown":
      return {
        id,
        markdown: result.content,
        type: "programmatic-markdown"
      };
    case "error-markdown":
      return {
        id,
        markdown: result.message,
        type: "error"
      };
    case "tool-output":
      return {
        id,
        markdown: "",
        type: "programmatic-markdown"
      };
  }
};
