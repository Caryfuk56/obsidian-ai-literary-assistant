import { LiteraryMetadataSchema, type LiteraryMetadata } from "../../core/metadata/metadataSchema";

/**
 * Active metadata load state derived from the active file and metadata cache.
 */
export type ActiveMetadataSnapshot<TFileLike> =
  | {
    readonly activeFile: null;
    readonly errorKey: "metadataView.errors.noActiveMarkdownFile";
    readonly kind: "no-active-file";
    readonly metadata: null;
  }
  | {
    readonly activeFile: TFileLike;
    readonly errorKey: "metadataView.errors.noFrontmatter";
    readonly kind: "no-frontmatter";
    readonly metadata: null;
  }
  | {
    readonly activeFile: TFileLike;
    readonly errorKey: "metadataView.errors.invalidMetadata";
    readonly kind: "invalid-metadata";
    readonly metadata: null;
  }
  | {
    readonly activeFile: TFileLike;
    readonly errorKey: undefined;
    readonly kind: "valid";
    readonly metadata: LiteraryMetadata;
  };

/**
 * Derives active metadata panel state from an active file and raw frontmatter.
 */
export const deriveActiveMetadataSnapshot = <TFileLike>(
  activeFile: TFileLike | null,
  frontmatter: Record<string, unknown> | undefined
): ActiveMetadataSnapshot<TFileLike> => {
  if (!activeFile) {
    return {
      activeFile: null,
      errorKey: "metadataView.errors.noActiveMarkdownFile",
      kind: "no-active-file",
      metadata: null
    };
  }

  if (!frontmatter) {
    return {
      activeFile,
      errorKey: "metadataView.errors.noFrontmatter",
      kind: "no-frontmatter",
      metadata: null
    };
  }

  const result = LiteraryMetadataSchema.safeParse(frontmatter);

  if (!result.success) {
    return {
      activeFile,
      errorKey: "metadataView.errors.invalidMetadata",
      kind: "invalid-metadata",
      metadata: null
    };
  }

  return {
    activeFile,
    errorKey: undefined,
    kind: "valid",
    metadata: result.data
  };
};
