import type { App } from "obsidian";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { SlashCommandResult } from "../../commands/slashCommandTypes";
import type { ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";
import { executeQuickAction } from "../../definitions/executeQuickAction";
import { quickActions } from "../../definitions/quickActions";
import { resolveQuickActionNameKey } from "../../definitions/quickActionMetadata";
import type { QuickActionItem } from "../../definitions/quickActionTypes";
import type LiteraryAssistantPlugin from "../../main";
import { ObsidianIcon } from "../ObsidianIcon";

/**
 * Renders grouped quick actions for common chat commands.
 */
export const QuickActionsView = ({
  app,
  onProgrammaticMarkdown,
  onToolOutput,
  plugin
}: {
  readonly app: App;
  readonly plugin: LiteraryAssistantPlugin;
  readonly onProgrammaticMarkdown: (markdown: string) => void;
  readonly onToolOutput: (output: ToolOutput) => void;
}): ReactElement => {
  const { t } = useTranslation();

  const handleExecute = async (item: QuickActionItem): Promise<void> => {
    let result;

    try {
      result = await executeQuickAction(item, {
        app,
        settings: plugin.settings,
        showModal: true,
        t
      });
    } catch {
      onToolOutput({
        kind: "error",
        message: t("chapterMetadata.errors.extractionFailedWithDebug")
      });
      return;
    }

    if (isMarkdownResult(result)) {
      onProgrammaticMarkdown(result.markdown);
      return;
    }

    if (isToolOutputResult(result)) {
      onToolOutput(result.output);
    }
  };

  return (
    <section aria-label={t("quickActions.ariaLabel")} className="ai-quick-actions">
      {quickActions.map((group) => (
        <details className="ai-quick-action-group" key={group.id} open={group.openByDefault}>
          <summary>{t(group.nameKey)}</summary>
          <div className="ai-quick-action-items">
            {group.items.map((item) => {
              const quickActionItem: QuickActionItem = item;
              const isDisabled = !quickActionItem.slashCommand && !quickActionItem.command;

              return (
                <button
                  className="ai-quick-action-item"
                  disabled={isDisabled}
                  key={item.id}
                  onClick={() => {
                    void handleExecute(quickActionItem);
                  }}
                  type="button"
                >
                  <ObsidianIcon icon={item.icon} />
                  <span>{t(resolveQuickActionNameKey(quickActionItem))}</span>
                </button>
              );
            })}
          </div>
        </details>
      ))}
    </section>
  );
};

const isMarkdownResult = (
  result: SlashCommandResult | undefined
): result is Extract<SlashCommandResult, { kind: "markdown" }> => (
  result?.kind === "markdown"
);

const isToolOutputResult = (
  result: SlashCommandResult | undefined
): result is Extract<SlashCommandResult, { kind: "tool-output" }> => (
  result?.kind === "tool-output"
);
