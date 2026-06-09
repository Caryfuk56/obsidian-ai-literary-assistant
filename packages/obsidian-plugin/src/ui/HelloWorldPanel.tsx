import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Renders the initial Literary Assistant sidebar panel.
 */
export const HelloWorldPanel = (): ReactElement => {
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      // React cleanup hook kept explicit for Obsidian hot-reload unmounts.
    };
  }, []);

  return (
    <section aria-labelledby="literary-assistant-heading">
      <h2 id="literary-assistant-heading">{t("view.heading")}</h2>
      <p>{t("view.body")}</p>
    </section>
  );
};
