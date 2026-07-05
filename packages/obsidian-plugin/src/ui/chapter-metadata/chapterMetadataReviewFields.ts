import type { ChapterMetadata } from "../../chapter-metadata/chapterMetadataTypes";
import {
  CHAPTER_METADATA_ARRAY_FIELDS,
  CHAPTER_METADATA_REVIEW_FIELDS,
} from "../../chapter-metadata/chapterMetadataContract";

/**
 * Input control types supported by chapter metadata review fields.
 */
export type ChapterMetadataReviewInputType = "array" | "date" | "select" | "text" | "textarea";

/**
 * UI definition for one chapter metadata review field.
 */
export interface ChapterMetadataReviewFieldDefinition {
  editable: boolean;
  inputType: ChapterMetadataReviewInputType;
  key: keyof ChapterMetadata;
  labelKey: string;
}

/**
 * Chapter review fields that must remain protected from direct review-form edits.
 */
export const PROTECTED_CHAPTER_REVIEW_FIELDS = [
  "type",
  "id",
  "version",
  "createdAt",
  "updatedAt"
] as const satisfies readonly (keyof ChapterMetadata)[];

/**
 * Returns true when a chapter review field is protected.
 */
export const isProtectedChapterReviewField = (
  field: keyof ChapterMetadata
): boolean => PROTECTED_CHAPTER_REVIEW_FIELDS.includes(field as never);

/**
 * Returns chapter metadata review field definitions in display order.
 */
export const getChapterMetadataReviewFieldDefinitions = (): readonly ChapterMetadataReviewFieldDefinition[] => (
  CHAPTER_METADATA_REVIEW_FIELDS.map((field) => ({
    editable: !isProtectedChapterReviewField(field),
    inputType: getReviewInputType(field),
    key: field,
    labelKey: `chapterMetadata.fields.${field}`
  }))
);

/**
 * Safely updates editable chapter review metadata fields.
 */
export const updateChapterReviewMetadataField = (
  metadata: ChapterMetadata,
  field: keyof ChapterMetadata,
  value: ChapterMetadata[keyof ChapterMetadata]
): ChapterMetadata => {
  if (isProtectedChapterReviewField(field)) {
    return metadata;
  }

  return {
    ...metadata,
    [field]: value
  };
};

/**
 * Returns the i18n label key for a chapter status value.
 */
export const getChapterStatusLabelKey = (status: string): string => `metadataOptions.chapterStatus.${status}`;

const getReviewInputType = (field: keyof ChapterMetadata): ChapterMetadataReviewInputType => {
  if (field === "createdAt" || field === "updatedAt") {
    return "date";
  }

  if (field === "status") {
    return "select";
  }

  if (field === "summary") {
    return "textarea";
  }

  if (isArrayReviewField(field)) {
    return "array";
  }

  return "text";
};

const isArrayReviewField = (field: keyof ChapterMetadata): boolean => (
  CHAPTER_METADATA_ARRAY_FIELDS.includes(field as typeof CHAPTER_METADATA_ARRAY_FIELDS[number])
);
