import type { App, TFile } from "obsidian";
import { type ReactElement, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AttachedFile } from "../chat/attachmentState";

/**
 * File picker panel for selecting files from the current Obsidian vault.
 */
export const VaultFilePicker = ({
  app,
  onAttach
}: {
  readonly app: App;
  readonly onAttach: (file: AttachedFile) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const files = useMemo(() => app.vault.getFiles(), [app]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredFiles = useMemo(
    () => files.filter((file: TFile) => {
      const searchableText = `${file.name} ${file.path}`.toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    }),
    [files, normalizedQuery]
  );

  return (
    <div className="ai-file-picker">
      <input
        aria-label={t("chat.attachments.searchLabel")}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder={t("chat.attachments.searchPlaceholder")}
        type="search"
        value={query}
      />
      <div className="ai-file-picker-list">
        {filteredFiles.length > 0 ? filteredFiles.map((file) => (
          <button
            className="ai-file-picker-item"
            key={file.path}
            onClick={() => {
              onAttach({
                name: file.name,
                path: file.path
              });
            }}
            type="button"
          >
            <span>{file.name}</span>
          </button>
        )) : (
          <div className="ai-file-picker-empty">{t("chat.attachments.empty")}</div>
        )}
      </div>
    </div>
  );
};
