import { parseModelTierArgument } from "../chat/ChatRouter";
import { generateChatResponse } from "../llm/generateChatResponse";
import { LLMClientFactory } from "../llm/llmClientFactory";
import type { SlashCommandContext, SlashCommandExecutionInput, SlashCommandResult } from "./slashCommandTypes";

/**
 * Exact prompt used by `/test-llm` for provider connectivity checks.
 */
export const TEST_LLM_PROMPT = "Respond exactly with: Connection successful";

/**
 * Executes `/test-llm [tier]` against the explicitly requested model tier.
 */
export const executeTestLlmCommand = async (
  context: SlashCommandContext,
  input: SlashCommandExecutionInput
): Promise<SlashCommandResult> => {
  const tier = parseModelTierArgument(input.args);

  if (!tier) {
    return {
      kind: "markdown",
      markdown: context.t("slashCommands.testLlm.invalidTier")
    };
  }

  const responseGenerator = context.generateResponse ?? generateChatResponse;
  const result = await responseGenerator({
    factory: new LLMClientFactory(context.settings),
    prompt: TEST_LLM_PROMPT,
    tier
  });

  if (!result.ok) {
    return {
      kind: "markdown",
      markdown: context.t(result.messageKey)
    };
  }

  return {
    kind: "markdown",
    markdown: result.markdown
  };
};
