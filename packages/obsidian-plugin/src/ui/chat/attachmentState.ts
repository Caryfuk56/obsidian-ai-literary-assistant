/**
 * File attached to the current chat draft as future context.
 */
export interface AttachedFile {
  name: string;
  path: string;
}

/**
 * Adds an attached file unless a file with the same path is already selected.
 */
export const addAttachedFile = (
  files: readonly AttachedFile[],
  file: AttachedFile
): AttachedFile[] => {
  if (files.some((attachedFile) => attachedFile.path === file.path)) {
    return [...files];
  }

  return [...files, file];
};

/**
 * Removes an attached file by vault path.
 */
export const removeAttachedFile = (
  files: readonly AttachedFile[],
  path: string
): AttachedFile[] => files.filter((file) => file.path !== path);
