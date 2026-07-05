import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { LiteraryMetadata } from "../../core/metadata/metadataSchema";
import type { ProjectIndex } from "../../core/types/metadataIndex.types";
import { ObsidianIcon } from "../ObsidianIcon";
import { MetadataFieldInput } from "./MetadataFieldInput";
import type { MetadataFieldDefinition } from "./metadataFieldDefinitions";
import type { MetadataReferenceResolution } from "./metadataReferenceResolution";

/**
 * Renders one labeled metadata field row and its field actions.
 */
export const MetadataFieldRow = ({
  editable,
  fieldDefinition,
  index,
  language,
  metadata,
  onAiAction,
  onMissingReference,
  onRemoveMultiselectValue,
  onToggleEdit,
  onUpdate
}: {
  readonly editable: boolean;
  readonly fieldDefinition: MetadataFieldDefinition;
  readonly index: ProjectIndex;
  readonly language: string | undefined;
  readonly metadata: LiteraryMetadata;
  readonly onAiAction: () => Promise<void>;
  readonly onMissingReference: (resolution: MetadataReferenceResolution) => void;
  readonly onRemoveMultiselectValue: (value: string) => void;
  readonly onToggleEdit: () => void;
  readonly onUpdate: (key: string, value: unknown) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const value = getMetadataValue(metadata, fieldDefinition.key);

  return (
    <div className="ai-metadata-field-row">
      <div className="ai-metadata-field-header">
        <label htmlFor={`metadata-view-${fieldDefinition.key}`}>{t(fieldDefinition.labelKey)}</label>
        <div className="ai-metadata-field-actions">
          {fieldDefinition.aiAction && (
            <button className="clickable-icon" onClick={() => void onAiAction()} type="button">
              <ObsidianIcon icon="sparkles" />
            </button>
          )}
          <button
            className="clickable-icon"
            disabled={!fieldDefinition.editable}
            onClick={onToggleEdit}
            type="button"
          >
            <ObsidianIcon icon={editable ? "lock-open" : "square-pen"} />
          </button>
        </div>
      </div>
      <MetadataFieldInput
        editable={editable}
        fieldDefinition={fieldDefinition}
        index={index}
        language={language}
        onMissingReference={onMissingReference}
        onRemoveMultiselectValue={onRemoveMultiselectValue}
        onUpdate={onUpdate}
        value={value}
      />
    </div>
  );
};

const getMetadataValue = (metadata: LiteraryMetadata, key: string): unknown => Reflect.get(metadata, key);
