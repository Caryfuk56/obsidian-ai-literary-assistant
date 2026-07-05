import { Notice, type App } from "obsidian";
import { type ChangeEvent, type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";
import { executeSlashCommand } from "../../commands/executeSlashCommand";
import { METADATA_TYPES, type MetadataType } from "../../core/types/metadata.types";
import type LiteraryAssistantPlugin from "../../main";
import { ObsidianIcon } from "../ObsidianIcon";

/**
 * Props for the reusable metadata creation control.
 */
export interface CreateMetadataButtonProps {
  readonly app: App;
  readonly disabled?: boolean;
  readonly onGenerationFinished?: () => void | Promise<void>;
  readonly onGenerationOutput: (output: ToolOutput) => void;
  readonly plugin: LiteraryAssistantPlugin;
}

/**
 * Reusable control for starting metadata generation for the active file.
 */
export const CreateMetadataButton = ({
  app,
  disabled = false,
  onGenerationFinished,
  onGenerationOutput,
  plugin
}: CreateMetadataButtonProps): ReactElement => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<MetadataType>("chapter");
  const [isGenerating, setIsGenerating] = useState(false);
  const isDisabled = disabled || isGenerating;

  const createMetadata = async (): Promise<void> => {
    if (selectedType !== "chapter") {
      new Notice(t("metadataView.create.notImplemented"));
      return;
    }

    setIsGenerating(true);

    try {
      const result = await executeSlashCommand("/chapter_metadata", {
        app,
        settings: plugin.settings,
        showModal: true,
        t
      });

      if (result?.kind === "tool-output") {
        onGenerationOutput(result.output);
      }

      await onGenerationFinished?.();
    } catch {
      new Notice(t("metadataView.create.failed"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="ai-metadata-create">
      <h3>{t("metadataView.create.title")}</h3>
      <div className="ai-metadata-create-controls">
        <label htmlFor="metadata-create-type">{t("metadataView.create.typeLabel")}</label>
        <select
          disabled={isDisabled}
          id="metadata-create-type"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setSelectedType(event.target.value as MetadataType);
          }}
          value={selectedType}
        >
          {METADATA_TYPES.map((metadataType) => (
            <option key={metadataType} value={metadataType}>
              {t(`metadataTypes.${metadataType}`)}
            </option>
          ))}
        </select>
        <button disabled={isDisabled} onClick={() => void createMetadata()} type="button">
          {isGenerating ? (
            <span aria-label={t("metadataView.create.loadingLabel")} className="ai-metadata-spinner" />
          ) : (
            <ObsidianIcon icon="sparkles" />
          )}
          <span>{t("metadataView.create.button")}</span>
        </button>
      </div>
      {isGenerating && (
        <p className="ai-metadata-panel-message">{t("metadataView.create.generating")}</p>
      )}
    </section>
  );
};
