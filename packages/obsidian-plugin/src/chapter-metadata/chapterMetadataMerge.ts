import { CHAPTER_METADATA_ARRAY_FIELDS, isChapterStatus } from "./chapterMetadataContract";
import type { ChapterMetadata, ChapterMetadataSuggestion } from "./chapterMetadataTypes";

const pad = (value: number): string => value.toString().padStart(2, "0");

/**
 * Formats a permanent timestamp id as YYYYMMDDHHmmss.
 */
export const generateChapterMetadataId = (date: Date): string => (
  [
    date.getUTCFullYear().toString(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds())
  ].join("")
);

/**
 * Creates an initial protected metadata draft from existing frontmatter and AI suggestions.
 */
export const mergeChapterMetadataSuggestion = ({
  existingFrontmatter,
  fallbackTitle,
  now,
  suggestion
}: {
  readonly existingFrontmatter: Record<string, unknown>;
  readonly fallbackTitle?: string;
  readonly now: Date;
  readonly suggestion: ChapterMetadataSuggestion;
}): ChapterMetadata => {
  const existingStatus = existingFrontmatter["status"];
  const title = nonEmptyStringOrEmpty(suggestion.title)
    || nonEmptyStringOrEmpty(existingFrontmatter["title"])
    || nonEmptyStringOrEmpty(fallbackTitle)
    || "Untitled chapter";

  return {
    createdAt: stringOrEmpty(existingFrontmatter["createdAt"]) || now.toISOString(),
    id: stringOrEmpty(existingFrontmatter["id"]) || generateChapterMetadataId(now),
    linked_characters: suggestion.linked_characters,
    linked_history: suggestion.linked_history,
    linked_items: suggestion.linked_items,
    linked_locations: suggestion.linked_locations,
    linked_organizations: suggestion.linked_organizations,
    linked_plotlines: suggestion.linked_plotlines,
    linked_systems: suggestion.linked_systems,
    plotlines: suggestion.plotlines.length > 0 ? suggestion.plotlines : suggestion.linked_plotlines,
    pov: suggestion.pov,
    status: isChapterStatus(existingStatus) ? existingStatus : "draft",
    summary: suggestion.summary,
    title,
    type: "chapter",
    updatedAt: stringOrEmpty(existingFrontmatter["updatedAt"]) || now.toISOString(),
    version: stringOrEmpty(existingFrontmatter["version"]) || "1"
  };
};

/**
 * Prepares frontmatter values for an approved write while preserving unrelated keys.
 */
export const prepareChapterMetadataFrontmatter = ({
  approvedMetadata,
  existingFrontmatter,
  now
}: {
  readonly approvedMetadata: ChapterMetadata;
  readonly existingFrontmatter: Record<string, unknown>;
  readonly now: Date;
}): Record<string, unknown> => {
  const nextFrontmatter: Record<string, unknown> = { ...existingFrontmatter };
  const metadataForWrite: ChapterMetadata = {
    ...approvedMetadata,
    updatedAt: now.toISOString()
  };

  for (const [key, value] of Object.entries(metadataForWrite)) {
    nextFrontmatter[key] = value;
  }

  return nextFrontmatter;
};

/**
 * Converts an editable textarea value into an array field value.
 */
export const parseArrayFieldText = (value: string): string[] => (
  value
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
);

/**
 * Formats an array field value as one value per line.
 */
export const formatArrayFieldText = (value: readonly string[]): string => value.join("\n");

/**
 * Tests whether a metadata field is an array field.
 */
export const isChapterMetadataArrayField = (field: keyof ChapterMetadata): field is typeof CHAPTER_METADATA_ARRAY_FIELDS[number] => (
  CHAPTER_METADATA_ARRAY_FIELDS.includes(field as typeof CHAPTER_METADATA_ARRAY_FIELDS[number])
);

const stringOrEmpty = (value: unknown): string => (typeof value === "string" ? value : "");

const nonEmptyStringOrEmpty = (value: unknown): string => {
  const text = stringOrEmpty(value).trim();

  return text.length > 0 ? text : "";
};
