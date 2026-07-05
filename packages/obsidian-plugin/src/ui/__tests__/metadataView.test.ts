import { createEmptyProjectIndex } from "../../core/metadata/metadataIndexMapping";
import type { LiteraryMetadata } from "../../core/metadata/metadataSchema";
import { METADATA_TYPES } from "../../core/types/metadata.types";
import en from "../../locales/en.json";
import cs from "../../locales/cs.json";
import { assert, assertEqual } from "../../testUtils";
import {
  formatMetadataDisplayValue,
  formatMetadataDate,
  hasMetadataDraftChanges
} from "../metadata/metadataDisplay";
import {
  getMetadataFieldDefinitions,
  isEditableField,
  removeMultiselectValue,
  updateMetadataDraftField
} from "../metadata/metadataFieldDefinitions";
import { resolveMultiselectReferences } from "../metadata/metadataReferenceResolution";
import { deriveActiveMetadataSnapshot } from "../metadata/activeMetadataState";
import {
  getChapterMetadataReviewFieldDefinitions,
  isProtectedChapterReviewField,
  updateChapterReviewMetadataField
} from "../chapter-metadata/chapterMetadataReviewFields";

/**
 * Verifies chapter metadata fields are definition-driven and protected fields are locked.
 */
export const testMetadataFieldDefinitionsProtectSystemFields = (): void => {
  const fields = getMetadataFieldDefinitions("chapter");
  const idField = fields.find((field) => field.key === "id");
  const titleField = fields.find((field) => field.key === "title");
  const plotlinesField = fields.find((field) => field.key === "plotlines");

  assert(idField?.editable === false, "Expected id to be non-editable");
  assert(titleField?.editable === true, "Expected title to be editable");
  assertEqual(plotlinesField?.inputType, "multiselect", "Expected chapter plotlines to render as multiselect");
};

/**
 * Verifies editability requires both field permission and active edit state.
 */
export const testMetadataFieldEditabilityRequiresEditableDefinition = (): void => {
  const fields = getMetadataFieldDefinitions("chapter");
  const idField = fields.find((field) => field.key === "id");
  const titleField = fields.find((field) => field.key === "title");

  if (!idField || !titleField) {
    throw new Error("Expected id and title fields.");
  }

  assert(!isEditableField(idField, new Set(["id"]), true), "Expected protected field to remain locked");
  assert(isEditableField(titleField, new Set(["title"]), false), "Expected selected editable field to unlock");
};

/**
 * Verifies multiselect reference resolution uses the current metadata index.
 */
export const testMetadataMultiselectReferenceResolution = (): void => {
  const index = {
    ...createEmptyProjectIndex(),
    plotlines: [{
      id: "main-plot",
      link: "[[Plotlines/Main Plot|Main Plot]]",
      path: "Plotlines/Main Plot.md",
      title: "Main Plot",
      type: "plotline" as const,
      version: "1"
    }]
  };
  const resolutions = resolveMultiselectReferences(["[[Plotlines/Main Plot|Main Plot]]", "Missing Plot"], "plotline", index);

  assertEqual(resolutions[0]?.exists, true, "Expected existing plotline to resolve");
  assertEqual(resolutions[1]?.exists, false, "Expected missing plotline to be marked missing");
};

/**
 * Verifies metadata draft and multiselect helpers do not mutate source values.
 */
export const testMetadataDraftHelpersAreImmutable = (): void => {
  const metadata: LiteraryMetadata = {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "chapter-1",
    plotlines: ["A", "B"],
    status: "draft",
    title: "Old",
    type: "chapter",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: "1"
  };
  const updated = updateMetadataDraftField(metadata, "title", "New");
  const values = removeMultiselectValue(metadata.plotlines ?? [], "A");

  assertEqual(metadata.title, "Old", "Expected source metadata to remain unchanged");
  assertEqual(updated.title, "New", "Expected updated metadata title");
  assertEqual(values.join(","), "B", "Expected removed multiselect value");
};

/**
 * Verifies metadata type selector values are centralized and complete.
 */
export const testMetadataTypesContainExpectedValues = (): void => {
  assertEqual(
    METADATA_TYPES.join(","),
    [
      "chapter",
      "character",
      "history",
      "item",
      "location",
      "organization",
      "plotline",
      "routing",
      "structure",
      "synopsis",
      "system",
      "theme",
      "timeline"
    ].join(","),
    "Expected metadata type list to match supported metadata types"
  );
};

/**
 * Verifies metadata type names are globally localized.
 */
export const testMetadataTypeLabelsAreLocalized = (): void => {
  METADATA_TYPES.forEach((metadataType) => {
    assert(
      metadataType in en.metadataTypes,
      `Expected English metadata type label for ${metadataType}`
    );
    assert(
      metadataType in cs.metadataTypes,
      `Expected Czech metadata type label for ${metadataType}`
    );
  });
};

/**
 * Verifies select options use translated labels while preserving stored values.
 */
export const testMetadataSelectOptionsUseLabelKeys = (): void => {
  const allFields = METADATA_TYPES.flatMap((metadataType) => getMetadataFieldDefinitions(metadataType));

  allFields.forEach((field) => {
    field.options?.forEach((option) => {
      assert(option.value.length > 0, `Expected option value for ${field.key}`);
      assert(option.labelKey.startsWith("metadataOptions."), `Expected metadata option label key for ${field.key}`);
      assert(
        hasLocalePath(en, option.labelKey),
        `Expected English option label for ${option.labelKey}`
      );
      assert(
        hasLocalePath(cs, option.labelKey),
        `Expected Czech option label for ${option.labelKey}`
      );
    });
  });
};

