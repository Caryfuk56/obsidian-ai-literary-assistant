import { generateText } from "ai";

import type { ModelTier } from "../settings/settingsTypes";
import type { LLMClientFactory } from "./llmClientFactory";

/**
 * Safe result returned by the non-streaming chat generation adapter.
 */
export type GenerateChatResponseResult =
  | { markdown: string; ok: true }
  | { messageKey: string; ok: false };

/**
 * Minimal prompt used until a full literary prompt architecture exists.
 */
export const MINIMAL_AURELIUS_SYSTEM_PROMPT = "You are Aurelius, a concise literary assistant inside Obsidian.";

/**
 * Sends one non-streaming chat prompt to the configured model tier.
 */
export const generateChatResponse = async ({
  factory,
  prompt,
  system = MINIMAL_AURELIUS_SYSTEM_PROMPT,
  tier
}: {
  readonly factory: LLMClientFactory;
  readonly prompt: string;
  readonly system?: string;
  readonly tier: ModelTier;
}): Promise<GenerateChatResponseResult> => {
  const modelResult = factory.createModel(tier);

  if (!modelResult.ok) {
    return { messageKey: modelResult.messageKey, ok: false };
  }

  try {
    const result = await generateText({
      model: modelResult.model,
      prompt,
      system
    });

    return { markdown: result.text, ok: true };
  } catch {
    return { messageKey: "chat.errors.genericLlmFailure", ok: false };
  }
};

