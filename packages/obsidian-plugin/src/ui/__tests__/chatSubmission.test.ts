import { assert, assertEqual } from "../../testUtils";
import { chatRouteResultToMessage, resolveChatSubmission } from "../chat/chatSubmission";

/**
 * Verifies that chat submissions create user and loading messages before routing.
 */
export const testChatSubmissionCreatesUserAndLoadingMessages = (): void => {
  const result = resolveChatSubmission({
    attachedFiles: [],
    attachmentOnlyMessage: "Attachment only",
    content: "/help",
    id: "programmatic-help"
  });

  assertEqual(result.clearDraft, true, "Expected slash command submission to clear the draft");
  assertEqual(result.inputForRouter, "/help", "Expected slash command to be routed");
  assertEqual(result.messages.length, 2, "Expected immediate user and loading messages");
  assert(result.messages[0]?.type === "user", "Expected submitted text to be shown as a user message.");
  assert(result.messages[1]?.type === "ai-loading", "Expected a loading message while routing.");
};

/**
 * Verifies router results become display messages.
 */
export const testChatRouteResultCreatesProgrammaticMarkdown = (): void => {
  const message = chatRouteResultToMessage({
    content: "Help",
    kind: "programmatic-markdown"
  }, "help-result");

  assertEqual(message.type, "programmatic-markdown", "Expected programmatic router output to stay programmatic");
};
