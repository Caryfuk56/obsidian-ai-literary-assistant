import type { LlmProviderId } from "../settings/settingsTypes";

/**
 * Recommended model option shown before the custom model setting.
 */
export interface RecommendedModel {
  id: string;
  labelKey: string;
}

/**
 * Recommended models by supported provider.
 */
export const recommendedModelsByProvider: Record<LlmProviderId, readonly RecommendedModel[]> = {
  google: [
    { id: "gemini-2.5-flash", labelKey: "models.gemini25Flash" },
    { id: "gemini-2.5-pro", labelKey: "models.gemini25Pro" }
  ],
  ollama: [
    { id: "llama3.1", labelKey: "models.llama31" },
    { id: "mistral", labelKey: "models.mistralLocal" }
  ],
  openai: [
    { id: "gpt-5.1", labelKey: "models.gpt51" },
    { id: "gpt-5-mini", labelKey: "models.gpt5Mini" }
  ],
  openrouter: [
    { id: "openai/gpt-5.1", labelKey: "models.openRouterGpt51" },
    { id: "google/gemini-2.5-flash", labelKey: "models.openRouterGemini25Flash" },
    { id: "anthropic/claude-sonnet-4.5", labelKey: "models.openRouterClaudeSonnet45" }
  ]
};
