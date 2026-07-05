import { z } from "zod";

export const MetadataTypeSchema = z.enum([
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
  "timeline",
]);

export const RelevanceSchema = z.enum([
  "major",
  "supporting",
  "background",
]);

export const ProjectStatusSchema = z.enum([
  "draft",
  "active",
  "stable",
]);

export const CommonMetadataSchema = z.object({
  id: z.string().min(1),
  type: MetadataTypeSchema,
  title: z.string().min(1),
  version: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const ChapterStatusSchema = z.enum([
  "not_started",
  "outline",
  "draft",
  "revision",
  "editing",
  "final",
]);

export const ChapterMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("chapter"),
  linked_characters: z.array(z.string()).optional(),
  linked_history: z.array(z.string()).optional(),
  linked_items: z.array(z.string()).optional(),
  linked_locations: z.array(z.string()).optional(),
  linked_organizations: z.array(z.string()).optional(),
  linked_plotlines: z.array(z.string()).optional(),
  linked_systems: z.array(z.string()).optional(),
  summary: z.string().optional(),
  pov: z.string().optional(),
  status: ChapterStatusSchema,
  plotlines: z.array(z.string()).optional(),
});

export const CharacterRoleSchema = z.enum([
  "protagonist",
  "antagonist",
  "support",
]);

export const CharacterImportanceSchema = z.enum([
  "major",
  "minor",
  "cameo",
]);

export const CharacterMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("character"),
  aliases: z.array(z.string()).optional(),
  role: CharacterRoleSchema.optional(),
  importance: CharacterImportanceSchema,
});

export const TruthStatusSchema = z.enum([
  "public",
  "hidden",
  "contested",
]);

export const SecrecyLevelSchema = z.enum([
  "public",
  "restricted",
  "secret",
]);

export const HistoryMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("history"),
  eventTypes: z.array(z.string()).optional(),
  timelinePosition: z.string().optional(),
  truthStatus: TruthStatusSchema.optional(),
  secrecyLevel: SecrecyLevelSchema.optional(),
  relevance: RelevanceSchema,
});

export const ItemTypeSchema = z.enum([
  "artifact",
  "document",
  "evidence",
  "technology",
  "relic",
  "personal",
]);

export const ItemMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("item"),
  itemType: ItemTypeSchema.optional(),
  currentHolder: z.string().optional(),
  relevance: RelevanceSchema,
});

export const LocationMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("location"),
  locationType: z.string().optional(),
  relevance: RelevanceSchema,
});

export const OrganizationMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("organization"),
  organizationType: z.string().optional(),
  relevance: RelevanceSchema,
});

export const SystemMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("system"),
  systemType: z.string().optional(),
  storyFunction: z.string().optional(),
  relevance: RelevanceSchema,
  publicDescription: z.string().optional(),
  povRelevance: z.string().optional(),
});

export const ThemeMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("theme"),
  category: z.string().optional(),
  relevance: RelevanceSchema,
});

export const PlotlineMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("plotline"),
  relevance: RelevanceSchema,
});

export const StoryScopeSchema = z.enum([
  "short_story",
  "novella",
  "novel",
  "series",
]);

export const NarrativeModeSchema = z.enum([
  "first_person",
  "limited_third",
  "multiple_pov",
]);

export const RoutingMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("routing"),
  status: ProjectStatusSchema,
  storyTitle: z.string().optional(),
  storyScope: StoryScopeSchema.optional(),
  routingVersion: z.string().optional(),
});

export const StructureMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("structure"),
  status: ProjectStatusSchema,
});

export const SynopsisMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("synopsis"),
  status: ProjectStatusSchema,
  language: z.string().min(1),
  genre: z.string().optional(),
  setting: z.string().optional(),
  tone: z.string().optional(),
  narrativeMode: NarrativeModeSchema.optional(),
  targetScope: StoryScopeSchema.optional(),
  coreTheme: z.string().optional(),
});

export const TimelineMetadataSchema = CommonMetadataSchema.extend({
  type: z.literal("timeline"),
  status: ProjectStatusSchema,
});

export const LiteraryMetadataSchema = z.discriminatedUnion("type", [
  ChapterMetadataSchema,
  CharacterMetadataSchema,
  HistoryMetadataSchema,
  ItemMetadataSchema,
  LocationMetadataSchema,
  OrganizationMetadataSchema,
  SystemMetadataSchema,
  ThemeMetadataSchema,
  PlotlineMetadataSchema,
  RoutingMetadataSchema,
  StructureMetadataSchema,
  SynopsisMetadataSchema,
  TimelineMetadataSchema,
]);

export type MetadataType = z.infer<typeof MetadataTypeSchema>;
export type Relevance = z.infer<typeof RelevanceSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export type ChapterMetadata = z.infer<typeof ChapterMetadataSchema>;
export type CharacterMetadata = z.infer<typeof CharacterMetadataSchema>;
export type HistoryMetadata = z.infer<typeof HistoryMetadataSchema>;
export type ItemMetadata = z.infer<typeof ItemMetadataSchema>;
export type LocationMetadata = z.infer<typeof LocationMetadataSchema>;
export type OrganizationMetadata = z.infer<typeof OrganizationMetadataSchema>;
export type SystemMetadata = z.infer<typeof SystemMetadataSchema>;
export type ThemeMetadata = z.infer<typeof ThemeMetadataSchema>;
export type PlotlineMetadata = z.infer<typeof PlotlineMetadataSchema>;
export type RoutingMetadata = z.infer<typeof RoutingMetadataSchema>;
export type StructureMetadata = z.infer<typeof StructureMetadataSchema>;
export type SynopsisMetadata = z.infer<typeof SynopsisMetadataSchema>;
export type TimelineMetadata = z.infer<typeof TimelineMetadataSchema>;

export type LiteraryMetadata = z.infer<typeof LiteraryMetadataSchema>;
