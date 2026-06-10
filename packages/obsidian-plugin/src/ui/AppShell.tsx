import { Menu, type App } from "obsidian";
import { type MouseEvent, type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { mainMenuItems, type MainViewId } from "../definitions/mainMenuItems";
import { overflowMenuItems } from "../definitions/overflowMenuItems";
import type LiteraryAssistantPlugin from "../main";
import type { ToolOutput } from "../chapter-metadata/chapterMetadataTypes";
import { ChatPanel } from "./chat/ChatPanel";
import { ObsidianIcon } from "./ObsidianIcon";
import { QuickActionsView } from "./quick-actions/QuickActionsView";
import { ToolOutputPanel } from "./tool-output/ToolOutputPanel";
import { clearToolOutput, setToolOutput } from "./tool-output/toolOutputState";

/**
 * Root React shell for the Literary Assistant sidebar.
 */
export const AppShell = ({
  app,
  plugin
}: {
  readonly app: App;
  readonly plugin: LiteraryAssistantPlugin;
}): ReactElement => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<MainViewId>("chat");
  const [programmaticMarkdown, setProgrammaticMarkdown] = useState<string[]>([]);
  const [toolOutput, setCurrentToolOutput] = useState<ToolOutput | undefined>(undefined);

  const openOverflowMenu = (event: MouseEvent<HTMLButtonElement>): void => {
    const menu = new Menu();

    overflowMenuItems.forEach((item) => {
      menu.addItem((menuItem) => {
        menuItem
          .setTitle(t(item.nameKey))
          .onClick(() => {
            setActiveView("quickActions");
          });
      });
    });

    menu.showAtMouseEvent(event.nativeEvent);
  };

  return (
    <div className="ai-literary-assistant-root">
      <nav aria-label={t("mainMenu.ariaLabel")} className="ai-literary-assistant-menu">
        <div className="ai-literary-assistant-menu-main">
          {mainMenuItems.map((item) => (
            <button
              aria-label={t(item.nameKey)}
              className={`clickable-icon ai-literary-assistant-icon-button${activeView === item.view ? " is-active" : ""}`}
              key={item.id}
              onClick={() => {
                setActiveView(item.view);
              }}
              type="button"
            >
              <ObsidianIcon icon={item.icon} />
            </button>
          ))}
        </div>
        <button
          aria-label={t("overflowMenu.openLabel")}
          className="clickable-icon ai-literary-assistant-icon-button"
          onClick={openOverflowMenu}
          type="button"
        >
          <ObsidianIcon icon="more-vertical" />
        </button>
      </nav>
      <main className="ai-literary-assistant-content">
        {activeView === "chat" ? (
          <ChatPanel
            app={app}
            onToolOutput={(output) => {
              setCurrentToolOutput((currentOutput) => setToolOutput(currentOutput, output));
            }}
            plugin={plugin}
            programmaticMarkdown={programmaticMarkdown}
          />
        ) : (
          <QuickActionsView
            app={app}
            onToolOutput={(output) => {
              setCurrentToolOutput((currentOutput) => setToolOutput(currentOutput, output));
            }}
            plugin={plugin}
            onProgrammaticMarkdown={(markdown) => {
              setProgrammaticMarkdown((currentMarkdown) => [...currentMarkdown, markdown]);
              setActiveView("chat");
            }}
          />
        )}
        <ToolOutputPanel
          app={app}
          onClear={() => {
            const nextOutput = clearToolOutput();
            setCurrentToolOutput(nextOutput);
          }}
          output={toolOutput}
        />
      </main>
    </div>
  );
};
