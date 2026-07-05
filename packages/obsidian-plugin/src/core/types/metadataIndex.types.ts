import type { MetadataType } from "./metadata.types";

/**
 * Minimal runtime projection of one metadata-bearing vault file.
 */
export interface IndexedRecord {
  id: string;
  type: MetadataType;
  title: string;
  version: string;
  path: string;
  link: string;
}

/**
 * In-memory index derived from Markdown frontmatter.
 */
export interface ProjectIndex {
  synopsis?: IndexedRecord;
  routing?: IndexedRecord;
  structure?: IndexedRecord;
  timeline?: IndexedRecord;
  chapters: IndexedRecord[];
  characters: IndexedRecord[];
  locations: IndexedRecord[];
  organizations: IndexedRecord[];
  systems: IndexedRecord[];
  history: IndexedRecord[];
  themes: IndexedRecord[];
  items: IndexedRecord[];
  plotlines: IndexedRecord[];
}
