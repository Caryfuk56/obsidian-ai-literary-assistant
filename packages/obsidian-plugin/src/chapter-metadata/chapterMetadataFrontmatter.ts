import type { App, TFile } from "obsidian";
import type { TFunction } from "i18next";

import { prepareChapterMetadataFrontmatter } from "./chapterMetadataMerge";
import type { ChapterMetadata, ChapterMetadataBackup, ChapterMetadataReviewState } from "./chapterMetadataTypes";
import { validateApprovedChapterMetadata } from "./chapterMetadataValidation";
import {
  createChapterMetadataBackup,
  deleteChapterMetadataBackup,
  restoreChapterMetadataBackup
} from "./chapterMetadataBackup";

/**
 * Result of an approved chapter metadata write.
 */
export type ChapterMetadataWriteResult =
  | { cleanupWarning?: string; ok: true }
  | { message: string; ok: false };

/**
 * Finds a Markdown file by vault path.
 */
export const getMarkdownFileByPath = (app: App, path: string): TFile | undefined => {
  const file = app.vault.getAbstractFileByPath(path);

  if (!file || !("extension" in file) || file.extension !== "md") {
    return undefined;
  }

  return file as TFile;
};

/**
 * Writes approved metadata to frontmatter using Obsidian's native frontmatter API and backup recovery.
 */
export const writeApprovedChapterMetadata = async ({
  app,
  now = new Date(),
  notify,
  review,
  t
}: {
  readonly app: App;
  readonly now?: Date;
  readonly notify?: (message: string) => void;
  readonly review: ChapterMetadataReviewState;
  readonly t: TFunction;
}): Promise<ChapterMetadataWriteResult> => {
  const file = getMarkdownFileByPath(app, review.filePath);

  if (!file) {
    return { message: t("chapterMetadata.errors.noActiveMarkdownFile"), ok: false };
  }

  const validationResult = validateApprovedChapterMetadata(review.pendingMetadata);

  if (!validationResult.ok) {
    return { message: t("chapterMetadata.errors.invalidReviewState"), ok: false };
  }

  let backup: ChapterMetadataBackup;

  const showNotice = notify ?? showObsidianNotice;

  try {
    backup = await createChapterMetadataBackup({
      app,
      chapterId: review.pendingMetadata.id,
      file,
      now
    });
  } catch {
    return { message: t("chapterMetadata.errors.backupCreationFailed"), ok: false };
  }

  try {
    await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
      const nextFrontmatter = prepareChapterMetadataFrontmatter({
        approvedMetadata: review.pendingMetadata,
        existingFrontmatter: frontmatter,
        now: new Date()
      });

      Object.assign(frontmatter, nextFrontmatter);
    });

    await app.vault.read(file);
  } catch {
    try {
      await restoreChapterMetadataBackup({ app, backup, file });
      await deleteChapterMetadataBackup(app, backup);
      showNotice(t("chapterMetadata.notices.metadataRestored"));

      return { message: t("chapterMetadata.errors.writeFailedRestored"), ok: false };
    } catch {
      return { message: t("chapterMetadata.errors.writeFailedBackupKept", { path: backup.path }), ok: false };
    }
  }

  try {
    await deleteChapterMetadataBackup(app, backup);
  } catch {
    const cleanupWarning = t("chapterMetadata.errors.backupCleanupFailed", { path: backup.path });
    showNotice(cleanupWarning);

    return { cleanupWarning, ok: true };
  }

  showNotice(t("chapterMetadata.notices.metadataWritten"));

  return { ok: true };
};

/**
 * Returns a copy of metadata with one field changed from review UI input.
 */
export const updateChapterMetadataField = <K extends keyof ChapterMetadata>(
  metadata: ChapterMetadata,
  field: K,
  value: ChapterMetadata[K]
): ChapterMetadata => ({
  ...metadata,
  [field]: value
});

const showObsidianNotice = (message: string): void => {
  void import("obsidian").then(({ Notice }) => {
    new Notice(message);
  });
};
