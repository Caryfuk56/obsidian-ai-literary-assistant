import type { App, TFile } from "obsidian";
import type { TFunction } from "i18next";

import { buildChapterMetadataBackupPath, createChapterMetadataBackup } from "../chapterMetadataBackup";
import { extractChapterMetadataSuggestion } from "../chapterMetadataExtraction";
import { writeApprovedChapterMetadata } from "../chapterMetadataFrontmatter";
import { mergeChapterMetadataSuggestion, prepareChapterMetadataFrontmatter } from "../chapterMetadataMerge";
import { validateChapterMetadataSuggestionObject } from "../chapterMetadataSchema";
import { parseChapterMetadataSuggestion } from "../chapterMetadataValidation";
import { extractChapterText } from "../chapterTextExtraction";
import { createChapterMetadataReview } from "../chapterMetadataWorkflow";
import type { ChapterMetadataReviewState, ChapterMetadataSuggestion } from "../chapterMetadataTypes";
import { DEFAULT_AURELIUS_SETTINGS } from "../../settings/defaultSettings";
import { assert, assertEqual } from "../../testUtils";

const suggestion: ChapterMetadataSuggestion = {
  linked_characters: ["[[CHAR_Fabian]]"],
  linked_history: [],
  linked_items: [],
  linked_locations: ["[[LOC_Klub_Neon]]"],
  linked_organizations: [],
  linked_plotlines: [],
  linked_systems: [],
  narrative_time: "noc",
  pov: "[[CHAR_Fabian]]",
  summary: "Fabian přebírá zásilku.",
  title: "Stíny nad neonem"
};

/**
 * Verifies timestamp id generation and protected metadata merge behavior.
 */
export const testChapterMetadataMergeProtectsFields = (): void => {
  const metadata = mergeChapterMetadataSuggestion({
    existingFrontmatter: {
      id: "existing-id",
      metadata_created: "2026-01-01T00:00:00.000Z",
      spoiler_level: "private",
      status: "done",
      timeline_position: "42"
    },
    now: new Date("2026-06-09T21:30:45.000Z"),
    suggestion
  });

  assertEqual(metadata.id, "existing-id", "Expected existing id to be preserved");
  assertEqual(metadata.metadata_created, "2026-01-01T00:00:00.000Z", "Expected created timestamp to be preserved");
  assertEqual(metadata.status, "done", "Expected existing status to be preserved");
  assertEqual(metadata.timeline_position, "42", "Expected timeline position to be preserved");
  assertEqual(metadata.spoiler_level, "private", "Expected spoiler level to be preserved");
  assertEqual(metadata.title, "Stíny nad neonem", "Expected title suggestion to merge");
};

/**
 * Verifies missing protected fields receive safe defaults.
 */
export const testChapterMetadataMergeDefaultsMissingFields = (): void => {
  const metadata = mergeChapterMetadataSuggestion({
    existingFrontmatter: {},
    now: new Date("2026-06-09T21:30:45.000Z"),
    suggestion
  });

  assertEqual(metadata.id, "20260609213045", "Expected timestamp id format");
  assertEqual(metadata.status, "draft", "Expected missing status to default to draft");
  assertEqual(metadata.type, "chapter", "Expected missing type to default to chapter");
  assertEqual(metadata.spoiler_level, "internal", "Expected missing spoiler level to default to internal");
};

/**
 * Verifies unknown existing status is preserved exactly.
 */
export const testChapterMetadataMergePreservesUnknownStatus = (): void => {
  const metadata = mergeChapterMetadataSuggestion({
    existingFrontmatter: { status: "custom_review" },
    now: new Date("2026-06-09T21:30:45.000Z"),
    suggestion
  });

  assertEqual(metadata.status, "custom_review", "Expected unknown existing status to be preserved");
};

/**
 * Verifies approved write preparation updates only the update timestamp.
 */
export const testChapterMetadataPrepareFrontmatterUpdatesTimestamp = (): void => {
  const metadata = mergeChapterMetadataSuggestion({
    existingFrontmatter: { custom: "keep" },
    now: new Date("2026-06-09T21:30:45.000Z"),
    suggestion
  });
  const prepared = prepareChapterMetadataFrontmatter({
    approvedMetadata: metadata,
    existingFrontmatter: { custom: "keep" },
    now: new Date("2026-06-10T10:15:00.000Z")
  });

  assertEqual(prepared["custom"], "keep", "Expected unknown frontmatter to be preserved");
  assertEqual(prepared["metadata_updated"], "2026-06-10T10:15:00.000Z", "Expected updated timestamp to change");
};

/**
 * Verifies AI response validation rejects and normalizes expected shapes.
 */
