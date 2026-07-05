import {
  CHAPTER_METADATA_ARRAY_FIELDS,
  CHAPTER_METADATA_SUGGESTION_STRING_FIELDS,
  isChapterStatus
} from "./chapterMetadataContract";
import type { ChapterMetadata, ChapterMetadataSuggestion } from "./chapterMetadataTypes";
import { validateChapterMetadataSuggestionObject } from "./chapterMetadataSchema";
import { ChapterMetadataSchema } from "../core/metadata/metadataSchema";

/**
 * Result of strict AI metadata validation.
 */
export type ChapterMetadataValidationResult =
  | { ok: true; suggestion: ChapterMetadataSuggestion }
  | { code: "invalid-json" | "invalid-shape" | "invalid-status"; ok: false };

/**
 * Parses and validates raw model output as a chapter metadata suggestion.
 */
export const parseChapterMetadataSuggestion = (rawOutput: string): ChapterMetadataValidationResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    return { code: "invalid-json", ok: false };
  }

  if (!isRecord(parsed) || Array.isArray(parsed)) {
    return { code: "invalid-shape", ok: false };
  }

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

  for (const field of CHAPTER_METADATA_SUGGESTION_STRING_FIELDS) {
    const value = parsed[field];
    suggestion[field] = typeof value === "string" ? value : "";
  }

  for (const field of CHAPTER_METADATA_ARRAY_FIELDS) {
    const value = parsed[field];

    if (value === undefined) {
      suggestion[field] = [];
      continue;
    }

    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
      return { code: "invalid-shape", ok: false };
    }

    suggestion[field] = value;
  }

  const schemaResult = validateChapterMetadataSuggestionObject(suggestion);

  if (!schemaResult.ok) {
    return { code: "invalid-shape", ok: false };
  }

  return { ok: true, suggestion: schemaResult.suggestion };
};

/**
 * Validates complete approved chapter metadata before frontmatter writing.
 */
export const validateApprovedChapterMetadata = (metadata: ChapterMetadata): ChapterMetadataValidationResult => {
  if (!isChapterStatus(metadata.status)) {
    return { code: "invalid-status", ok: false };
  }

  for (const field of CHAPTER_METADATA_ARRAY_FIELDS) {
    if (!Array.isArray(metadata[field]) || !metadata[field].every((item) => typeof item === "string")) {
      return { code: "invalid-shape", ok: false };
    }
  }

  if (!ChapterMetadataSchema.safeParse(metadata).success) {
    return { code: "invalid-shape", ok: false };
  }

  return {
    ok: true,
    suggestion: {
      linked_characters: metadata.linked_characters,
      linked_history: metadata.linked_history,
      linked_items: metadata.linked_items,
      linked_locations: metadata.linked_locations,
      linked_organizations: metadata.linked_organizations,
      linked_plotlines: metadata.linked_plotlines,
      linked_systems: metadata.linked_systems,
      plotlines: metadata.plotlines,
      pov: metadata.pov,
      summary: metadata.summary,
      title: metadata.title
    }
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);
