import type { LiteraryMetadata } from "../../core/metadata/metadataSchema";
import type { MetadataFieldDefinition } from "./metadataFieldDefinitions";

const metadataDateFields = new Set(["createdAt", "updatedAt"]);

/**
 * Returns true when a metadata field should be displayed as a localized date.
 */
export const isMetadataDateField = (key: string): boolean => metadataDateFields.has(key);

/**
 * Formats a metadata field value for display without changing the stored value.
 */
export const formatMetadataDisplayValue = ({
  key,
  language,
  value
}: {
  readonly key: string;
  readonly language: string | undefined;
  readonly value: unknown;
}): string => {
  if (isMetadataDateField(key)) {
    return formatMetadataDate({
      language,
      value
    });
  }

  return valueToText(value);
};

/**
 * Formats a metadata date value for UI display while preserving invalid raw text.
 */
export const formatMetadataDate = ({
  language,
  value
}: {
  readonly language: string | undefined;
  readonly value: unknown;
}): string => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return valueToText(value);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

/**
 * Returns true when the current metadata draft differs from the loaded metadata.
 */
export const hasMetadataDraftChanges = ({
  draft,
  fieldDefinitions,
  original
}: {
  readonly draft: LiteraryMetadata | null;
  readonly fieldDefinitions: readonly MetadataFieldDefinition[];
  readonly original: LiteraryMetadata | null;
}): boolean => {
  if (!draft || !original || draft.type !== original.type) {
    return false;
  }

  return fieldDefinitions.some((fieldDefinition) => (
    !metadataValuesEqual(
      Reflect.get(draft, fieldDefinition.key),
      Reflect.get(original, fieldDefinition.key)
    )
  ));
};

/**
 * Converts metadata values to text for standard input rendering.
 */
export const valueToText = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((arrayValue) => valueToText(arrayValue)).join(", ");
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const metadataValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) {
    const leftValues = Array.isArray(left) ? left : [];
    const rightValues = Array.isArray(right) ? right : [];

    return leftValues.length === rightValues.length
      && leftValues.every((value, index) => metadataValuesEqual(value, rightValues[index]));
  }

  return left === right;
};
