import { TFile, type App } from "obsidian";

import type { MetadataType } from "../../core/types/metadata.types";

/**
 * Builds a simple metadata placeholder file path for a missing referenced entity.
 */
export const buildMetadataPlaceholderPath = (
  type: MetadataType,
  label: string
): string => `Aurelius Placeholders/${type}s/${sanitizeFilename(label)}.md`;

/**
 * Creates or opens a simple placeholder file for a missing metadata reference.
 */
export const createOrOpenMetadataPlaceholder = async ({
  app,
  label,
  type
}: {
  readonly app: App;
  readonly label: string;
  readonly type: MetadataType;
}): Promise<void> => {
  const path = buildMetadataPlaceholderPath(type, label);
  const existingFile = app.vault.getAbstractFileByPath(path);
  const parentPath = path.split("/").slice(0, -1).join("/");

  await ensureFolderPath(app, parentPath);

  const file = existingFile instanceof TFile
    ? existingFile
    : await app.vault.create(path, buildPlaceholderContent(type, label));

  await app.workspace.getLeaf(false).openFile(file);
};

const buildPlaceholderContent = (type: MetadataType, label: string): string => {
  const timestamp = new Date().toISOString();
  const frontmatter = {
    ...getRequiredDefaults(type),
    createdAt: timestamp,
    id: slugify(label),
    title: label,
    type,
    updatedAt: timestamp,
    version: "1"
  };
  const lines = Object.entries(frontmatter).map(([key, value]) => `${key}: ${value}`);

  return `---\n${lines.join("\n")}\n---\n\n# ${label}\n`;
};

const getRequiredDefaults = (type: MetadataType): Record<string, string> => {
  switch (type) {
    case "chapter":
      return { status: "draft" };
    case "character":
      return { importance: "minor" };
    case "history":
    case "item":
    case "location":
    case "organization":
    case "plotline":
    case "system":
    case "theme":
      return { relevance: "background" };
    case "routing":
    case "structure":
    case "timeline":
      return { status: "draft" };
    case "synopsis":
      return { language: "cs", status: "draft" };
  }
};

const ensureFolderPath = async (app: App, path: string): Promise<void> => {
  const segments = path.split("/").filter((segment) => segment.length > 0);
  let currentPath = "";

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;

    if (!app.vault.getAbstractFileByPath(currentPath)) {
      await app.vault.createFolder(currentPath);
    }
  }
};

const sanitizeFilename = (label: string): string => {
  const sanitized = label.trim().replace(/[\\/:*?"<>|#^[\]]+/g, "-").replace(/\s+/g, " ");

  return sanitized.length > 0 ? sanitized : "Untitled";
};

const slugify = (label: string): string => {
  const slug = label.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return slug.length > 0 ? slug : `metadata-${String(Date.now())}`;
};
