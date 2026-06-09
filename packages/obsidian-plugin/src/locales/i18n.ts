import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import cs from "./cs.json";
import en from "./en.json";

const defaultLanguage = "en";

/**
 * Initializes the shared i18n runtime used by Obsidian views and React components.
 */
export const initializeI18n = async (language = defaultLanguage): Promise<void> => {
  if (i18next.isInitialized) {
    await i18next.changeLanguage(language);
    return;
  }

  await i18next.use(initReactI18next).init({
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false
    },
    lng: language,
    resources: {
      cs: {
        translation: cs
      },
      en: {
        translation: en
      }
    }
  });
};

/**
 * Shared i18next instance for non-React plugin code.
 */
export const i18n = i18next;
