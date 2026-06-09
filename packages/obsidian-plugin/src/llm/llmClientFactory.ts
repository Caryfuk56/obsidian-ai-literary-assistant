import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

import { isModelTier } from "../settings/defaultSettings";
import type { AureliusSettings, LlmProviderId, ModelTier } from "../settings/settingsTypes";
import { resolveModelTier } from "./modelTierResolution";

/**
 * Stable validation error codes returned before making network calls.
 */
export type LlmFactoryErrorCode =
  | "missing-api-key"
  | "missing-endpoint"
  | "missing-model"
  | "missing-tier"
  | "unsupported-provider";

/**
 * Result of resolving a settings tier into an AI SDK language model.
 */
export type LlmModelResult =
  | { model: LanguageModel; modelId: string; ok: true; provider: LlmProviderId; tier: ModelTier }
  | { code: LlmFactoryErrorCode; messageKey: string; ok: false };

/**
 * Creates configured AI SDK language models from plugin settings.
 */
export class LLMClientFactory {
  public constructor(private readonly settings: AureliusSettings) {}

  /**
   * Resolves a model tier into a provider-specific AI SDK language model.
   */
  public createModel(tier: ModelTier): LlmModelResult {
    if (!isModelTier(tier)) {
      return { code: "missing-tier", messageKey: "llm.errors.missingTier", ok: false };
    }

    const resolvedTier = resolveModelTier(this.settings, tier);

    if (!resolvedTier) {
      return { code: "missing-tier", messageKey: "llm.errors.missingTier", ok: false };
    }

    if (!resolvedTier.modelId) {
      return { code: "missing-model", messageKey: "llm.errors.missingModel", ok: false };
    }

    switch (resolvedTier.provider) {
      case "openai":
        return this.createOpenAiModel(resolvedTier.modelId, tier);
      case "google":
        return this.createGoogleModel(resolvedTier.modelId, tier);
      case "openrouter":
        return this.createOpenRouterModel(resolvedTier.modelId, tier);
      case "ollama":
        return this.createOllamaModel(resolvedTier.modelId, tier);
    }
  }

  private createOpenAiModel(modelId: string, tier: ModelTier): LlmModelResult {
    if (!this.settings.openAiApiKey.trim()) {
      return { code: "missing-api-key", messageKey: "llm.errors.missingOpenAiKey", ok: false };
    }

    const provider = createOpenAI({ apiKey: this.settings.openAiApiKey.trim() });

    return { model: provider(modelId), modelId, ok: true, provider: "openai", tier };
  }

  private createGoogleModel(modelId: string, tier: ModelTier): LlmModelResult {
    if (!this.settings.googleApiKey.trim()) {
      return { code: "missing-api-key", messageKey: "llm.errors.missingGoogleKey", ok: false };
    }

    const provider = createGoogleGenerativeAI({ apiKey: this.settings.googleApiKey.trim() });

    return { model: provider(modelId), modelId, ok: true, provider: "google", tier };
  }

  private createOllamaModel(modelId: string, tier: ModelTier): LlmModelResult {
    const baseURL = this.settings.ollamaEndpointUrl.trim();

    if (!baseURL) {
      return { code: "missing-endpoint", messageKey: "llm.errors.missingOllamaEndpoint", ok: false };
    }

    const provider = createOpenAICompatible({
      baseURL,
      name: "ollama"
    });

    return { model: provider.chatModel(modelId), modelId, ok: true, provider: "ollama", tier };
  }

  private createOpenRouterModel(modelId: string, tier: ModelTier): LlmModelResult {
    if (!this.settings.openRouterApiKey.trim()) {
      return { code: "missing-api-key", messageKey: "llm.errors.missingOpenRouterKey", ok: false };
    }

    const provider = createOpenAICompatible({
      apiKey: this.settings.openRouterApiKey.trim(),
      baseURL: "https://openrouter.ai/api/v1",
      name: "openrouter"
    });

    return { model: provider.chatModel(modelId), modelId, ok: true, provider: "openrouter", tier };
  }
}
