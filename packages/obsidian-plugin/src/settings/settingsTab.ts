import { PluginSettingTab, Setting, type App } from "obsidian";
import type { TFunction } from "i18next";

import type LiteraryAssistantPlugin from "../main";
import { recommendedModelsByProvider } from "../llm/modelCatalog";
import { llmProviders, modelTiers } from "./defaultSettings";
import type { LlmProviderId, ModelTier } from "./settingsTypes";

const CUSTOM_MODEL_VALUE = "__custom__";

/**
 * Native Obsidian settings tab for LLM providers and model tiers.
 */
export class AureliusSettingTab extends PluginSettingTab {
  public constructor(
    app: App,
    private readonly plugin: LiteraryAssistantPlugin,
    private readonly t: TFunction
  ) {
    super(app, plugin);
  }

  /**
   * Renders settings controls from current plugin settings.
   */
  public override display(): void {
    this.renderSettings();
  }

  private renderSettings(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: this.t("settings.title") });
    containerEl.createEl("p", { cls: "setting-item-description", text: this.t("settings.storageNotice") });

    this.renderApiKeySetting("openAiApiKey", "settings.apiKeys.openAi.label", "settings.apiKeys.openAi.description");
    this.renderApiKeySetting("googleApiKey", "settings.apiKeys.google.label", "settings.apiKeys.google.description");
    this.renderApiKeySetting(
      "openRouterApiKey",
      "settings.apiKeys.openRouter.label",
      "settings.apiKeys.openRouter.description"
    );

    new Setting(containerEl)
      .setName(this.t("settings.ollamaEndpoint.label"))
      .setDesc(this.t("settings.ollamaEndpoint.description"))
      .addText((text) => {
        text
          .setPlaceholder("http://localhost:11434/v1")
          .setValue(this.plugin.settings.ollamaEndpointUrl)
          .onChange(async (value) => {
            this.plugin.settings.ollamaEndpointUrl = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(this.t("settings.defaultTier.label"))
      .setDesc(this.t("settings.defaultTier.description"))
      .addDropdown((dropdown) => {
        modelTiers.forEach((tier) => {
          dropdown.addOption(tier, this.t(`modelTiers.${tier}`));
        });
        dropdown
          .setValue(this.plugin.settings.defaultModelTier)
          .onChange(async (value) => {
            this.plugin.settings.defaultModelTier = value as ModelTier;
            await this.plugin.saveSettings();
          });
      });

    modelTiers.forEach((tier) => {
      this.renderTierSettings(tier);
    });
  }

  private renderApiKeySetting(
    settingKey: "googleApiKey" | "openAiApiKey" | "openRouterApiKey",
    labelKey: string,
    descriptionKey: string
  ): void {
    new Setting(this.containerEl)
      .setName(this.t(labelKey))
      .setDesc(this.t(descriptionKey))
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder(this.t("settings.apiKeys.placeholder"))
          .setValue(this.plugin.settings[settingKey])
          .onChange(async (value) => {
            this.plugin.settings[settingKey] = value;
            await this.plugin.saveSettings();
          });
      });
  }

  private renderTierSettings(tier: ModelTier): void {
    const tierConfig = this.plugin.settings.modelTiers[tier];
    this.containerEl.createEl("h3", { text: this.t(`settings.tiers.${tier}.heading`) });

    new Setting(this.containerEl)
      .setName(this.t("settings.tierProvider.label"))
      .setDesc(this.t("settings.tierProvider.description"))
      .addDropdown((dropdown) => {
        llmProviders.forEach((provider) => {
          dropdown.addOption(provider, this.t(`providers.${provider}`));
        });
        dropdown
          .setValue(tierConfig.provider)
          .onChange(async (value) => {
            const provider = value as LlmProviderId;
            const firstModel = recommendedModelsByProvider[provider][0];
            tierConfig.provider = provider;
            tierConfig.model = firstModel?.id ?? "";
            tierConfig.useCustomModel = false;
            await this.plugin.saveSettings();
            this.renderSettings();
          });
      });

    new Setting(this.containerEl)
      .setName(this.t("settings.tierModel.label"))
      .setDesc(this.t("settings.tierModel.description"))
      .addDropdown((dropdown) => {
        recommendedModelsByProvider[tierConfig.provider].forEach((model) => {
          dropdown.addOption(model.id, this.t(model.labelKey));
        });
        dropdown.addOption(CUSTOM_MODEL_VALUE, this.t("settings.tierModel.customOption"));
        dropdown
          .setValue(tierConfig.useCustomModel ? CUSTOM_MODEL_VALUE : tierConfig.model)
          .onChange(async (value) => {
            tierConfig.useCustomModel = value === CUSTOM_MODEL_VALUE;
            if (!tierConfig.useCustomModel) {
              tierConfig.model = value;
            }
            await this.plugin.saveSettings();
            this.renderSettings();
          });
      });

    if (tierConfig.useCustomModel) {
      new Setting(this.containerEl)
        .setName(this.t("settings.customModel.label"))
        .setDesc(this.t("settings.customModel.description"))
        .addText((text) => {
          text
            .setPlaceholder(this.t("settings.customModel.placeholder"))
            .setValue(tierConfig.customModel)
            .onChange(async (value) => {
              tierConfig.customModel = value;
              await this.plugin.saveSettings();
            });
        });
    }
  }
}