export const testChapterMetadataValidation = (): void => {
  assertEqual(parseChapterMetadataSuggestion("not json").ok, false, "Expected non-JSON to be rejected");
  assertEqual(parseChapterMetadataSuggestion("{\"narrative_time\":\"poledne\"}").ok, false, "Expected invalid narrative time to be rejected");

  const result = parseChapterMetadataSuggestion(JSON.stringify({
    narrative_time: "noc",
    title: "Title"
  }));

  assert(result.ok, "Expected minimal valid JSON to parse");
  assertEqual(result.ok ? result.suggestion.title : "", "Title", "Expected string fields to parse");
  assertEqual(result.ok ? result.suggestion.linked_items.length : -1, 0, "Expected missing arrays to normalize");
  assertEqual(result.ok ? result.suggestion.pov : "x", "", "Expected missing strings to normalize");
};

/**
 * Verifies structured schema rejects invalid linked field shape.
 */
export const testChapterMetadataSchemaRejectsInvalidShape = (): void => {
  const result = validateChapterMetadataSuggestionObject({
    ...suggestion,
    linked_characters: "[[CHAR_Fabian]]"
  });

  assertEqual(result.ok, false, "Expected linked fields to require arrays");
};

/**
 * Verifies structured extraction returns typed metadata and diagnostics.
 */
export const testChapterMetadataStructuredExtraction = async (): Promise<void> => {
  let capturedPrompt = "";
  let capturedSystem = "";
  const result = await extractChapterMetadataSuggestion({
    factory: {} as never,
    generateRaw: ({ prompt, system, tier }) => {
      capturedPrompt = prompt;
      capturedSystem = system;

      return Promise.resolve({
        diagnostics: {
          modelId: "model",
          promptFiles: [],
          provider: "provider",
          stage: "model-call",
          tier,
          validationErrors: []
        },
        metadata: suggestion,
        ok: true
      });
    },
    settingsDefaultTier: "basic",
    text: "Chapter text"
  });

  assert(result.ok, "Expected structured extraction to succeed");
  assert(capturedPrompt.includes("Chapter text"), "Expected user prompt to include chapter text");
  assert(capturedSystem.includes("Expected object shape"), "Expected composed markdown prompt to include schema skeleton");
  assert(result.ok ? result.diagnostics?.promptFiles.includes("tasks/chapter-metadata.md") === true : false, "Expected prompt factory diagnostics");
};

/**
 * Verifies leading YAML frontmatter is removed without changing body text.
 */
export const testChapterTextExtraction = (): void => {
  const text = extractChapterText("---\ntype: chapter\n---\n# Chapter\nBody");

  assertEqual(text, "# Chapter\nBody", "Expected YAML frontmatter to be removed");
};

/**
 * Verifies backup paths include basename, id, and timestamp.
 */
export const testChapterMetadataBackupPath = (): void => {
  const path = buildChapterMetadataBackupPath({
    chapterId: "20260609213045",
    file: { basename: "chapter" },
    now: new Date("2026-06-10T10:15:00.000Z")
  });

  assert(path.includes("chapter-20260609213045-20260610101500.md"), "Expected backup path to include chapter id and timestamp");
};

/**
 * Verifies backup creation uses the adapter when hidden folders are not indexed as vault files.
 */
export const testChapterMetadataBackupUsesAdapterForHiddenFolder = async (): Promise<void> => {
  const createdFolders: string[] = [];
  let writtenPath = "";
  const file = { basename: "chapter", extension: "md", path: "chapter.md" } as TFile;
  const app = {
    vault: {
      adapter: {
        exists: (path: string) => Promise.resolve(path === ".aurelius"),
        mkdir: (path: string) => Promise.resolve().then(() => {
          createdFolders.push(path);
        }),
        write: (path: string) => Promise.resolve().then(() => {
          writtenPath = path;
        })
      },
      getAbstractFileByPath: () => null,
      read: () => Promise.resolve("original")
    }
  } as unknown as App;

  const backup = await createChapterMetadataBackup({
    app,
    chapterId: "20260609213045",
    file,
    now: new Date("2026-06-10T10:15:00.000Z")
  });

  assertEqual(createdFolders.length, 1, "Expected only missing backup child folder to be created");
  assertEqual(createdFolders[0], ".aurelius/backups", "Expected adapter mkdir for backup folder");
  assertEqual(writtenPath, backup.path, "Expected adapter write for backup file");
};

/**
 * Verifies the command workflow returns review state with a fake model response.
 */
