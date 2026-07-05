import { type App, type TFile } from "obsidian";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";

import type { LiteraryMetadata } from "../../core/metadata/metadataSchema";
import { deriveActiveMetadataSnapshot, type ActiveMetadataSnapshot } from "./activeMetadataState";

/**
 * Loads and subscribes to active-file metadata for the metadata panel.
 */
export const useActiveMetadata = ({
  app,
  onBeforeLoad,
  refreshToken
}: {
  readonly app: App;
  readonly onBeforeLoad: () => void;
  readonly refreshToken: number;
}): {
  readonly activeFile: TFile | null;
  readonly draftMetadata: LiteraryMetadata | null;
  readonly errorKey: string | undefined;
  readonly loadActiveMetadata: (nextFile?: TFile | null) => void;
  readonly originalMetadata: LiteraryMetadata | null;
  readonly setDraftMetadata: Dispatch<SetStateAction<LiteraryMetadata | null>>;
  readonly setOriginalMetadata: Dispatch<SetStateAction<LiteraryMetadata | null>>;
  readonly stateKind: ActiveMetadataSnapshot<TFile>["kind"];
} => {
  const [snapshot, setSnapshot] = useState<ActiveMetadataSnapshot<TFile>>({
    activeFile: null,
    errorKey: "metadataView.errors.noActiveMarkdownFile",
    kind: "no-active-file",
    metadata: null
  });
  const [originalMetadata, setOriginalMetadata] = useState<LiteraryMetadata | null>(null);
  const [draftMetadata, setDraftMetadata] = useState<LiteraryMetadata | null>(null);

  const loadActiveMetadata = useCallback((nextFile?: TFile | null): void => {
    const file = nextFile === undefined ? app.workspace.getActiveFile() : nextFile;
    const nextSnapshot = deriveActiveMetadataSnapshot(file, file ? app.metadataCache.getFileCache(file)?.frontmatter : undefined);

    onBeforeLoad();
    setSnapshot(nextSnapshot);

    if (nextSnapshot.kind === "valid") {
      setOriginalMetadata(nextSnapshot.metadata);
      setDraftMetadata(nextSnapshot.metadata);
      return;
    }

    setOriginalMetadata(null);
    setDraftMetadata(null);
  }, [app, onBeforeLoad]);

  useEffect(() => {
    loadActiveMetadata();
  }, [loadActiveMetadata, refreshToken]);

  useEffect(() => {
    const fileOpenRef = app.workspace.on("file-open", (file) => {
      loadActiveMetadata(file);
    });
    const activeLeafRef = app.workspace.on("active-leaf-change", () => {
      loadActiveMetadata();
    });

    return () => {
      app.workspace.offref(fileOpenRef);
      app.workspace.offref(activeLeafRef);
    };
  }, [app, loadActiveMetadata]);

  return {
    activeFile: snapshot.activeFile,
    draftMetadata,
    errorKey: snapshot.errorKey,
    loadActiveMetadata,
    originalMetadata,
    setDraftMetadata,
    setOriginalMetadata,
    stateKind: snapshot.kind
  };
};
