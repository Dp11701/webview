import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import en from "./locales/en/translation.json";
import vi from "./locales/vi/translation.json";
import ja from "./locales/ja/translation.json";
import ko from "./locales/ko/translation.json";
import th from "./locales/th/translation.json";
import de from "./locales/de/translation.json";
import fr from "./locales/fr/translation.json";
import es from "./locales/es/translation.json";
import id from "./locales/id/translation.json";
import pt from "./locales/pt/translation.json";

i18n
  .use(LanguageDetector) // auto detect user language
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
      th: { translation: th },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      id: { translation: id },
      pt: { translation: pt },
    },
    fallbackLng: "vi", // default language
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
