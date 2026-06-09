import { Notice, Plugin } from "obsidian";

import { initializeI18n, i18n } from "./locales/i18n";
import { DEFAULT_AURELIUS_SETTINGS, mergeSettings } from "./settings/defaultSettings";
import { AureliusSettingTab } from "./settings/settingsTab";
import type { AureliusSettings } from "./settings/settingsTypes";
import { LITERARY_ASSISTANT_VIEW_TYPE, LiteraryAssistantView } from "./ui/LiteraryAssistantView";

/**
 * Main Obsidian plugin class for AI Literary Assistant.
 */
export default class LiteraryAssistantPlugin extends Plugin {
  public override settings: AureliusSettings = DEFAULT_AURELIUS_SETTINGS;

  public override async onload(): Promise<void> {
    await initializeI18n();
    await this.loadSettings();

    this.registerView(
      LITERARY_ASSISTANT_VIEW_TYPE,
      (leaf) => new LiteraryAssistantView(leaf, this)
    );

    this.addSettingTab(new AureliusSettingTab(this.app, this, i18n.t.bind(i18n)));

    this.addCommand({
      id: "open-literary-assistant",
      name: i18n.t("plugin.openViewCommand"),
      callback: () => {
        void this.activateView();
      }
    });

    new Notice(i18n.t("plugin.noticeLoaded"));
  }

  public override onunload(): void {
    this.app.workspace.detachLeavesOfType(LITERARY_ASSISTANT_VIEW_TYPE);
    new Notice(i18n.t("plugin.noticeUnloaded"));
  }

  /**
   * Loads plugin settings from Obsidian plugin data.
   */
  public async loadSettings(): Promise<void> {
    this.settings = mergeSettings(await this.loadData() as Partial<AureliusSettings> | null);
  }

  /**
   * Persists plugin settings through Obsidian plugin data.
   */
  public async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async activateView(): Promise<void> {
    const existingLeaf = this.app.workspace.getLeavesOfType(LITERARY_ASSISTANT_VIEW_TYPE)[0];

    if (existingLeaf) {
      await this.app.workspace.revealLeaf(existingLeaf);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);

    if (!leaf) {
      return;
    }

    await leaf.setViewState({
      active: true,
      type: LITERARY_ASSISTANT_VIEW_TYPE
    });

    await this.app.workspace.revealLeaf(leaf);
  }
}
