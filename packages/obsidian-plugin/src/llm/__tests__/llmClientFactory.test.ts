import { DEFAULT_AURELIUS_SETTINGS, cloneSettings } from "../../settings/defaultSettings";
import { assertEqual } from "../../testUtils";
import { LLMClientFactory } from "../llmClientFactory";

/**
 * Verifies that missing provider API keys are reported before generation.
 */
export const testMissingApiKeyValidation = (): void => {
  const openAiResult = new LLMClientFactory(DEFAULT_AURELIUS_SETTINGS).createModel("thoughtful");
  const googleResult = new LLMClientFactory(DEFAULT_AURELIUS_SETTINGS).createModel("basic");
  const openRouterSettings = {
    ...DEFAULT_AURELIUS_SETTINGS,
    modelTiers: {
      ...DEFAULT_AURELIUS_SETTINGS.modelTiers,
      basic: {
        ...DEFAULT_AURELIUS_SETTINGS.modelTiers.basic,
        provider: "openrouter" as const
      }
    }
  };
  const openRouterResult = new LLMClientFactory(openRouterSettings).createModel("basic");

  assertEqual(openAiResult.ok, false, "Expected OpenAI model creation without a key to fail");
  assertEqual(googleResult.ok, false, "Expected Google model creation without a key to fail");
  assertEqual(openRouterResult.ok, false, "Expected OpenRouter model creation without a key to fail");
};

/**
 * Verifies that local provider requires an endpoint.
 */
export const testMissingOllamaEndpointValidation = (): void => {
  const settings = cloneSettings(DEFAULT_AURELIUS_SETTINGS);
  settings.ollamaEndpointUrl = "";
  const result = new LLMClientFactory(settings).createModel("local");

  assertEqual(result.ok, false, "Expected Ollama model creation without endpoint to fail");
};
