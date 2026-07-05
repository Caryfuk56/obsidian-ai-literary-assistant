import type { App, TFile } from "obsidian";

import { MetadataIndexesService } from "../metadata/metadataIndexService";
import {
  addRecordToProjectIndex,
  createEmptyProjectIndex,
  mapMetadataToIndexedRecord
} from "../metadata/metadataIndexMapping";
import type { LiteraryMetadata } from "../types/metadata.types";
import { assert, assertEqual } from "../../testUtils";

const chapterMetadata: LiteraryMetadata = {
  createdAt: "2026-01-01T00:00:00.000Z",
  id: "chapter-1",
  status: "draft",
  title: "Chapter One",
  type: "chapter",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: "1"
};

const synopsisMetadata: LiteraryMetadata = {
  createdAt: "2026-01-01T00:00:00.000Z",
  id: "synopsis",
  language: "cs",
  status: "draft",
  title: "Synopsis",
  type: "synopsis",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: "1"
};

/**
 * Verifies metadata mapping produces the allowed index shape only.
 */
export const testMetadataIndexMappingUsesAllowedFields = (): void => {
  const record = mapMetadataToIndexedRecord(chapterMetadata, fakeFile("Story/Chapter One.md", "Chapter One"));
  const keys = Object.keys(record).sort().join(",");

  assertEqual(keys, "id,link,path,title,type,version", "Expected index record to contain only allowed fields");
  assertEqual(record.link, "[[Story/Chapter One|Chapter One]]", "Expected stable wiki link");
};

/**
 * Verifies grouped index routing for collection and singleton metadata.
 */
export const testMetadataIndexGroupingRoutesRecords = (): void => {
  const chapter = mapMetadataToIndexedRecord(chapterMetadata, fakeFile("Chapter One.md", "Chapter One"));
  const synopsis = mapMetadataToIndexedRecord(synopsisMetadata, fakeFile("Synopsis.md", "Synopsis"));
  const index = addRecordToProjectIndex(addRecordToProjectIndex(createEmptyProjectIndex(), chapter), synopsis);

  assertEqual(index.chapters.length, 1, "Expected chapter to be routed to chapters");
  assertEqual(index.synopsis?.id, "synopsis", "Expected synopsis singleton to be set");
};

/**
 * Verifies the index service skips invalid frontmatter and indexes valid records.
 */
export const testMetadataIndexesServiceBuildsFromVault = async (): Promise<void> => {
  const validFile = fakeFile("Story/Chapter One.md", "Chapter One");
  const invalidFile = fakeFile("Story/Broken.md", "Broken");
  const app = fakeApp([
    { file: validFile, frontmatter: chapterMetadata },
    { file: invalidFile, frontmatter: { id: "broken", type: "chapter" } }
  ]);
  const service = new MetadataIndexesService(app);

  await service.create();

  assert(typeof service.getChapters === "function", "Expected service to expose typed getter methods");
  assertEqual(service.getChapters().length, 1, "Expected one valid chapter");
  assertEqual(service.getChapters()[0]?.path, "Story/Chapter One.md", "Expected path from Obsidian file");
};

/**
 * Verifies setters replace only their target group.
 */
export const testMetadataIndexesServiceSettersReplaceGroups = (): void => {
  const service = new MetadataIndexesService(fakeApp([]));
  const record = mapMetadataToIndexedRecord(chapterMetadata, fakeFile("Chapter One.md", "Chapter One"));

  service.setChapters([record]);
  service.setCharacters([{
    ...record,
    id: "character-1",
    title: "Character",
    type: "character"
  }]);

  assertEqual(service.getChapters().length, 1, "Expected chapters setter to replace chapters");
  assertEqual(service.getCharacters().length, 1, "Expected characters setter to replace characters");
  assertEqual(service.getLocations().length, 0, "Expected unrelated groups to remain empty");
};

const fakeFile = (path: string, basename: string): TFile => ({
  basename,
  path
}) as TFile;

const fakeApp = (
  entries: readonly { readonly file: TFile; readonly frontmatter?: unknown }[]
): App => ({
  metadataCache: {
    getFileCache: (file: TFile) => {
      const entry = entries.find((candidate) => candidate.file === file);

      return entry?.frontmatter ? { frontmatter: entry.frontmatter } : null;
    }
  },
  vault: {
    getMarkdownFiles: () => entries.map((entry) => entry.file)
  }
}) as unknown as App;
