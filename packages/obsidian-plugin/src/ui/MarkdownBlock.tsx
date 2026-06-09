import { Component, MarkdownRenderer, type App } from "obsidian";
import { type ReactElement, useEffect, useRef } from "react";

/**
 * Renders markdown through Obsidian's MarkdownRenderer with React cleanup.
 */
export const MarkdownBlock = ({
  app,
  markdown,
  sourcePath = ""
}: {
  readonly app: App;
  readonly markdown: string;
  readonly sourcePath?: string;
}): ReactElement => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const component = new Component();
    const contentElement = contentRef.current;

    if (!contentElement) {
      return () => {
        component.unload();
      };
    }

    contentElement.empty();
    component.load();
    void MarkdownRenderer.render(app, markdown, contentElement, sourcePath, component);

    return () => {
      component.unload();
      contentElement.empty();
    };
  }, [app, markdown, sourcePath]);

  return <div className="ai-markdown-response" ref={contentRef} />;
};
