import type { TFile } from "obsidian";

import type { IndexedRecord, ProjectIndex } from "../types/metadataIndex.types";
import type { MetadataType } from "../types/metadata.types";

/**
 * Common validated metadata fields required to build an index record.
 */
export interface IndexableMetadata {
  id: string;
  title: string;
  type: MetadataType;
  version: string;
}

/**
 * Creates an empty metadata index with all collection groups initialized.
 */
export const createEmptyProjectIndex = (): ProjectIndex => ({
  chapters: [],
  characters: [],
  history: [],
  items: [],
  locations: [],
  organizations: [],
  plotlines: [],
  systems: [],
  themes: []
});

/**
 * Maps validated literary metadata and Obsidian file data into an index record.
 */
export const mapMetadataToIndexedRecord = (
  metadata: IndexableMetadata,
  file: Pick<TFile, "basename" | "path">
): IndexedRecord => ({
  id: metadata.id,
  link: buildWikiLink(file),
  path: file.path,
  title: metadata.title,
  type: metadata.type,
  version: metadata.version
});

/**
 * Adds one indexed record to a project index and returns the updated index.
 *
 * Singleton records use a deterministic last-write-wins policy based on the
 * scan order provided by Obsidian.
 */
export const addRecordToProjectIndex = (
  index: ProjectIndex,
  record: IndexedRecord
): ProjectIndex => {
  switch (record.type) {
    case "chapter":
      return { ...index, chapters: [...index.chapters, record] };
    case "character":
      return { ...index, characters: [...index.characters, record] };
    case "history":
      return { ...index, history: [...index.history, record] };
    case "item":
      return { ...index, items: [...index.items, record] };
    case "location":
      return { ...index, locations: [...index.locations, record] };
    case "organization":
      return { ...index, organizations: [...index.organizations, record] };
    case "plotline":
      return { ...index, plotlines: [...index.plotlines, record] };
    case "routing":
      return { ...index, routing: record };
    case "structure":
      return { ...index, structure: record };
    case "synopsis":
      return { ...index, synopsis: record };
    case "system":
      return { ...index, systems: [...index.systems, record] };
    case "theme":
      return { ...index, themes: [...index.themes, record] };
    case "timeline":
      return { ...index, timeline: record };
  }
};

const buildWikiLink = (file: Pick<TFile, "basename" | "path">): string => {
  const pathWithoutExtension = file.path.replace(/\.md$/i, "");

  return `[[${pathWithoutExtension}|${file.basename}]]`;
};
