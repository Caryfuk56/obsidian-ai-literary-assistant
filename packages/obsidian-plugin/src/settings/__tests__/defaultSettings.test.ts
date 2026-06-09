import type { AureliusSettings } from "../settingsTypes";
import { DEFAULT_AURELIUS_SETTINGS, mergeSettings, modelTiers } from "../defaultSettings";
import { assert, assertEqual } from "../../testUtils";

/**
 * Verifies that default settings contain every configured model tier.
 */
export const testDefaultSettingsContainModelTiers = (): void => {
  modelTiers.forEach((tier) => {
    assert(Object.hasOwn(DEFAULT_AURELIUS_SETTINGS.modelTiers, tier), `Expected default settings to include ${tier}.`);
  });
  assertEqual(DEFAULT_AURELIUS_SETTINGS.defaultModelTier, "basic", "Expected basic to be the default model tier");
  assertEqual(DEFAULT_AURELIUS_SETTINGS.openAiApiKey, "", "Expected OpenAI key to default to empty");
  assertEqual(DEFAULT_AURELIUS_SETTINGS.googleApiKey, "", "Expected Google key to default to empty");
  assertEqual(DEFAULT_AURELIUS_SETTINGS.openRouterApiKey, "", "Expected OpenRouter key to default to empty");
};

/**
 * Verifies that saved partial settings are merged with new defaults.
 */
export const testMergeSettingsPreservesDefaults = (): void => {
  const merged = mergeSettings({
    modelTiers: {
      basic: {
        customModel: "custom-basic",
        useCustomModel: true
      }
    }
  } as unknown as Partial<AureliusSettings>);

  assertEqual(merged.modelTiers.basic.customModel, "custom-basic", "Expected saved custom model to survive merge");
  assertEqual(merged.modelTiers.basic.useCustomModel, true, "Expected saved custom model flag to survive merge");
  assertEqual(merged.modelTiers.local.provider, "ollama", "Expected missing local tier to use defaults");
};

/**
 * Verifies malformed persisted settings cannot poison runtime string fields.
 */
export const testMergeSettingsNormalizesMalformedValues = (): void => {
  const merged = mergeSettings({
    googleApiKey: null,
    modelTiers: {
      thoughtful: {
        customModel: null,
        model: null,
        provider: "openrouter",
        useCustomModel: true
      }
    },
    openRouterApiKey: 42
  } as unknown as Partial<AureliusSettings>);

  assertEqual(merged.googleApiKey, "", "Expected malformed Google key to normalize to default");
  assertEqual(merged.openRouterApiKey, "", "Expected malformed OpenRouter key to normalize to default");
  assertEqual(merged.modelTiers.thoughtful.customModel, "", "Expected malformed custom model to normalize to default");
  assertEqual(merged.modelTiers.thoughtful.model, "gpt-5.1", "Expected malformed model to normalize to default");
  assertEqual(merged.modelTiers.thoughtful.provider, "openrouter", "Expected valid OpenRouter provider to survive merge");
};
