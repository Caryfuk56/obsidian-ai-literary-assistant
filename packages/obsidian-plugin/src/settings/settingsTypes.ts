/**
 * Stable model tier names exposed in settings and slash commands.
 */
export type ModelTier = "thoughtful" | "basic" | "local";

/**
 * LLM providers supported by the connectivity proof.
 */
export type LlmProviderId = "openai" | "google" | "openrouter" | "ollama";

/**
 * User-configurable model selection for one model tier.
 */
export interface ModelTierConfig {
  customModel: string;
  model: string;
  provider: LlmProviderId;
  useCustomModel: boolean;
}

/**
 * Persistent plugin settings stored through Obsidian plugin data.
 */
export interface AureliusSettings {
  anthropicApiKey?: string;
  defaultModelTier: ModelTier;
  googleApiKey: string;
  groqApiKey?: string;
  mistralApiKey?: string;
  modelTiers: Record<ModelTier, ModelTierConfig>;
  ollamaEndpointUrl: string;
  openAiApiKey: string;
  openRouterApiKey: string;
}
