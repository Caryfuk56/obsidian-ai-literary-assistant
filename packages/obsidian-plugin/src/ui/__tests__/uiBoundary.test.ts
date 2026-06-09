import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

import { assert } from "../../testUtils";

const forbiddenImports = ["from \"ai\"", "from '@ai-sdk/", "from \"@ai-sdk/"];

/**
 * Verifies React UI files do not import AI SDK packages directly.
 */
export const testUiDoesNotImportAiSdk = (): void => {
  const uiDirectory = join(process.cwd(), "src", "ui");
  const files = collectTypeScriptFiles(uiDirectory);
  const offendingFile = files.find((file) => {
    const source = readFileSync(file, "utf8");

    return forbiddenImports.some((forbiddenImport) => source.includes(forbiddenImport));
  });

  assert(offendingFile === undefined, `Expected UI files not to import AI SDK packages directly: ${offendingFile ?? ""}`);
};

const collectTypeScriptFiles = (directory: string): string[] => {
  const entries = readdirSync(directory);

  return entries.flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return collectTypeScriptFiles(path);
    }

    if (path.includes(`${sep}__tests__${sep}`)) {
      return [];
    }

    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
};
