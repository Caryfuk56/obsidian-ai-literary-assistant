import { type ChangeEvent, type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CHAPTER_METADATA_REVIEW_FIELDS,
  CHAPTER_STATUS_VALUES,
  NARRATIVE_TIME_VALUES
} from "../../chapter-metadata/chapterMetadataContract";
import {
  formatArrayFieldText,
  isChapterMetadataArrayField,
  parseArrayFieldText
} from "../../chapter-metadata/chapterMetadataMerge";
import type { ChapterMetadata, ChapterMetadataReviewState } from "../../chapter-metadata/chapterMetadataTypes";

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
  const { t } = useTranslation();
  const [localReview, setLocalReview] = useState(review);

  useEffect(() => {
    setLocalReview(review);
  }, [review]);

  const toggleEditable = (field: keyof ChapterMetadata): void => {
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
      pendingMetadata: {
        ...currentReview.pendingMetadata,
        [field]: value
      }
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
        {CHAPTER_METADATA_REVIEW_FIELDS.map((field) => (
          <MetadataFieldRow
            editable={localReview.editableFields[field] === true}
            field={field}
            key={field}
            metadata={localReview.pendingMetadata}
            onToggleEdit={() => {
              toggleEditable(field);
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
  field,
  metadata,
  onToggleEdit,
  onUpdate
}: {
  readonly editable: boolean;
  readonly field: keyof ChapterMetadata;
  readonly metadata: ChapterMetadata;
  readonly onToggleEdit: () => void;
  readonly onUpdate: (field: keyof ChapterMetadata, value: ChapterMetadata[keyof ChapterMetadata]) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const value = metadata[field];

  return (
    <div className="ai-metadata-field-row">
      <div className="ai-metadata-field-header">
        <label htmlFor={`metadata-${field}`}>{t(`chapterMetadata.fields.${field}`)}</label>
        <button className="clickable-icon" onClick={onToggleEdit} type="button">
          {t("chapterMetadata.actions.edit")}
        </button>
      </div>
      <MetadataFieldInput
        editable={editable}
        field={field}
        onUpdate={onUpdate}
        value={value}
      />
    </div>
  );
};

const MetadataFieldInput = ({
  editable,
  field,
  onUpdate,
  value
}: {
  readonly editable: boolean;
  readonly field: keyof ChapterMetadata;
  readonly onUpdate: (field: keyof ChapterMetadata, value: ChapterMetadata[keyof ChapterMetadata]) => void;
  readonly value: ChapterMetadata[keyof ChapterMetadata];
}): ReactElement => {
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
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    );
  }

  if (field === "narrative_time") {
    return (
      <select
        disabled={!editable}
        id={`metadata-${field}`}
        onChange={(event) => {
          onUpdate("narrative_time", event.target.value);
        }}
        value={value}
      >
        {NARRATIVE_TIME_VALUES.map((narrativeTime) => (
          <option key={narrativeTime} value={narrativeTime}>{narrativeTime}</option>
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
        value={value}
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
      value={value}
    />
  );
};
