import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { UI_LANGUAGES, type Locale } from "./languages";
import { t, type TranslationKey } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  currentLanguage: (typeof UI_LANGUAGES)[number];
}

const STORAGE_KEY = "pdfconvert-locale";

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved && UI_LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });

  const currentLanguage = UI_LANGUAGES.find((l) => l.code === locale) || UI_LANGUAGES[0];

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = currentLanguage.dir;
  }, [locale, currentLanguage.dir]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: (key) => t(locale, key),
        dir: currentLanguage.dir,
        currentLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
