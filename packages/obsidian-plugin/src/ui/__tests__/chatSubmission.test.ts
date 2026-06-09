import type { TFunction } from "i18next";

import type { SlashCommandContext } from "../../commands/slashCommandTypes";
import { assert, assertEqual } from "../../testUtils";
import { resolveChatSubmission } from "../chat/chatSubmission";

const t = ((key: string): string => {
  const translations: Record<string, string> = {
    "slashCommands.help.description": "Show available slash commands.",
    "slashCommands.help.markdownIntro": "These commands can be used from chat input or quick actions.",
    "slashCommands.help.markdownTitle": "Available slash commands",
    "slashCommands.help.name": "Help"
  };

  return translations[key] ?? key;
}) as TFunction;

/**
 * Verifies that chat slash command submissions create programmatic markdown.
 */
export const testChatSubmissionExecutesHelpSlashCommand = async (): Promise<void> => {
  const context = {
    app: {},
    showModal: false,
    t
  } as SlashCommandContext;
  const result = await resolveChatSubmission({
    attachedFiles: [],
    attachmentOnlyMessage: "Attachment only",
    content: "/help",
    context,
    id: "programmatic-help"
  });

  assertEqual(result.clearDraft, true, "Expected slash command submission to clear the draft");
  assertEqual(result.messages.length, 1, "Expected one programmatic response");
  assert(result.messages[0]?.type === "programmatic-markdown", "Expected help output to be programmatic markdown.");
};
