import { type ChangeEvent, type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CHAPTER_STATUS_VALUES } from "../../chapter-metadata/chapterMetadataContract";
import {
  formatArrayFieldText,
  isChapterMetadataArrayField,
  parseArrayFieldText
} from "../../chapter-metadata/chapterMetadataMerge";
import type { ChapterMetadata, ChapterMetadataReviewState } from "../../chapter-metadata/chapterMetadataTypes";
import { formatMetadataDisplayValue, valueToText } from "../metadata/metadataDisplay";
import {
  getChapterMetadataReviewFieldDefinitions,
  getChapterStatusLabelKey,
  updateChapterReviewMetadataField,
  type ChapterMetadataReviewFieldDefinition
} from "./chapterMetadataReviewFields";

/**
 * Interactive review form for approved chapter metadata.
 */
export const MetadataReviewForm = ({
  onApprove,
  onCancel,
  review
}: {
  readonly onApprove: (review: ChapterMetadataReviewState) => void;
  readonly onCancel: () => void;
  readonly review: ChapterMetadataReviewState;
}): ReactElement => {
  const { i18n, t } = useTranslation();
  const [localReview, setLocalReview] = useState(review);
  const fieldDefinitions = getChapterMetadataReviewFieldDefinitions();

  useEffect(() => {
    setLocalReview(review);
  }, [review]);

  const toggleEditable = (field: keyof ChapterMetadata): void => {
    const fieldDefinition = fieldDefinitions.find((definition) => definition.key === field);

    if (!fieldDefinition?.editable) {
      return;
    }

    setLocalReview((currentReview) => ({
      ...currentReview,
      editableFields: {
        ...currentReview.editableFields,
        [field]: !currentReview.editableFields[field]
      }
    }));
  };

  const updateField = (field: keyof ChapterMetadata, value: ChapterMetadata[keyof ChapterMetadata]): void => {
    setLocalReview((currentReview) => ({
      ...currentReview,
      pendingMetadata: updateChapterReviewMetadataField(currentReview.pendingMetadata, field, value)
    }));
  };

  return (
    <form
      className="ai-metadata-review"
      onSubmit={(event) => {
        event.preventDefault();
        onApprove(localReview);
      }}
    >
      <h2>{t("chapterMetadata.title")}</h2>
      <div className="ai-metadata-review-fields">
        {fieldDefinitions.map((fieldDefinition) => (
          <MetadataFieldRow
            editable={fieldDefinition.editable && localReview.editableFields[fieldDefinition.key] === true}
            fieldDefinition={fieldDefinition}
            key={fieldDefinition.key}
            language={i18n.resolvedLanguage ?? i18n.language}
            metadata={localReview.pendingMetadata}
            onToggleEdit={() => {
              toggleEditable(fieldDefinition.key);
            }}
            onUpdate={updateField}
          />
        ))}
      </div>
      <div className="ai-tool-output-actions">
        <button type="submit">{t("chapterMetadata.actions.approveAndWrite")}</button>
        <button onClick={onCancel} type="button">{t("chapterMetadata.actions.cancel")}</button>
      </div>
    </form>
  );
};

const MetadataFieldRow = ({
  editable,
  fieldDefinition,
  language,
  metadata,
  onToggleEdit,
  onUpdate
}: {
  readonly editable: boolean;
  readonly fieldDefinition: ChapterMetadataReviewFieldDefinition;
  readonly language: string | undefined;
  readonly metadata: ChapterMetadata;
  readonly onToggleEdit: () => void;
  readonly onUpdate: (field: keyof ChapterMetadata, value: ChapterMetadata[keyof ChapterMetadata]) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const field = fieldDefinition.key;
  const value = metadata[field];

  return (
    <div className="ai-metadata-field-row">
      <div className="ai-metadata-field-header">
        <label htmlFor={`metadata-${field}`}>{t(fieldDefinition.labelKey)}</label>
        {fieldDefinition.editable && (
          <button className="clickable-icon" onClick={onToggleEdit} type="button">
            {t("chapterMetadata.actions.edit")}
          </button>
        )}
      </div>
      <MetadataFieldInput
        editable={editable}
        fieldDefinition={fieldDefinition}
        language={language}
        onUpdate={onUpdate}
        value={value}
      />
    </div>
  );
};

const MetadataFieldInput = ({
  editable,
  fieldDefinition,
  language,
  onUpdate,
  value
}: {
  readonly editable: boolean;
  readonly fieldDefinition: ChapterMetadataReviewFieldDefinition;
  readonly language: string | undefined;
  readonly onUpdate: (field: keyof ChapterMetadata, value: ChapterMetadata[keyof ChapterMetadata]) => void;
  readonly value: ChapterMetadata[keyof ChapterMetadata];
}): ReactElement => {
  const { t } = useTranslation();
  const field = fieldDefinition.key;

  if (!fieldDefinition.editable) {
    return (
      <span className="ai-metadata-readonly-value" id={`metadata-${field}`}>
        {formatMetadataDisplayValue({ key: field, language, value })}
      </span>
    );
  }

  if (field === "status") {
    const statusValue = typeof value === "string" ? value : "";
    const hasCustomStatus = statusValue !== "" && !CHAPTER_STATUS_VALUES.includes(statusValue as never);

    return (
      <select
        disabled={!editable}
        id={`metadata-${field}`}
        onChange={(event) => {
          onUpdate("status", event.target.value);
        }}
        value={statusValue}
      >
        {hasCustomStatus && <option value={statusValue}>{statusValue}</option>}
        {CHAPTER_STATUS_VALUES.map((status) => (
          <option key={status} value={status}>{t(getChapterStatusLabelKey(status))}</option>
        ))}
      </select>
    );
  }

  if (isChapterMetadataArrayField(field)) {
    const arrayValue = Array.isArray(value) ? value : [];

    return (
      <textarea
        disabled={!editable}
        id={`metadata-${field}`}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          onUpdate(field, parseArrayFieldText(event.target.value));
        }}
        rows={Math.max(2, arrayValue.length)}
        value={formatArrayFieldText(arrayValue)}
      />
    );
  }

  if (field === "summary") {
    return (
      <textarea
        disabled={!editable}
        id={`metadata-${field}`}
        onChange={(event) => {
          onUpdate(field, event.target.value);
        }}
        rows={3}
        value={valueToText(value)}
      />
    );
  }

  return (
    <input
      disabled={!editable}
      id={`metadata-${field}`}
      onChange={(event) => {
        onUpdate(field, event.target.value);
      }}
      type="text"
      value={valueToText(value)}
    />
  );
};
