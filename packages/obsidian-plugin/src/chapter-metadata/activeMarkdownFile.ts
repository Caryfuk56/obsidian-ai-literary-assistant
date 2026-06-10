import type { App, TFile } from "obsidian";

import type { ActiveMarkdownFileResult } from "./chapterMetadataTypes";

/**
 * Returns the active Markdown file or a typed failure.
 */
export const getActiveMarkdownFile = (app: App): ActiveMarkdownFileResult<TFile> => {
  const file = app.workspace.getActiveFile();

  if (file?.extension.toLowerCase() !== "md") {
    return { code: "no-active-markdown-file", ok: false };
  }

  return { file, ok: true };
};
