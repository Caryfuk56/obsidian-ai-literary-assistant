import { type ReactElement, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ObsidianIcon } from "../ObsidianIcon";

/**
 * Shared header for metadata panel states.
 */
export const MetadataPanelHeader = ({
  actions,
  disabled,
  filePath,
  onRefresh
}: {
  readonly actions?: ReactNode;
  readonly disabled: boolean;
  readonly filePath: string | undefined;
  readonly onRefresh: () => void;
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <header className="ai-metadata-panel-header">
      <div>
        <h2>{t("metadataView.title")}</h2>
        <p>{filePath ?? t("metadataView.emptyPath")}</p>
      </div>
      <div className="ai-metadata-header-actions">
        {actions}
        <button disabled={disabled} onClick={onRefresh} type="button">
          <ObsidianIcon icon="refresh-cw" />
          <span>{t("metadataView.actions.refresh")}</span>
        </button>
      </div>
    </header>
  );
};
