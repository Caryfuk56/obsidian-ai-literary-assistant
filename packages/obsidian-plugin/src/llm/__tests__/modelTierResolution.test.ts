import { DEFAULT_AURELIUS_SETTINGS, cloneSettings } from "../../settings/defaultSettings";
import { assert, assertEqual } from "../../testUtils";
import { resolveModelTier } from "../modelTierResolution";

/**
 * Verifies that recommended model tier selection resolves the configured model.
 */
export const testRecommendedModelResolution = (): void => {
  const resolved = resolveModelTier(DEFAULT_AURELIUS_SETTINGS, "basic");

  assert(resolved !== undefined, "Expected basic tier to resolve.");
  if (resolved) {
    assertEqual(resolved.modelId, "gemini-2.5-flash", "Expected basic tier to use recommended Gemini model");
    assertEqual(resolved.provider, "google", "Expected basic tier to use Google provider");
  }
};

/**
 * Verifies that custom model text overrides recommended model selection.
 */
export const testCustomModelResolution = (): void => {
  const settings = cloneSettings(DEFAULT_AURELIUS_SETTINGS);
  settings.modelTiers.thoughtful.useCustomModel = true;
  settings.modelTiers.thoughtful.customModel = "custom-model";
  const resolved = resolveModelTier(settings, "thoughtful");

  assert(resolved !== undefined, "Expected thoughtful tier to resolve.");
  if (resolved) {
    assertEqual(resolved.modelId, "custom-model", "Expected custom model to override recommended model");
  }
};
