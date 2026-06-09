import { ItemView, type WorkspaceLeaf } from "obsidian";
import { createRoot, type Root } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import { i18n } from "../locales/i18n";
import type LiteraryAssistantPlugin from "../main";
import { AppShell } from "./AppShell";

/**
 * Stable Obsidian view type for the Literary Assistant sidebar.
 */
export const LITERARY_ASSISTANT_VIEW_TYPE = "ai-literary-assistant-view";

/**
 * Obsidian ItemView that owns the React root lifecycle for the sidebar panel.
 */
export class LiteraryAssistantView extends ItemView {
  private reactRoot: Root | null = null;

  public constructor(leaf: WorkspaceLeaf, private readonly plugin: LiteraryAssistantPlugin) {
    super(leaf);
  }

  public override getViewType(): string {
    return LITERARY_ASSISTANT_VIEW_TYPE;
  }

  public override getDisplayText(): string {
    return i18n.t("view.title");
  }

  public override onOpen(): Promise<void> {
    this.contentEl.empty();

    const reactContainer = this.contentEl.createDiv({
      cls: "ai-literary-assistant-view"
    });

    this.reactRoot = createRoot(reactContainer);
    this.reactRoot.render(
      <I18nextProvider i18n={i18n}>
        <AppShell app={this.app} plugin={this.plugin} />
      </I18nextProvider>
    );

    return Promise.resolve();
  }

  public override onClose(): Promise<void> {
    this.reactRoot?.unmount();
    this.reactRoot = null;
    this.contentEl.empty();

    return Promise.resolve();
  }
}
