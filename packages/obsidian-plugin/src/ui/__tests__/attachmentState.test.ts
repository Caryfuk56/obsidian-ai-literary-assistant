import { addAttachedFile, removeAttachedFile, type AttachedFile } from "../chat/attachmentState";
import { assertEqual } from "../../testUtils";

/**
 * Verifies attachment state add, duplicate, and remove behavior.
 */
export const testAttachmentStateAddRemove = (): void => {
  const firstFile: AttachedFile = {
    name: "chapter-one.md",
    path: "Drafts/chapter-one.md"
  };
  const secondFile: AttachedFile = {
    name: "chapter-two.md",
    path: "Drafts/chapter-two.md"
  };

  const oneFile = addAttachedFile([], firstFile);
  const duplicateIgnored = addAttachedFile(oneFile, firstFile);
  const twoFiles = addAttachedFile(duplicateIgnored, secondFile);
  const oneRemainingFile = removeAttachedFile(twoFiles, firstFile.path);
  const unchangedFiles = removeAttachedFile(oneRemainingFile, "missing.md");

  assertEqual(oneFile.length, 1, "Expected first file to be added");
  assertEqual(duplicateIgnored.length, 1, "Expected duplicate file to be ignored");
  assertEqual(twoFiles.length, 2, "Expected second file to be added");
  assertEqual(oneRemainingFile[0]?.path, secondFile.path, "Expected first file to be removed");
  assertEqual(unchangedFiles.length, 1, "Expected unknown removal to leave files unchanged");
};
