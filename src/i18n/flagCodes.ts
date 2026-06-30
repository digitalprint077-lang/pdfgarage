import type { Locale } from "./languages";

/** ISO 3166-1 alpha-2 country codes for flag icons */
export const LOCALE_COUNTRY: Record<Locale, string> = {
  en: "US",
  es: "ES",
  fr: "FR",
  de: "DE",
  zh: "CN",
  ar: "SA",
  hi: "IN",
  ur: "PK",
  pt: "BR",
  ja: "JP",
};

/** Map translate/OCR codes to country for flags where applicable */
export const LANG_CODE_COUNTRY: Record<string, string> = {
  en: "US",
  eng: "US",
  es: "ES",
  spa: "ES",
  fr: "FR",
  fra: "FR",
  de: "DE",
  deu: "DE",
  zh: "CN",
  chi_sim: "CN",
  ar: "SA",
  ara: "SA",
  hi: "IN",
  hin: "IN",
  ur: "PK",
  urd: "PK",
  pt: "BR",
  por: "BR",
  ja: "JP",
  jpn: "JP",
};
