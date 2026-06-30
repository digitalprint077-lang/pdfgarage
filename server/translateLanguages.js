/**
 * MyMemory API language codes (lowercase). Keep in sync with src/i18n/languages.ts
 */
export const TRANSLATE_LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "it", label: "Italian" },
  { code: "ru", label: "Russian" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "id", label: "Indonesian" },
  { code: "vi", label: "Vietnamese" },
];

/** App code → MyMemory langpair code */
export const MYMEMORY_LANG = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  zh: "zh-CN",
  ar: "ar",
  hi: "hi",
  ur: "ur",
  pt: "pt",
  ja: "ja",
  it: "it",
  ru: "ru",
  ko: "ko",
  tr: "tr",
  nl: "nl",
  pl: "pl",
  id: "id",
  vi: "vi",
};

export const SUPPORTED_TRANSLATE_CODES = new Set(
  TRANSLATE_LANGUAGES.filter((l) => l.code !== "auto").map((l) => l.code)
);

export const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "urd", label: "Urdu" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "rus", label: "Russian" },
  { code: "kor", label: "Korean" },
  { code: "tur", label: "Turkish" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "ind", label: "Indonesian" },
  { code: "vie", label: "Vietnamese" },
];

/** ISO 639-3 (franc) → app translate code */
export const FRANC_TO_APP = {
  eng: "en",
  spa: "es",
  fra: "fr",
  deu: "de",
  cmn: "zh",
  zho: "zh",
  arb: "ar",
  hin: "hi",
  urd: "ur",
  por: "pt",
  jpn: "ja",
  ita: "it",
  rus: "ru",
  kor: "ko",
  tur: "tr",
  nld: "nl",
  pol: "pl",
  ind: "id",
  vie: "vi",
};
