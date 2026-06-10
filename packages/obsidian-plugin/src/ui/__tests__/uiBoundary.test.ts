import { readFileSync, readdirSync, statSync } from "node:fs";
import { existsSync } from "node:fs";
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

/**
 * Verifies large sidebar CSS is bundled from modular files instead of injected at runtime.
 */
export const testUiStylesUseModularCssBundle = (): void => {
  const stylesDirectory = join(process.cwd(), "src", "ui", "styles");
  const indexPath = join(stylesDirectory, "index.css");
  const oldStylesPath = join(process.cwd(), "src", "ui", "styles.ts");
  const indexSource = readFileSync(indexPath, "utf8");

  assert(existsSync(indexPath), "Expected modular CSS index file to exist.");
  assert(!existsSync(oldStylesPath), "Expected runtime styles.ts injection file to be removed.");
  assert(indexSource.includes("@import \"./layout.css\";"), "Expected layout CSS import.");
  assert(indexSource.includes("@import \"./metadata-review.css\";"), "Expected metadata review CSS import.");
};

/**
 * Verifies PromptFactory remains a pure prompt assembly boundary.
 */
export const testPromptFactoryDoesNotImportRuntimeBoundaries = (): void => {
  const promptFactoryPath = join(process.cwd(), "src", "core", "ai", "prompts", "PromptFactory.ts");
  const source = readFileSync(promptFactoryPath, "utf8");

  assert(!source.includes("from \"obsidian\""), "Expected PromptFactory not to import Obsidian APIs.");
  assert(!forbiddenImports.some((forbiddenImport) => source.includes(forbiddenImport)), "Expected PromptFactory not to import AI SDK packages.");
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
