import type { LiteraryMetadata } from "../../core/metadata/metadataSchema";
import type { MetadataType } from "../../core/types/metadata.types";

/**
 * Input control types supported by the dynamic metadata panel.
 */
export type MetadataInputType = "text" | "textarea" | "select" | "multiselect";

/**
 * AI actions available on dynamic metadata fields.
 */
export type MetadataFieldAiAction = "chapter_metadata";

/**
 * One stored select value and its localized display label key.
 */
export interface MetadataSelectOption {
  labelKey: string;
  value: string;
}

/**
 * Declarative field description used to render one metadata input row.
 */
export interface MetadataFieldDefinition {
  key: string;
  labelKey: string;
  inputType: MetadataInputType;
  editable: boolean;
  options?: readonly MetadataSelectOption[];
  referenceType?: MetadataType;
  aiAction?: MetadataFieldAiAction;
}

const commonFields = [
  field("id", "text", false),
  field("type", "text", false),
  field("title", "text", true),
  field("version", "text", false),
  field("createdAt", "text", false),
  field("updatedAt", "text", false)
] as const satisfies readonly MetadataFieldDefinition[];

const chapterStatusOptions = [
  option("chapterStatus", "not_started"),
  option("chapterStatus", "outline"),
  option("chapterStatus", "draft"),
  option("chapterStatus", "revision"),
  option("chapterStatus", "editing"),
  option("chapterStatus", "final")
] as const;

const relevanceOptions = [
  option("relevance", "major"),
  option("relevance", "supporting"),
  option("relevance", "background")
] as const;
const projectStatusOptions = [
  option("projectStatus", "draft"),
  option("projectStatus", "active"),
  option("projectStatus", "stable")
] as const;
const characterRoleOptions = [
  option("characterRole", "protagonist"),
  option("characterRole", "antagonist"),
  option("characterRole", "support")
] as const;
const characterImportanceOptions = [
  option("characterImportance", "major"),
  option("characterImportance", "minor"),
  option("characterImportance", "cameo")
] as const;
const truthStatusOptions = [
  option("truthStatus", "public"),
  option("truthStatus", "hidden"),
  option("truthStatus", "contested")
] as const;
const secrecyLevelOptions = [
  option("secrecyLevel", "public"),
  option("secrecyLevel", "restricted"),
  option("secrecyLevel", "secret")
] as const;
const itemTypeOptions = [
  option("itemType", "artifact"),
  option("itemType", "document"),
  option("itemType", "evidence"),
  option("itemType", "technology"),
  option("itemType", "relic"),
  option("itemType", "personal")
] as const;
const storyScopeOptions = [
  option("storyScope", "short_story"),
  option("storyScope", "novella"),
  option("storyScope", "novel"),
  option("storyScope", "series")
] as const;
const narrativeModeOptions = [
  option("narrativeMode", "first_person"),
  option("narrativeMode", "limited_third"),
  option("narrativeMode", "multiple_pov")
] as const;

/**
 * Returns dynamic metadata field definitions for a known metadata type.
 */
export const getMetadataFieldDefinitions = (type: MetadataType): readonly MetadataFieldDefinition[] => {
  switch (type) {
    case "chapter":
      return [
        ...commonFields,
        field("summary", "textarea", true, { aiAction: "chapter_metadata" }),
        field("pov", "text", true),
        field("status", "select", true, { options: chapterStatusOptions }),
        field("plotlines", "multiselect", true, { referenceType: "plotline" })
      ];
    case "character":
      return [
        ...commonFields,
        field("aliases", "multiselect", true),
        field("role", "select", true, { options: characterRoleOptions }),
        field("importance", "select", true, { options: characterImportanceOptions })
      ];
    case "history":
      return [
        ...commonFields,
        field("eventTypes", "multiselect", true),
        field("timelinePosition", "text", true),
        field("truthStatus", "select", true, { options: truthStatusOptions }),
        field("secrecyLevel", "select", true, { options: secrecyLevelOptions }),
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "item":
      return [
        ...commonFields,
        field("itemType", "select", true, { options: itemTypeOptions }),
        field("currentHolder", "text", true),
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "location":
      return [
        ...commonFields,
        field("locationType", "text", true),
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "organization":
      return [
        ...commonFields,
        field("organizationType", "text", true),
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "plotline":
      return [
        ...commonFields,
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "routing":
      return [
        ...commonFields,
        field("status", "select", true, { options: projectStatusOptions }),
        field("storyTitle", "text", true),
        field("storyScope", "select", true, { options: storyScopeOptions }),
        field("routingVersion", "text", true)
      ];
    case "structure":
      return [
        ...commonFields,
        field("status", "select", true, { options: projectStatusOptions })
      ];
    case "synopsis":
      return [
        ...commonFields,
        field("status", "select", true, { options: projectStatusOptions }),
        field("language", "text", true),
        field("genre", "text", true),
        field("setting", "textarea", true),
        field("tone", "text", true),
        field("narrativeMode", "select", true, { options: narrativeModeOptions }),
        field("targetScope", "select", true, { options: storyScopeOptions }),
        field("coreTheme", "textarea", true)
      ];
    case "system":
      return [
        ...commonFields,
        field("systemType", "text", true),
        field("storyFunction", "textarea", true),
        field("relevance", "select", true, { options: relevanceOptions }),
        field("publicDescription", "textarea", true),
        field("povRelevance", "textarea", true)
      ];
    case "theme":
      return [
        ...commonFields,
        field("category", "text", true),
        field("relevance", "select", true, { options: relevanceOptions })
      ];
    case "timeline":
      return [
        ...commonFields,
        field("status", "select", true, { options: projectStatusOptions })
      ];
  }
};

/**
 * Returns true when a field can be edited according to its definition.
 */
export const isEditableField = (
  fieldDefinition: MetadataFieldDefinition,
  editableFields: ReadonlySet<string>,
  editAll: boolean
): boolean => fieldDefinition.editable && (editAll || editableFields.has(fieldDefinition.key));

/**
 * Updates one metadata draft field without mutating the input object.
 */
export const updateMetadataDraftField = (
  metadata: LiteraryMetadata,
  key: string,
  value: unknown
): LiteraryMetadata => ({
  ...metadata,
  [key]: value
});

/**
 * Removes one value from a multiselect field without mutating the input array.
 */
export const removeMultiselectValue = (
  values: readonly string[],
  valueToRemove: string
): string[] => values.filter((value) => value !== valueToRemove);

function field(
  key: string,
  inputType: MetadataInputType,
  editable: boolean,
  overrides: Pick<MetadataFieldDefinition, "aiAction" | "options" | "referenceType"> = {}
): MetadataFieldDefinition {
  return {
    editable,
    inputType,
    key,
    labelKey: `metadataView.fields.${key}`,
    ...overrides
  };
}

function option(group: string, value: string): MetadataSelectOption {
  return {
    labelKey: `metadataOptions.${group}.${value}`,
    value
  };
}
