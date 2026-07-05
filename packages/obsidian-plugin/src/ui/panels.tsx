import type { App } from "obsidian";
import type { ReactElement } from "react";

import type { ToolOutput } from "../chapter-metadata/chapterMetadataTypes";
import type { MainViewId } from "../definitions/mainMenuItems";
import type LiteraryAssistantPlugin from "../main";
import { ChatPanel } from "./chat/ChatPanel";
import { MetadataView } from "./metadata/MetadataView";
import { QuickActionsView } from "./quick-actions/QuickActionsView";

/**
 * Runtime context passed to sidebar panel renderers.
 */
export interface SidebarPanelRenderContext {
  app: App;
  hasPendingMetadataReview: boolean;
  metadataRefreshToken: number;
  onProgrammaticMarkdown: (markdown: string) => void;
  onToolOutput: (output: ToolOutput) => void;
  plugin: LiteraryAssistantPlugin;
  programmaticMarkdown: readonly string[];
}

/**
 * Definition for one dynamically rendered sidebar panel.
 */
export interface SidebarPanelDefinition {
  id: MainViewId;
  render: (context: SidebarPanelRenderContext) => ReactElement;
}

/**
 * Dynamic sidebar panels keyed by navigation view id.
 */
export const sidebarPanelDefinitions = [
  {
    id: "chat",
    render: ({ app, onToolOutput, plugin, programmaticMarkdown }) => (
      <ChatPanel
        app={app}
        onToolOutput={onToolOutput}
        plugin={plugin}
        programmaticMarkdown={[...programmaticMarkdown]}
      />
    )
  },
  {
    id: "metadata",
    render: ({ app, hasPendingMetadataReview, metadataRefreshToken, onToolOutput, plugin }) => (
      <MetadataView
        app={app}
        hasPendingMetadataReview={hasPendingMetadataReview}
        onToolOutput={onToolOutput}
        plugin={plugin}
        refreshToken={metadataRefreshToken}
      />
    )
  },
  {
    id: "quickActions",
    render: ({ app, onProgrammaticMarkdown, onToolOutput, plugin }) => (
      <QuickActionsView
        app={app}
        onProgrammaticMarkdown={onProgrammaticMarkdown}
        onToolOutput={onToolOutput}
        plugin={plugin}
      />
    )
  }
] as const satisfies readonly SidebarPanelDefinition[];

/**
 * Returns a sidebar panel definition for a navigation view id.
 */
export const getSidebarPanelDefinition = (
  viewId: MainViewId
): SidebarPanelDefinition | undefined => (
  sidebarPanelDefinitions.find((definition) => definition.id === viewId)
);
