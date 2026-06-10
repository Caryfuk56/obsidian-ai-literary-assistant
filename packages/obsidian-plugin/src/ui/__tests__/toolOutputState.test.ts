import type { ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";
import { assertEqual } from "../../testUtils";
import { clearToolOutput, setToolOutput } from "../tool-output/toolOutputState";

/**
 * Verifies reusable tool output state helpers.
 */
export const testToolOutputStateSetAndClear = (): void => {
  const output: ToolOutput = {
    kind: "markdown",
    markdown: "content"
  };

  assertEqual(setToolOutput(undefined, output), output, "Expected tool output to be set");
  const clearedOutput = clearToolOutput();
  assertEqual(clearedOutput, undefined, "Expected tool output to clear");
};
