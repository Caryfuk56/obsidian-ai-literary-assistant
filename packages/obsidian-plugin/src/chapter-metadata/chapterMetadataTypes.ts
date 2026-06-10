/**
 * Allowed author workflow states for a chapter.
 */
export type ChapterStatus =
  | "writing"
  | "draft"
  | "stylistic_correction"
  | "language_correction"
  | "done";

/**
 * Coarse narrative time values supported in chapter metadata.
 */
export type NarrativeTime = "ráno" | "den" | "večer" | "noc" | "neurčeno";

/**
 * Complete chapter frontmatter metadata contract.
 */
export interface ChapterMetadata {
  id: string;
  linked_characters: string[];
  linked_history: string[];
  linked_items: string[];
  linked_locations: string[];
  linked_organizations: string[];
  linked_plotlines: string[];
  linked_systems: string[];
  metadata_created: string;
  metadata_updated: string;
  narrative_time: NarrativeTime;
  pov: string;
  spoiler_level: string;
  status: string;
  summary: string;
  timeline_position: string;
  title: string;
  type: string;
}

/**
 * Strict model response shape accepted from metadata extraction.
 */
export interface ChapterMetadataSuggestion {
  linked_characters: string[];
  linked_history: string[];
  linked_items: string[];
  linked_locations: string[];
  linked_organizations: string[];
  linked_plotlines: string[];
  linked_systems: string[];
  narrative_time: NarrativeTime;
  pov: string;
  summary: string;
  title: string;
}

/**
 * Stage where metadata extraction or write processing failed.
 */
export type ChapterMetadataFailureStage =
  | "model-call"
  | "prompt-loading"
  | "schema-validation"
  | "output-normalization"
  | "merge"
  | "ui-rendering";

/**
 * Developer diagnostics for metadata extraction failures.
 */
export interface ChapterMetadataDiagnostics {
  errorMessage?: string;
  modelId?: string;
  promptFiles: string[];
  provider?: string;
  rawOutput?: string;
  stage: ChapterMetadataFailureStage;
  tier?: string;
  validationErrors: string[];
}

/**
 * Pending chapter metadata shown to the author before writing.
 */
export interface ChapterMetadataReviewState {
  editableFields: Partial<Record<keyof ChapterMetadata, boolean>>;
  filePath: string;
  originalFrontmatter: Record<string, unknown>;
  pendingMetadata: ChapterMetadata;
}

/**
 * Physical backup information created before a frontmatter write.
 */
export interface ChapterMetadataBackup {
  originalContent: string;
  path: string;
}

/**
 * Reusable non-chat tool output values rendered in the sidebar.
 */
export type ToolOutput =
  | { kind: "chapter-metadata-review"; review: ChapterMetadataReviewState }
  | { kind: "error"; message: string }
  | { kind: "markdown"; markdown: string };

/**
 * Result of reading the active markdown chapter.
 */
export type ActiveMarkdownFileResult<TFileLike> =
  | { file: TFileLike; ok: true }
  | { code: "no-active-markdown-file"; ok: false };