/**
 * Verifies metadata drafts only count as changed when values differ.
 */
export const testMetadataDraftDirtyState = (): void => {
  const original: LiteraryMetadata = {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "chapter-1",
    plotlines: ["A", "B"],
    status: "draft",
    title: "Old",
    type: "chapter",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: "1"
  };
  const fields = getMetadataFieldDefinitions("chapter");

  assert(
    !hasMetadataDraftChanges({ draft: original, fieldDefinitions: fields, original }),
    "Expected unchanged metadata to be clean"
  );
  assert(
    hasMetadataDraftChanges({
      draft: {
        ...original,
        title: "New"
      },
      fieldDefinitions: fields,
      original
    }),
    "Expected changed scalar metadata to be dirty"
  );
  assert(
    hasMetadataDraftChanges({
      draft: {
        ...original,
        plotlines: ["B", "A"]
      },
      fieldDefinitions: fields,
      original
    }),
    "Expected changed array order to be dirty"
  );
};

/**
 * Verifies metadata dates are localized for display without rejecting raw fallbacks.
 */
export const testMetadataDateFormatting = (): void => {
  const formatted = formatMetadataDate({
    language: "en-US",
    value: "2026-01-01T13:30:00.000Z"
  });

  assert(formatted !== "2026-01-01T13:30:00.000Z", "Expected ISO date to be formatted for display");
  assertEqual(
    formatMetadataDate({ language: "en-US", value: "not-a-date" }),
    "not-a-date",
    "Expected invalid date text to be preserved"
  );
  assertEqual(
    formatMetadataDate({ language: "en-US", value: "" }),
    "",
    "Expected empty date text to stay empty"
  );
  assert(
    formatMetadataDisplayValue({
      key: "createdAt",
      language: "en-US",
      value: "2026-01-01T13:30:00.000Z"
    }) !== "2026-01-01T13:30:00.000Z",
    "Expected date display value to format createdAt"
  );
};

/**
 * Verifies active metadata state derivation handles all panel states.
 */
export const testActiveMetadataSnapshotDerivation = (): void => {
  const file = { path: "Chapter.md" };
  const validFrontmatter = {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "chapter-1",
    status: "draft",
    title: "Chapter",
    type: "chapter",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: "1"
  };

  assertEqual(
    deriveActiveMetadataSnapshot(null, undefined).kind,
    "no-active-file",
    "Expected no active file state"
  );
  assertEqual(
    deriveActiveMetadataSnapshot(file, undefined).kind,
    "no-frontmatter",
    "Expected no frontmatter state"
  );
  assertEqual(
    deriveActiveMetadataSnapshot(file, { type: "chapter" }).kind,
    "invalid-metadata",
    "Expected invalid metadata state"
  );
  assertEqual(
    deriveActiveMetadataSnapshot(file, validFrontmatter).kind,
    "valid",
    "Expected valid metadata state"
  );
};

/**
 * Verifies chapter review field policy protects system metadata.
 */
export const testChapterReviewFieldDefinitionsProtectSystemFields = (): void => {
  const fields = getChapterMetadataReviewFieldDefinitions();
  const versionField = fields.find((field) => field.key === "version");
  const titleField = fields.find((field) => field.key === "title");

  assert(versionField?.editable === false, "Expected version to be read-only in review");
  assert(titleField?.editable === true, "Expected title to stay editable in review");
  assert(isProtectedChapterReviewField("createdAt"), "Expected createdAt to be protected");
  assert(hasLocalePath(en, "chapterMetadata.fields.version"), "Expected English version review label");
  assert(hasLocalePath(cs, "chapterMetadata.fields.version"), "Expected Czech version review label");
  assert(hasLocalePath(en, "chapterMetadata.fields.createdAt"), "Expected English createdAt review label");
  assert(hasLocalePath(cs, "chapterMetadata.fields.createdAt"), "Expected Czech createdAt review label");
  assert(hasLocalePath(en, "chapterMetadata.fields.updatedAt"), "Expected English updatedAt review label");
  assert(hasLocalePath(cs, "chapterMetadata.fields.updatedAt"), "Expected Czech updatedAt review label");
};

/**
 * Verifies chapter review updates ignore protected fields and preserve valid metadata shape.
 */
export const testChapterReviewProtectedFieldUpdatesAreIgnored = (): void => {
  const metadata = {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "chapter-1",
    linked_characters: [],
    linked_history: [],
    linked_items: [],
    linked_locations: [],
    linked_organizations: [],
    linked_plotlines: [],
    linked_systems: [],
    plotlines: [],
    pov: "",
    status: "draft" as const,
    summary: "",
    title: "Old",
    type: "chapter" as const,
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: "1"
  };

  assertEqual(
    updateChapterReviewMetadataField(metadata, "version", "").version,
    "1",
    "Expected protected version update to be ignored"
  );
  assertEqual(
    updateChapterReviewMetadataField(metadata, "title", "New").title,
    "New",
    "Expected editable title update to apply"
  );
};

const hasLocalePath = (locale: unknown, path: string): boolean => (
  path.split(".").reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    return Reflect.get(currentValue, segment);
  }, locale) !== undefined
);
