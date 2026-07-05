import { type ChangeEvent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import type { ProjectIndex } from "../../core/types/metadataIndex.types";
import { ObsidianIcon } from "../ObsidianIcon";
import { formatMetadataDisplayValue, valueToText } from "./metadataDisplay";
import type { MetadataFieldDefinition } from "./metadataFieldDefinitions";
import {
  resolveMultiselectReferences,
  type MetadataReferenceResolution
} from "./metadataReferenceResolution";

/**
 * Input renderer for one metadata field definition.
 */
export const MetadataFieldInput = ({
  editable,
  fieldDefinition,
  index,
  language,
  onMissingReference,
  onRemoveMultiselectValue,
  onUpdate,
  value
}: {
  readonly editable: boolean;
  readonly fieldDefinition: MetadataFieldDefinition;
  readonly index: ProjectIndex;
  readonly language: string | undefined;
  readonly onMissingReference: (resolution: MetadataReferenceResolution) => void;
  readonly onRemoveMultiselectValue: (value: string) => void;
  readonly onUpdate: (key: string, value: unknown) => void;
  readonly value: unknown;
}): ReactElement => {
  const { t } = useTranslation();

  if (fieldDefinition.inputType === "textarea") {
    return (
      <textarea
        disabled={!editable}
        id={`metadata-view-${fieldDefinition.key}`}
        onChange={(event) => {
          onUpdate(fieldDefinition.key, event.target.value);
        }}
        rows={3}
        value={formatMetadataDisplayValue({ key: fieldDefinition.key, language, value })}
      />
    );
  }

  if (fieldDefinition.inputType === "select") {
    return (
      <select
        disabled={!editable}
        id={`metadata-view-${fieldDefinition.key}`}
        onChange={(event) => {
          onUpdate(fieldDefinition.key, event.target.value || undefined);
        }}
        value={valueToText(value)}
      >
        <option value="" />
        {fieldDefinition.options?.map((option) => (
          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
        ))}
      </select>
    );
  }

  if (fieldDefinition.inputType === "multiselect") {
    const values = Array.isArray(value) ? value.filter(isString) : [];
    const resolutions = resolveMultiselectReferences(values, fieldDefinition.referenceType, index);

    return (
      <div className="ai-metadata-multiselect" id={`metadata-view-${fieldDefinition.key}`}>
        <div className="ai-metadata-tags">
          {resolutions.map((resolution) => (
            <span
              className={`ai-metadata-tag${resolution.exists ? "" : " is-missing"}`}
              key={resolution.value}
            >
              {resolution.exists ? (
                <span>{resolution.label}</span>
              ) : (
                <button
                  className="ai-metadata-missing-reference"
                  onClick={() => {
                    onMissingReference(resolution);
                  }}
                  type="button"
                >
                  {resolution.label}
                </button>
              )}
              {editable && (
                <button
                  aria-label={t("metadataView.actions.removeValue", { value: resolution.label })}
                  className="ai-metadata-tag-remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveMultiselectValue(resolution.value);
                  }}
                  type="button"
                >
                  <ObsidianIcon icon="x" />
                </button>
              )}
            </span>
          ))}
        </div>
        <input
          disabled={!editable}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }

            event.preventDefault();
            const input = event.currentTarget;
            const nextValue = input.value.trim();

            if (nextValue.length > 0 && !values.includes(nextValue)) {
              onUpdate(fieldDefinition.key, [...values, nextValue]);
              input.value = "";
            }
          }}
          placeholder=""
          type="text"
        />
      </div>
    );
  }

  return (
    <input
      disabled={!editable}
      id={`metadata-view-${fieldDefinition.key}`}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onUpdate(fieldDefinition.key, event.target.value);
      }}
      type="text"
      value={formatMetadataDisplayValue({ key: fieldDefinition.key, language, value })}
    />
  );
};

const isString = (value: unknown): value is string => typeof value === "string";
