import type { App } from "obsidian";

import { LiteraryMetadataSchema } from "./metadataSchema";
import {
  addRecordToProjectIndex,
  createEmptyProjectIndex,
  mapMetadataToIndexedRecord
} from "./metadataIndexMapping";
import type { IndexedRecord, ProjectIndex } from "../types/metadataIndex.types";

/**
 * Builds and stores runtime metadata indexes derived from vault frontmatter.
 */
export class MetadataIndexesService {
  private index: ProjectIndex = createEmptyProjectIndex();

  public constructor(private readonly app: App) {}

  /**
   * Rebuilds all metadata indexes from Markdown files in the current vault.
   */
  public create(): Promise<void> {
    const nextIndex = createEmptyProjectIndex();

    this.index = this.app.vault.getMarkdownFiles().reduce((currentIndex, file) => {
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

      if (!frontmatter) {
        return currentIndex;
      }

      const result = LiteraryMetadataSchema.safeParse(frontmatter);

      if (!result.success) {
        return currentIndex;
      }

      return addRecordToProjectIndex(
        currentIndex,
        mapMetadataToIndexedRecord(result.data, file)
      );
    }, nextIndex);

    return Promise.resolve();
  }

  /**
   * Returns the full current in-memory index.
   */
  public getIndex(): ProjectIndex {
    return {
      ...this.index,
      chapters: [...this.index.chapters],
      characters: [...this.index.characters],
      history: [...this.index.history],
      items: [...this.index.items],
      locations: [...this.index.locations],
      organizations: [...this.index.organizations],
      plotlines: [...this.index.plotlines],
      systems: [...this.index.systems],
      themes: [...this.index.themes]
    };
  }

  /**
   * Returns indexed chapter records.
   */
  public getChapters(): IndexedRecord[] {
    return [...this.index.chapters];
  }

  /**
   * Replaces indexed chapter records.
   */
  public setChapters(chapters: IndexedRecord[]): void {
    this.index = { ...this.index, chapters: [...chapters] };
  }

  /**
   * Returns indexed character records.
   */
  public getCharacters(): IndexedRecord[] {
    return [...this.index.characters];
  }

  /**
   * Replaces indexed character records.
   */
  public setCharacters(characters: IndexedRecord[]): void {
    this.index = { ...this.index, characters: [...characters] };
  }

  /**
   * Returns indexed location records.
   */
  public getLocations(): IndexedRecord[] {
    return [...this.index.locations];
  }

  /**
   * Replaces indexed location records.
   */
  public setLocations(locations: IndexedRecord[]): void {
    this.index = { ...this.index, locations: [...locations] };
  }

  /**
   * Returns indexed organization records.
   */
  public getOrganizations(): IndexedRecord[] {
    return [...this.index.organizations];
  }

  /**
   * Replaces indexed organization records.
   */
  public setOrganizations(organizations: IndexedRecord[]): void {
    this.index = { ...this.index, organizations: [...organizations] };
  }

  /**
   * Returns indexed system records.
   */
  public getSystems(): IndexedRecord[] {
    return [...this.index.systems];
  }

  /**
   * Replaces indexed system records.
   */
  public setSystems(systems: IndexedRecord[]): void {
    this.index = { ...this.index, systems: [...systems] };
  }

  /**
   * Returns indexed history records.
   */
  public getHistory(): IndexedRecord[] {
    return [...this.index.history];
  }

  /**
   * Replaces indexed history records.
   */
  public setHistory(history: IndexedRecord[]): void {
    this.index = { ...this.index, history: [...history] };
  }

  /**
   * Returns indexed theme records.
   */
  public getThemes(): IndexedRecord[] {
    return [...this.index.themes];
  }

  /**
   * Replaces indexed theme records.
   */
  public setThemes(themes: IndexedRecord[]): void {
    this.index = { ...this.index, themes: [...themes] };
  }

  /**
   * Returns indexed item records.
   */
  public getItems(): IndexedRecord[] {
    return [...this.index.items];
  }

  /**
   * Replaces indexed item records.
   */
  public setItems(items: IndexedRecord[]): void {
    this.index = { ...this.index, items: [...items] };
  }

  /**
   * Returns indexed plotline records.
   */
  public getPlotlines(): IndexedRecord[] {
    return [...this.index.plotlines];
  }

  /**
   * Replaces indexed plotline records.
   */
  public setPlotlines(plotlines: IndexedRecord[]): void {
    this.index = { ...this.index, plotlines: [...plotlines] };
  }

  /**
   * Returns the indexed synopsis record, if present.
   */
  public getSynopsis(): IndexedRecord | undefined {
    return this.index.synopsis;
  }

  /**
   * Replaces the indexed synopsis record.
   */
  public setSynopsis(synopsis: IndexedRecord | undefined): void {
    if (!synopsis) {
      const { synopsis: _synopsis, ...nextIndex } = this.index;

      this.index = nextIndex;
      return;
    }

    this.index = { ...this.index, synopsis };
  }

  /**
   * Returns the indexed routing record, if present.
   */
  public getRouting(): IndexedRecord | undefined {
    return this.index.routing;
  }

  /**
   * Replaces the indexed routing record.
   */
  public setRouting(routing: IndexedRecord | undefined): void {
    if (!routing) {
      const { routing: _routing, ...nextIndex } = this.index;

      this.index = nextIndex;
      return;
    }

    this.index = { ...this.index, routing };
  }

  /**
   * Returns the indexed structure record, if present.
   */
  public getStructure(): IndexedRecord | undefined {
    return this.index.structure;
  }

  /**
   * Replaces the indexed structure record.
   */
  public setStructure(structure: IndexedRecord | undefined): void {
    if (!structure) {
      const { structure: _structure, ...nextIndex } = this.index;

      this.index = nextIndex;
      return;
    }

    this.index = { ...this.index, structure };
  }

  /**
   * Returns the indexed timeline record, if present.
   */
  public getTimeline(): IndexedRecord | undefined {
    return this.index.timeline;
  }

  /**
   * Replaces the indexed timeline record.
   */
  public setTimeline(timeline: IndexedRecord | undefined): void {
    if (!timeline) {
      const { timeline: _timeline, ...nextIndex } = this.index;

      this.index = nextIndex;
      return;
    }

    this.index = { ...this.index, timeline };
  }
}
