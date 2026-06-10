import type { App } from "obsidian";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { writeApprovedChapterMetadata } from "../../chapter-metadata/chapterMetadataFrontmatter";
import type { ChapterMetadataReviewState, ToolOutput } from "../../chapter-metadata/chapterMetadataTypes";
import { MetadataReviewForm } from "../chapter-metadata/MetadataReviewForm";
import { MarkdownBlock } from "../MarkdownBlock";

/**
 * Reusable sidebar panel for workflow-specific tool output.
 */
export const ToolOutputPanel = ({
  app,
  onClear,
  output
}: {
  readonly app: App;
  readonly onClear: () => void;
  readonly output: ToolOutput | undefined;
}): ReactElement | null => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState("");

  if (!output) {
    return null;
  }

  const approveReview = async (review: ChapterMetadataReviewState): Promise<void> => {
    setErrorMessage("");
    let result;

    try {
      result = await writeApprovedChapterMetadata({
        app,
        review,
        t
      });
    } catch {
      setErrorMessage(t("chapterMetadata.errors.writeFailed"));
      return;
    }

    if (result.ok) {
      onClear();
      return;
    }

    setErrorMessage(result.message);
  };

  return (
    <aside aria-label={t("toolOutput.ariaLabel")} className="ai-tool-output-panel">
      {output.kind === "chapter-metadata-review" && (
        <MetadataReviewForm
          key={`${output.review.filePath}:${output.review.pendingMetadata.id}`}
          onApprove={(review) => {
            void approveReview(review);
          }}
          onCancel={onClear}
          review={output.review}
        />
      )}
      {output.kind === "markdown" && <MarkdownBlock app={app} markdown={output.markdown} />}
      {output.kind === "error" && <div className="ai-tool-output-error">{output.message}</div>}
      {errorMessage && <div className="ai-tool-output-error">{errorMessage}</div>}
    </aside>
  );
};
