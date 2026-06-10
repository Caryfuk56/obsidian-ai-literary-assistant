import type { ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";

/**
 * Sets the currently visible reusable tool output.
 */
export const setToolOutput = (_current: ToolOutput | undefined, next: ToolOutput): ToolOutput => next;

/**
 * Clears the currently visible reusable tool output.
 */
export const clearToolOutput = (): ToolOutput | undefined => {
  const clearedOutput: ToolOutput | undefined = undefined;

  return clearedOutput;
};