export const testChapterMetadataWorkflowCreatesReview = async (): Promise<void> => {
  const file = {
    extension: "md",
    path: "chapter.md"
  } as TFile;
  const app = {
    metadataCache: {
      getFileCache: () => ({ frontmatter: { status: "done" } })
    },
    vault: {
      read: () => Promise.resolve("# Chapter\nBody")
    },
    workspace: {
      getActiveFile: () => file
    }
  } as unknown as App;

  const result = await createChapterMetadataReview({
    app,
    generateRaw: () => Promise.resolve({
      diagnostics: {
        promptFiles: [],
        stage: "model-call",
        validationErrors: []
      },
      metadata: suggestion,
      ok: true
    }),
    settings: DEFAULT_AURELIUS_SETTINGS
  });

  assert(result.ok, "Expected workflow to produce review state");
  assertEqual(result.ok ? result.review.pendingMetadata.status : "", "done", "Expected existing status to win");
};

/**
 * Verifies backup creation failure prevents frontmatter writes.
 */
export const testChapterMetadataBackupCreationFailurePreventsWrite = async (): Promise<void> => {
  let writeAttempted = false;
  const app = createFakeWriteApp({
    createThrows: true,
    onWrite: () => {
      writeAttempted = true;
    }
  });
  const result = await writeApprovedChapterMetadata({
    app,
    notify: () => undefined,
    review: createFakeReview(),
    t: translateKey
  });

  assertEqual(result.ok, false, "Expected backup failure to return error");
  assertEqual(writeAttempted, false, "Expected backup failure to prevent write");
};

/**
 * Verifies write failure restores original content from backup.
 */
export const testChapterMetadataWriteFailureRestoresBackup = async (): Promise<void> => {
  let restoredContent = "";
  const app = createFakeWriteApp({
    processThrows: true,
    onModify: (content) => {
      restoredContent = content;
    }
  });
  const result = await writeApprovedChapterMetadata({
    app,
    notify: () => undefined,
    review: createFakeReview(),
    t: translateKey
  });

  assertEqual(result.ok, false, "Expected write failure to return error");
  assertEqual(restoredContent, "original", "Expected original content to be restored");
};

/**
 * Verifies backup cleanup failure does not restore old content.
 */
export const testChapterMetadataCleanupFailureDoesNotRestore = async (): Promise<void> => {
  let restoredContent = "";
  const app = createFakeWriteApp({
    deleteThrows: true,
    onModify: (content) => {
      restoredContent = content;
    }
  });
  const result = await writeApprovedChapterMetadata({
    app,
    notify: () => undefined,
    review: createFakeReview(),
    t: translateKey
  });

  assert(result.ok, "Expected cleanup failure to keep successful write");
  assertEqual(restoredContent, "", "Expected cleanup failure not to restore backup");
};

const translateKey = ((key: string, options?: Record<string, string>): string => (
  options?.["path"] ? `${key}:${options["path"]}` : key
)) as TFunction;

const createFakeReview = (): ChapterMetadataReviewState => ({
  editableFields: {},
  filePath: "chapter.md",
  originalFrontmatter: {},
  pendingMetadata: mergeChapterMetadataSuggestion({
    existingFrontmatter: {},
    now: new Date("2026-06-09T21:30:45.000Z"),
    suggestion
  })
});

const createFakeWriteApp = ({
  createThrows = false,
  deleteThrows = false,
  onModify = () => undefined,
  onWrite = () => undefined,
  processThrows = false
}: {
  readonly createThrows?: boolean;
  readonly deleteThrows?: boolean;
  readonly onModify?: (content: string) => void;
  readonly onWrite?: () => void;
  readonly processThrows?: boolean;
}): App => {
  const file = { basename: "chapter", extension: "md", path: "chapter.md" } as TFile;
  const existingPaths = new Set<string>([".aurelius", ".aurelius/backups"]);

  return {
    fileManager: {
      processFrontMatter: () => Promise.resolve().then(() => {
        onWrite();

        if (processThrows) {
          throw new Error("write failed");
        }
      })
    },
    vault: {
      adapter: {
        exists: (path: string) => Promise.resolve(existingPaths.has(path)),
        mkdir: (path: string) => Promise.resolve().then(() => {
          existingPaths.add(path);
        }),
        remove: (path: string) => Promise.resolve().then(() => {
          if (deleteThrows) {
            throw new Error("delete failed");
          }

          existingPaths.delete(path);
        }),
        write: (path: string) => Promise.resolve().then(() => {
          if (createThrows) {
            throw new Error("backup failed");
          }

          existingPaths.add(path);
        })
      },
      getAbstractFileByPath: (path: string) => (path === "chapter.md" || path.endsWith(".md") ? file : null),
      modify: (_file: TFile, content: string) => Promise.resolve().then(() => {
        onModify(content);
      }),
      read: () => Promise.resolve("original")
    }
  } as unknown as App;
};
