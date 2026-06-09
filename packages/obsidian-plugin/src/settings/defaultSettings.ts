import type { AureliusSettings, LlmProviderId, ModelTier, ModelTierConfig } from "./settingsTypes";

/**
 * Ordered model tiers used by settings UI and validation.
 */
export const modelTiers = ["thoughtful", "basic", "local"] as const satisfies readonly ModelTier[];

/**
 * Provider identifiers currently supported for generation.
 */
export const llmProviders = ["openai", "google", "openrouter", "ollama"] as const satisfies readonly LlmProviderId[];

/**
 * Default persistent settings for a fresh plugin install.
 */
export const DEFAULT_AURELIUS_SETTINGS: AureliusSettings = {
  anthropicApiKey: "",
  defaultModelTier: "basic",
  googleApiKey: "",
  groqApiKey: "",
  mistralApiKey: "",
  modelTiers: {
    basic: {
      customModel: "",
      model: "gemini-2.5-flash",
      provider: "google",
      useCustomModel: false
    },
    local: {
      customModel: "",
      model: "llama3.1",
      provider: "ollama",
      useCustomModel: false
    },
    thoughtful: {
      customModel: "",
      model: "gpt-5.1",
      provider: "openai",
      useCustomModel: false
    }
  },
  ollamaEndpointUrl: "http://localhost:11434/v1",
  openAiApiKey: "",
  openRouterApiKey: ""
};

/**
 * Merges partial saved data with current defaults.
 */
export const mergeSettings = (savedSettings: Partial<AureliusSettings> | null | undefined): AureliusSettings => {
  const base = cloneSettings(DEFAULT_AURELIUS_SETTINGS);

  if (!isRecord(savedSettings)) {
    return base;
  }

  return {
    anthropicApiKey: normalizeString(savedSettings.anthropicApiKey, base.anthropicApiKey),
    defaultModelTier: isModelTier(savedSettings.defaultModelTier) ? savedSettings.defaultModelTier : base.defaultModelTier,
    googleApiKey: normalizeString(savedSettings.googleApiKey, base.googleApiKey),
    groqApiKey: normalizeString(savedSettings.groqApiKey, base.groqApiKey),
    mistralApiKey: normalizeString(savedSettings.mistralApiKey, base.mistralApiKey),
    modelTiers: mergeModelTiers(savedSettings.modelTiers),
    ollamaEndpointUrl: normalizeString(savedSettings.ollamaEndpointUrl, base.ollamaEndpointUrl),
    openAiApiKey: normalizeString(savedSettings.openAiApiKey, base.openAiApiKey),
    openRouterApiKey: normalizeString(savedSettings.openRouterApiKey, base.openRouterApiKey)
  };
};

/**
 * Creates a writable copy of settings data.
 */
export const cloneSettings = (settings: AureliusSettings): AureliusSettings => ({
  ...settings,
  modelTiers: {
    basic: { ...settings.modelTiers.basic },
    local: { ...settings.modelTiers.local },
    thoughtful: { ...settings.modelTiers.thoughtful }
  }
});

const mergeModelTiers = (
  savedTiers: unknown
): Record<ModelTier, ModelTierConfig> => {
  const tiers = cloneSettings(DEFAULT_AURELIUS_SETTINGS).modelTiers;

  modelTiers.forEach((tier) => {
    const savedTier = isRecord(savedTiers) && isRecord(savedTiers[tier]) ? savedTiers[tier] : undefined;

    if (!savedTier) {
      return;
    }

    tiers[tier] = {
      provider: isLlmProviderId(savedTier["provider"]) ? savedTier["provider"] : tiers[tier].provider,
      customModel: normalizeString(savedTier["customModel"], tiers[tier].customModel),
      model: normalizeString(savedTier["model"], tiers[tier].model),
      useCustomModel: savedTier["useCustomModel"] === true
    };
  });

  return tiers;
};

/**
 * Checks whether a value is a known model tier.
 */
export const isModelTier = (value: unknown): value is ModelTier => (
  typeof value === "string" && modelTiers.includes(value as ModelTier)
);

/**
 * Checks whether a value is a supported provider id.
 */
export const isLlmProviderId = (value: unknown): value is LlmProviderId => (
  typeof value === "string" && llmProviders.includes(value as LlmProviderId)
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);

const normalizeString = (value: unknown, fallback = ""): string => (
  typeof value === "string" ? value : fallback
);
