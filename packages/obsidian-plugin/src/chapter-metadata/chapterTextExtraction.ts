const YAML_FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u;

/**
 * Removes leading YAML frontmatter from raw Markdown content.
 */
export const extractChapterText = (content: string): string => content.replace(YAML_FRONTMATTER_PATTERN, "").trim();
