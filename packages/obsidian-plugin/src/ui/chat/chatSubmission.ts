import type { SlashCommandContext, SlashCommandResult } from "../../commands/slashCommandTypes";
import { executeSlashCommand } from "../../commands/executeSlashCommand";
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
  messages: ChatMessage[];
}

/**
 * Converts a submitted chat draft into user or programmatic messages.
 */
export const resolveChatSubmission = async ({
  attachedFiles,
  attachmentOnlyMessage,
  content,
  context,
  id
}: {
  readonly attachedFiles: readonly AttachedFile[];
  readonly attachmentOnlyMessage: string;
  readonly content: string;
  readonly context: SlashCommandContext;
  readonly id: string;
}): Promise<ChatSubmissionResult> => {
  const trimmedContent = content.trim();

  if (!trimmedContent && attachedFiles.length === 0) {
    return {
      clearDraft: false,
      messages: []
    };
  }

  if (trimmedContent === "/help") {
    const result = await executeSlashCommand("/help", {
      ...context,
      showModal: false
    });

    return {
      clearDraft: true,
      messages: isMarkdownResult(result)
        ? [
          {
            id,
            markdown: result.markdown,
            type: "programmatic-markdown"
          }
        ]
        : []
    };
  }

  return {
    clearDraft: true,
    messages: [
      {
        attachments: attachedFiles,
        content: trimmedContent || attachmentOnlyMessage,
        id,
        type: "user"
      }
    ]
  };
};

const isMarkdownResult = (result: SlashCommandResult | undefined): result is SlashCommandResult => (
  result?.kind === "markdown"
);
