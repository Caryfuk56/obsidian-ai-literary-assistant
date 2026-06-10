import type { ChapterMetadata, ChapterStatus, NarrativeTime } from "./chapterMetadataTypes";

/**
 * Ordered status values accepted by chapter metadata.
 */
export const CHAPTER_STATUS_VALUES = [
  "writing",
  "draft",
  "stylistic_correction",
  "language_correction",
  "done"
] as const satisfies readonly ChapterStatus[];

/**
 * Ordered narrative time values accepted by chapter metadata.
 */
export const NARRATIVE_TIME_VALUES = [
  "ráno",
  "den",
  "večer",
  "noc",
  "neurčeno"
] as const satisfies readonly NarrativeTime[];

/**
 * Array metadata fields rendered as one value per line in review UI.
 */
export const CHAPTER_METADATA_ARRAY_FIELDS = [
  "linked_plotlines",
  "linked_characters",
  "linked_organizations",
  "linked_systems",
  "linked_locations",
  "linked_items",
  "linked_history"
] as const satisfies readonly (keyof ChapterMetadata)[];

/**
 * String metadata fields suggested by the model.
 */
export const CHAPTER_METADATA_SUGGESTION_STRING_FIELDS = [
  "title",
  "summary",
  "pov"
] as const;

/**
 * Ordered fields displayed in the metadata review form.
 */
export const CHAPTER_METADATA_REVIEW_FIELDS = [
  "type",
  "id",
  "metadata_created",
  "metadata_updated",
  "title",
  "summary",
  "pov",
  "status",
  "narrative_time",
  "timeline_position",
  "spoiler_level",
  "linked_plotlines",
  "linked_characters",
  "linked_organizations",
  "linked_systems",
  "linked_locations",
  "linked_items",
  "linked_history"
] as const satisfies readonly (keyof ChapterMetadata)[];

/**
 * Tests whether a value is an allowed chapter status.
 */
export const isChapterStatus = (value: unknown): value is ChapterStatus => (
  typeof value === "string" && CHAPTER_STATUS_VALUES.includes(value as ChapterStatus)
);

/**
 * Tests whether a value is an allowed narrative time.
 */
export const isNarrativeTime = (value: unknown): value is NarrativeTime => (
  typeof value === "string" && NARRATIVE_TIME_VALUES.includes(value as NarrativeTime)
);
