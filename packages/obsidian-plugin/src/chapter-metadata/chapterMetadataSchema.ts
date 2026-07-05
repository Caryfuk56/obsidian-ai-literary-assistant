import { CHAPTER_METADATA_ARRAY_FIELDS } from "./chapterMetadataContract";
import type { ChapterMetadataSuggestion } from "./chapterMetadataTypes";

/**
 * Object fields expected in a model-generated chapter metadata suggestion.
 */
export const CHAPTER_METADATA_STRING_FIELDS = ["title", "summary", "pov"] as const;

/**
 * Safely validates and normalizes a generated metadata suggestion object after the model call returns.
 */
export const validateChapterMetadataSuggestionObject = (
  value: unknown
): { ok: true; suggestion: ChapterMetadataSuggestion } | { ok: false; validationErrors: string[] } => {
  if (!isRecord(value) || Array.isArray(value)) {
    return { ok: false, validationErrors: ["root: expected object"] };
  }

  const validationErrors: string[] = [];
  const suggestion: ChapterMetadataSuggestion = {
    linked_characters: [],
    linked_history: [],
    linked_items: [],
    linked_locations: [],
    linked_organizations: [],
    linked_plotlines: [],
    linked_systems: [],
    plotlines: [],
    pov: "",
    summary: "",
    title: ""
  };

  for (const field of CHAPTER_METADATA_STRING_FIELDS) {
    const fieldValue = value[field];

    if (fieldValue === undefined || fieldValue === null) {
      suggestion[field] = "";
      continue;
    }

    if (typeof fieldValue !== "string") {
      validationErrors.push(`${field}: expected string`);
      continue;
    }

    suggestion[field] = fieldValue;
  }

  for (const field of CHAPTER_METADATA_ARRAY_FIELDS) {
    const fieldValue = value[field];

    if (fieldValue === undefined || fieldValue === null) {
      suggestion[field] = [];
      continue;
    }

    if (!Array.isArray(fieldValue) || !fieldValue.every((item) => typeof item === "string")) {
      validationErrors.push(`${field}: expected array of strings`);
      continue;
    }

    suggestion[field] = fieldValue;
  }

  if (validationErrors.length > 0) {
    return { ok: false, validationErrors };
  }

  return {
    ok: true,
    suggestion
  };
};

/**
 * Checks whether a linked metadata field name is known.
 */
export const isLinkedMetadataArrayField = (field: string): boolean => (
  CHAPTER_METADATA_ARRAY_FIELDS.includes(field as typeof CHAPTER_METADATA_ARRAY_FIELDS[number])
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);
