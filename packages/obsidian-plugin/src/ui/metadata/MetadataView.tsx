import { Notice, type App } from "obsidian";
import { type ReactElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";
import { executeSlashCommand } from "../../commands/executeSlashCommand";
import { LiteraryMetadataSchema, type LiteraryMetadata } from "../../core/metadata/metadataSchema";
import type LiteraryAssistantPlugin from "../../main";
import { ObsidianIcon } from "../ObsidianIcon";
import {
  getMetadataFieldDefinitions,
  isEditableField,
  removeMultiselectValue,
  updateMetadataDraftField,
  type MetadataFieldDefinition
} from "./metadataFieldDefinitions";
import { createOrOpenMetadataPlaceholder } from "./metadataPlaceholder";
import { CreateMetadataButton } from "./CreateMetadataButton";
import { hasMetadataDraftChanges } from "./metadataDisplay";
import { MetadataFieldRow } from "./MetadataFieldRow";
import { MetadataPanelHeader } from "./MetadataPanelHeader";
import { type MetadataReferenceResolution } from "./metadataReferenceResolution";
import { useActiveMetadata } from "./useActiveMetadata";

/**
 * Dynamic metadata editor for the active Markdown file.
 */
export const MetadataView = ({
  app,
  onToolOutput,
  plugin,
  refreshToken = 0,
  hasPendingMetadataReview = false
}: {
  readonly app: App;
  readonly hasPendingMetadataReview?: boolean;
  readonly onToolOutput: (output: ToolOutput) => void;
  readonly plugin: LiteraryAssistantPlugin;
  readonly refreshToken?: number;
}): ReactElement => {
  const { i18n, t } = useTranslation();
  const [editableFields, setEditableFields] = useState<ReadonlySet<string>>(new Set());
  const [editAll, setEditAll] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusKey, setStatusKey] = useState<string | undefined>(undefined);
  const [operationErrorKey, setOperationErrorKey] = useState<string | undefined>(undefined);
  const resetPanelState = useCallback(() => {
    setEditableFields(new Set());
    setEditAll(false);
    setStatusKey(undefined);
    setOperationErrorKey(undefined);
  }, []);
  const {
    activeFile,
    draftMetadata,
    errorKey,
    loadActiveMetadata,
    originalMetadata,
    setDraftMetadata,
    setOriginalMetadata,
    stateKind
  } = useActiveMetadata({
    app,
    onBeforeLoad: resetPanelState,
    refreshToken
  });

  const toggleFieldEditable = (key: string): void => {
    setEditableFields((currentFields) => {
      const nextFields = new Set(currentFields);

      if (nextFields.has(key)) {
        nextFields.delete(key);
      } else {
        nextFields.add(key);
      }

      return nextFields;
    });
  };

  const updateField = (key: string, value: unknown): void => {
    setDraftMetadata((currentMetadata) => (
      currentMetadata ? updateMetadataDraftField(currentMetadata, key, value) : currentMetadata
    ));
  };

  const saveMetadata = async (): Promise<void> => {
    if (!activeFile || !draftMetadata) {
      return;
    }

    const nextMetadata = {
      ...draftMetadata,
      updatedAt: new Date().toISOString()
    };
    const validationResult = LiteraryMetadataSchema.safeParse(nextMetadata);

    if (!validationResult.success) {
      setOperationErrorKey("metadataView.errors.invalidDraft");
      return;
    }

    setIsBusy(true);
    setOperationErrorKey(undefined);

    try {
      const fieldDefinitions = getMetadataFieldDefinitions(validationResult.data.type);

      await app.fileManager.processFrontMatter(activeFile, (frontmatter: Record<string, unknown>) => {
        fieldDefinitions.forEach((fieldDefinition) => {
          const value = getMetadataValue(validationResult.data, fieldDefinition.key);

          if (value === undefined || value === "" || isEmptyArray(value)) {
            Reflect.deleteProperty(frontmatter, fieldDefinition.key);
            return;
          }

          frontmatter[fieldDefinition.key] = value;
        });
      });
      await plugin.metadataIndexesService.create();
      setDraftMetadata(validationResult.data);
      setOriginalMetadata(validationResult.data);
      setEditableFields(new Set());
      setEditAll(false);
      setStatusKey("metadataView.notices.saved");
      new Notice(t("metadataView.notices.saved"));
    } catch {
      setOperationErrorKey("metadataView.errors.saveFailed");
    } finally {
      setIsBusy(false);
    }
  };

  const generateChapterMetadata = async (): Promise<void> => {
    setIsBusy(true);
    setOperationErrorKey(undefined);

    try {
      const result = await executeSlashCommand("/chapter_metadata", {
        app,
        settings: plugin.settings,
        showModal: true,
        t
      });

      if (result?.kind === "tool-output") {
        onToolOutput(result.output);
      }
    } catch {
      setOperationErrorKey("metadataView.errors.generateFailed");
    } finally {
      setIsBusy(false);
    }
  };

  const handleMissingReference = async (
    fieldDefinition: MetadataFieldDefinition,
    resolution: MetadataReferenceResolution
  ): Promise<void> => {
    if (!fieldDefinition.referenceType || resolution.exists) {
      return;
    }

    setIsBusy(true);
    setOperationErrorKey(undefined);

    try {
      await createOrOpenMetadataPlaceholder({
        app,
        label: resolution.label,
        type: fieldDefinition.referenceType
      });
      await plugin.metadataIndexesService.create();
    } catch {
      setOperationErrorKey("metadataView.errors.placeholderFailed");
    } finally {
      setIsBusy(false);
    }
  };

  if (!draftMetadata) {
    return (
      <section aria-label={t("metadataView.ariaLabel")} className="ai-metadata-panel">
        <MetadataPanelHeader
          disabled={isBusy}
          filePath={activeFile?.path}
          onRefresh={() => loadActiveMetadata()}
        />
        <p className="ai-metadata-panel-message">{t(errorKey ?? "metadataView.errors.invalidMetadata")}</p>
        {activeFile && stateKind === "no-frontmatter" && !hasPendingMetadataReview && (
          <CreateMetadataButton
            app={app}
            disabled={isBusy}
            onGenerationFinished={async () => {
              setOperationErrorKey(undefined);
            }}
            onGenerationOutput={onToolOutput}
            plugin={plugin}
          />
        )}
      </section>
    );
  }

  const fieldDefinitions = getMetadataFieldDefinitions(draftMetadata.type);
  const canGenerateByAi = draftMetadata.type === "chapter";
  const hasUnsavedChanges = hasMetadataDraftChanges({
    draft: draftMetadata,
    fieldDefinitions,
    original: originalMetadata
  });

  return (
    <section aria-label={t("metadataView.ariaLabel")} className="ai-metadata-panel">
      <MetadataPanelHeader
        actions={(
          <button
            disabled={isBusy}
            onClick={() => {
              setEditAll((currentValue) => !currentValue);
            }}
            type="button"
          >
            <ObsidianIcon icon="square-pen" />
            <span>{t(editAll ? "metadataView.actions.stopEditing" : "metadataView.actions.editAll")}</span>
          </button>
        )}
        disabled={isBusy}
        filePath={activeFile?.path}
        onRefresh={() => loadActiveMetadata()}
      />
      {statusKey && <p className="ai-metadata-panel-message is-success">{t(statusKey)}</p>}
      {operationErrorKey && <p className="ai-metadata-panel-message is-error">{t(operationErrorKey)}</p>}
      <form
        className="ai-metadata-form"
        onSubmit={(event) => {
          event.preventDefault();
          void saveMetadata();
        }}
      >
        <div className="ai-metadata-fields">
          {fieldDefinitions.map((fieldDefinition) => (
            <MetadataFieldRow
              editable={isEditableField(fieldDefinition, editableFields, editAll)}
              fieldDefinition={fieldDefinition}
              index={plugin.metadataIndexesService.getIndex()}
              language={i18n.resolvedLanguage ?? i18n.language}
              key={fieldDefinition.key}
              metadata={draftMetadata}
              onAiAction={generateChapterMetadata}
              onMissingReference={(resolution) => {
                void handleMissingReference(fieldDefinition, resolution);
              }}
              onRemoveMultiselectValue={(value) => {
                const currentValue = getMetadataValue(draftMetadata, fieldDefinition.key);
                const arrayValue = Array.isArray(currentValue) ? currentValue.filter(isString) : [];

                updateField(fieldDefinition.key, removeMultiselectValue(arrayValue, value));
              }}
              onToggleEdit={() => {
                toggleFieldEditable(fieldDefinition.key);
              }}
              onUpdate={updateField}
            />
          ))}
        </div>
        <div className="ai-metadata-actions">
          <button disabled={isBusy || !hasUnsavedChanges} type="submit">
            <ObsidianIcon icon="save" />
            <span>{t("metadataView.actions.save")}</span>
          </button>
          <button disabled={isBusy || !canGenerateByAi} onClick={() => void generateChapterMetadata()} type="button">
            <ObsidianIcon icon="sparkles" />
            <span>{t("metadataView.actions.generateByAi")}</span>
          </button>
        </div>
      </form>
    </section>
  );
};

const getMetadataValue = (metadata: LiteraryMetadata, key: string): unknown => Reflect.get(metadata, key);

const isString = (value: unknown): value is string => typeof value === "string";

const isEmptyArray = (value: unknown): boolean => Array.isArray(value) && value.length === 0;

export default MetadataView;
