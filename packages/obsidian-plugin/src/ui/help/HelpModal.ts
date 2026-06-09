import { Component, MarkdownRenderer, Modal } from "obsidian";
import type { App } from "obsidian";

/**
 * Obsidian modal that displays slash command help markdown.
 */
export class HelpModal extends Modal {
  private readonly markdown: string;
  private readonly renderComponent = new Component();

  public constructor(app: App, markdown: string) {
    super(app);
    this.markdown = markdown;
  }

  public override onOpen(): void {
    this.contentEl.empty();
    this.renderComponent.load();
    void MarkdownRenderer.render(this.app, this.markdown, this.contentEl, "", this.renderComponent);
  }

  public override onClose(): void {
    this.renderComponent.unload();
    this.contentEl.empty();
  }
}

/**
 * Opens the slash command help modal.
 */
export const openHelpModal = (app: App, markdown: string): void => {
  new HelpModal(app, markdown).open();
};
