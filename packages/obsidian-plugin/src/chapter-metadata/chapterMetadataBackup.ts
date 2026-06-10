import type { App, TFile } from "obsidian";

import type { ChapterMetadataBackup } from "./chapterMetadataTypes";

const BACKUP_FOLDER = ".aurelius/backups";
const BACKUP_PARENT_FOLDER = ".aurelius";

/**
 * Ensures the chapter metadata backup folder exists in the vault.
 */
export const ensureChapterMetadataBackupFolder = async (app: App): Promise<void> => {
  const parentFolderPath = normalizeBackupPath(BACKUP_PARENT_FOLDER);
  const backupFolderPath = normalizeBackupPath(BACKUP_FOLDER);

  if (!await app.vault.adapter.exists(parentFolderPath)) {
    await app.vault.adapter.mkdir(parentFolderPath);
  }

  if (!await app.vault.adapter.exists(backupFolderPath)) {
    await app.vault.adapter.mkdir(backupFolderPath);
  }
};

/**
 * Builds a vault-relative backup path for a chapter file.
 */
export const buildChapterMetadataBackupPath = ({
  chapterId,
  file,
  now
}: {
  readonly chapterId: string;
  readonly file: Pick<TFile, "basename">;
  readonly now: Date;
}): string => {
  const sanitizedBaseName = sanitizePathPart(file.basename || "chapter");
  const timestamp = toBackupTimestamp(now);
  const idPart = chapterId ? `-${sanitizePathPart(chapterId)}` : "";

  return `${BACKUP_FOLDER}/${sanitizedBaseName}${idPart}-${timestamp}.md`;
};

/**
 * Creates a physical backup copy before writing chapter frontmatter.
 */
export const createChapterMetadataBackup = async ({
  app,
  chapterId,
  file,
  now
}: {
  readonly app: App;
  readonly chapterId: string;
  readonly file: TFile;
  readonly now: Date;
}): Promise<ChapterMetadataBackup> => {
  await ensureChapterMetadataBackupFolder(app);

  const originalContent = await app.vault.read(file);
  const path = normalizeBackupPath(buildChapterMetadataBackupPath({ chapterId, file, now }));
  await app.vault.adapter.write(path, originalContent);

  return { originalContent, path };
};

/**
 * Deletes a backup file if it still exists.
 */
export const deleteChapterMetadataBackup = async (app: App, backup: ChapterMetadataBackup): Promise<void> => {
  const backupPath = normalizeBackupPath(backup.path);

  if (await app.vault.adapter.exists(backupPath)) {
    await app.vault.adapter.remove(backupPath);
  }
};

/**
 * Restores original chapter content after a failed write.
 */
export const restoreChapterMetadataBackup = async ({
  app,
  backup,
  file
}: {
  readonly app: App;
  readonly backup: ChapterMetadataBackup;
  readonly file: TFile;
}): Promise<void> => {
  await app.vault.modify(file, backup.originalContent);
};

const toBackupTimestamp = (date: Date): string => (
  [
    date.getUTCFullYear().toString(),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
    date.getUTCHours().toString().padStart(2, "0"),
    date.getUTCMinutes().toString().padStart(2, "0"),
    date.getUTCSeconds().toString().padStart(2, "0")
  ].join("")
);

const sanitizePathPart = (value: string): string => value.replace(/[^A-Za-z0-9_-]+/gu, "-").replace(/^-+|-+$/gu, "") || "chapter";

const normalizeBackupPath = (path: string): string => path.replace(/\\/gu, "/").replace(/\/{2,}/gu, "/");
