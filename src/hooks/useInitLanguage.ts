import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useInitLanguage(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const init = () => {
      const languageFromExtra = (window as any).ikapp?.extraInfo?.language_code;
      if (languageFromExtra) {
        const normalized = String(languageFromExtra).toLowerCase().slice(0, 2);
        if (i18n.hasResourceBundle(normalized, "translation")) {
          i18n.changeLanguage(normalized);
          return;
        }
      }
      i18n.changeLanguage("en");
    };

    init();

    const prevHandler = (window as any).ikapp?.onLanguageCodeChanged;
    const handler = (code: string) => {
      const normalized = String(code).toLowerCase().slice(0, 2);
      if (i18n.hasResourceBundle(normalized, "translation")) {
        i18n.changeLanguage(normalized);
      }
    };

    if ((window as any).ikapp) {
      (window as any).ikapp.onLanguageCodeChanged = handler;
    }

    return () => {
      if ((window as any).ikapp) {
        (window as any).ikapp.onLanguageCodeChanged = prevHandler;
      }
    };
  }, [i18n]);
}
