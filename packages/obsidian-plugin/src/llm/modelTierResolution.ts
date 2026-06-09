import { isModelTier } from "../settings/defaultSettings";
import type { AureliusSettings, LlmProviderId, ModelTier } from "../settings/settingsTypes";

/**
 * Resolved provider/model pair for a model tier.
 */
export interface ResolvedModelTier {
  modelId: string;
  provider: LlmProviderId;
  tier: ModelTier;
}

/**
 * Resolves a configured tier to the exact provider and model id to use.
 */
export const resolveModelTier = (
  settings: AureliusSettings,
  tier: ModelTier
): ResolvedModelTier | undefined => {
  if (!isModelTier(tier)) {
    return undefined;
  }

  const tierConfig = settings.modelTiers[tier];
  const modelId = tierConfig.useCustomModel ? tierConfig.customModel.trim() : tierConfig.model.trim();

  return {
    modelId,
    provider: tierConfig.provider,
    tier
  };
};

