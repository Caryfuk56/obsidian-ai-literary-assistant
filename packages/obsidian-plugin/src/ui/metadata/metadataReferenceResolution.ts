import type { IndexedRecord, ProjectIndex } from "../../core/types/metadataIndex.types";
import type { MetadataType } from "../../core/types/metadata.types";

/**
 * Resolved reference value for a multiselect field.
 */
export interface MetadataReferenceResolution {
  exists: boolean;
  label: string;
  value: string;
}

/**
 * Resolves selected multiselect values against the current metadata index.
 */
export const resolveMultiselectReferences = (
  values: readonly string[],
  referenceType: MetadataType | undefined,
  index: ProjectIndex
): MetadataReferenceResolution[] => values.map((value) => {
  const label = normalizeReferenceLabel(value);

  return {
    exists: referenceType ? referenceExists(label, value, getRecordsForType(index, referenceType)) : true,
    label,
    value
  };
});

/**
 * Returns indexed records for a metadata type.
 */
export const getRecordsForType = (
  index: ProjectIndex,
  type: MetadataType
): readonly IndexedRecord[] => {
  switch (type) {
    case "chapter":
      return index.chapters;
    case "character":
      return index.characters;
    case "history":
      return index.history;
    case "item":
      return index.items;
    case "location":
      return index.locations;
    case "organization":
      return index.organizations;
    case "plotline":
      return index.plotlines;
    case "system":
      return index.systems;
    case "theme":
      return index.themes;
    case "routing":
      return index.routing ? [index.routing] : [];
    case "structure":
      return index.structure ? [index.structure] : [];
    case "synopsis":
      return index.synopsis ? [index.synopsis] : [];
    case "timeline":
      return index.timeline ? [index.timeline] : [];
  }
};

/**
 * Extracts a readable label from plain text or Obsidian wiki-link text.
 */
export const normalizeReferenceLabel = (value: string): string => {
  const trimmedValue = value.trim();
  const wikiLinkMatch = /^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/.exec(trimmedValue);

  if (!wikiLinkMatch) {
    return trimmedValue;
  }

  const target = wikiLinkMatch[2] ?? wikiLinkMatch[1] ?? trimmedValue;
  const withoutExtension = target.replace(/\.md$/i, "");
  const segments = withoutExtension.split("/");

  return segments[segments.length - 1] ?? withoutExtension;
};

const referenceExists = (
  label: string,
  value: string,
  records: readonly IndexedRecord[]
): boolean => {
  const normalizedLabel = normalizeReferenceLabel(label).toLocaleLowerCase();
  const normalizedValue = normalizeReferenceLabel(value).toLocaleLowerCase();

  return records.some((record) => {
    const recordPathLabel = normalizeReferenceLabel(record.path).toLocaleLowerCase();

    return record.id.toLocaleLowerCase() === normalizedValue
      || record.title.toLocaleLowerCase() === normalizedLabel
      || normalizeReferenceLabel(record.link).toLocaleLowerCase() === normalizedLabel
      || recordPathLabel === normalizedLabel;
  });
};
