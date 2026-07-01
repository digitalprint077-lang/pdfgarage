export {
  ALL_FORMATS,
  ANY_FORMAT,
  CATEGORIES,
  TOOLS,
  POPULAR_CONVERSIONS,
  getFormatsByCategory,
  getFormat,
  inferFormatFromFile,
  getAcceptTypes,
} from "./catalog";

export type { FormatCategory, Operation, ToolDef, FormatDef } from "./catalog";

import { ALL_FORMATS, ANY_FORMAT, POPULAR_CONVERSIONS } from "./catalog";

export const FROM_PDF_TARGETS = ALL_FORMATS.filter((f) => f.id !== "pdf");

export const TO_PDF_SOURCES = ALL_FORMATS.filter((f) => f.id !== "pdf");

export const ALL_OUTPUT_FORMATS = [ANY_FORMAT, ...FROM_PDF_TARGETS];

export const ALL_INPUT_FORMAT_OPTIONS = ALL_FORMATS.map((f) => ({
  id: f.id,
  label: f.label,
  category: f.category,
}));

export const ALL_OUTPUT_FORMAT_OPTIONS = [
  { id: ANY_FORMAT.id, label: ANY_FORMAT.label, category: ANY_FORMAT.category },
  ...ALL_INPUT_FORMAT_OPTIONS,
];

/** Random input/output pair for home-page format card demo rotation. */
export function pickRandomConversionPair(current?: { from: string; to: string }): { from: string; to: string } {
  const pickOne = (): { from: string; to: string } => {
    if (Math.random() < 0.65 && POPULAR_CONVERSIONS.length > 0) {
      const pick = POPULAR_CONVERSIONS[Math.floor(Math.random() * POPULAR_CONVERSIONS.length)];
      return { from: pick.from, to: pick.to };
    }

    const from = ALL_FORMATS[Math.floor(Math.random() * ALL_FORMATS.length)].id;
    const useAny = Math.random() < 0.3;
    let to = useAny
      ? ANY_FORMAT.id
      : ALL_FORMATS[Math.floor(Math.random() * ALL_FORMATS.length)].id;
    if (to === from) {
      to = ANY_FORMAT.id;
    }
    return { from, to };
  };

  for (let attempt = 0; attempt < 24; attempt++) {
    const pair = pickOne();
    if (!current || pair.from !== current.from || pair.to !== current.to) {
      return pair;
    }
  }

  return { from: "docx", to: "pdf" };
}

export const PDF_FORMAT = ALL_FORMATS.find((f) => f.id === "pdf")!;
