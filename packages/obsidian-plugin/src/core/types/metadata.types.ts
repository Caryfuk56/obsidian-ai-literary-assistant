/**
 * Metadata types supported by literary frontmatter and metadata UI selectors.
 */
export const METADATA_TYPES = [
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
] as const;

export type MetadataType = typeof METADATA_TYPES[number];

export type Relevance = "major" | "supporting" | "background";

export type ProjectStatus = "draft" | "active" | "stable";

export interface CommonMetadata {
  id: string;
  type: MetadataType;
  title: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus =
  | "not_started"
  | "outline"
  | "draft"
  | "revision"
  | "editing"
  | "final";

export interface ChapterMetadata extends CommonMetadata {
  type: "chapter";
  linked_characters?: string[];
  linked_history?: string[];
  linked_items?: string[];
  linked_locations?: string[];
  linked_organizations?: string[];
  linked_plotlines?: string[];
  linked_systems?: string[];
  summary?: string;
  pov?: string;
  status: ChapterStatus;
  plotlines?: string[];
}

export type CharacterRole = "protagonist" | "antagonist" | "support";
export type CharacterImportance = "major" | "minor" | "cameo";

export interface CharacterMetadata extends CommonMetadata {
  type: "character";
  aliases?: string[];
  role?: CharacterRole;
  importance: CharacterImportance;
}

export type TruthStatus = "public" | "hidden" | "contested";
export type SecrecyLevel = "public" | "restricted" | "secret";

export interface HistoryMetadata extends CommonMetadata {
  type: "history";
  eventTypes?: string[];
  timelinePosition?: string;
  truthStatus?: TruthStatus;
  secrecyLevel?: SecrecyLevel;
  relevance: Relevance;
}

export type ItemType =
  | "artifact"
  | "document"
  | "evidence"
  | "technology"
  | "relic"
  | "personal";

export interface ItemMetadata extends CommonMetadata {
  type: "item";
  itemType?: ItemType;
  currentHolder?: string;
  relevance: Relevance;
}

export interface LocationMetadata extends CommonMetadata {
  type: "location";
  locationType?: string;
  relevance: Relevance;
}

export interface OrganizationMetadata extends CommonMetadata {
  type: "organization";
  organizationType?: string;
  relevance: Relevance;
}

export interface SystemMetadata extends CommonMetadata {
  type: "system";
  systemType?: string;
  storyFunction?: string;
  relevance: Relevance;
  publicDescription?: string;
  povRelevance?: string;
}

export interface ThemeMetadata extends CommonMetadata {
  type: "theme";
  category?: string;
  relevance: Relevance;
}

export interface PlotlineMetadata extends CommonMetadata {
  type: "plotline";
  relevance: Relevance;
}

export interface RoutingMetadata extends CommonMetadata {
  type: "routing";
  status: ProjectStatus;
  storyTitle?: string;
  storyScope?: StoryScope;
  routingVersion?: string;
}

export interface StructureMetadata extends CommonMetadata {
  type: "structure";
  status: ProjectStatus;
}

export type StoryScope =
  | "short_story"
  | "novella"
  | "novel"
  | "series";

export type NarrativeMode =
  | "first_person"
  | "limited_third"
  | "multiple_pov";

export interface SynopsisMetadata extends CommonMetadata {
  type: "synopsis";
  status: ProjectStatus;
  language: string;
  genre?: string;
  setting?: string;
  tone?: string;
  narrativeMode?: NarrativeMode;
  targetScope?: StoryScope;
  coreTheme?: string;
}

export interface TimelineMetadata extends CommonMetadata {
  type: "timeline";
  status: ProjectStatus;
}

export type LiteraryMetadata =
  | ChapterMetadata
  | CharacterMetadata
  | HistoryMetadata
  | ItemMetadata
  | LocationMetadata
  | OrganizationMetadata
  | SystemMetadata
  | ThemeMetadata
  | PlotlineMetadata
  | RoutingMetadata
  | StructureMetadata
  | SynopsisMetadata
  | TimelineMetadata;
