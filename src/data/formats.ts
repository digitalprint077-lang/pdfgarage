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

export const FROM_PDF_TARGETS = ALL_FORMATS.filter(
  (f) => f.id !== "pdf" && f.category !== "video" && f.category !== "audio"
);

const MEDIA_OUTPUT_SKIP = new Set(["ape", "mid", "midi", "rm", "swf"]);

export const MEDIA_TARGETS = ALL_FORMATS.filter(
  (f) => (f.category === "video" || f.category === "audio") && !MEDIA_OUTPUT_SKIP.has(f.id)
);

export const TO_PDF_SOURCES = ALL_FORMATS.filter((f) => f.id !== "pdf");

export const ALL_OUTPUT_FORMATS = [ANY_FORMAT, ...FROM_PDF_TARGETS, ...MEDIA_TARGETS];

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
export function pickRandomConversionPair(): { from: string; to: string } {
  if (Math.random() < 0.65 && POPULAR_CONVERSIONS.length > 0) {
    const pick = POPULAR_CONVERSIONS[Math.floor(Math.random() * POPULAR_CONVERSIONS.length)];
    return { from: pick.from, to: pick.to };
  }
  const from = ALL_FORMATS[Math.floor(Math.random() * ALL_FORMATS.length)];
  let to = ALL_FORMATS[Math.floor(Math.random() * ALL_FORMATS.length)];
  let guard = 0;
  while (to.id === from.id && guard++ < 30) {
    to = ALL_FORMATS[Math.floor(Math.random() * ALL_FORMATS.length)];
  }
  return { from: from.id, to: to.id };
}

export const PDF_FORMAT = ALL_FORMATS.find((f) => f.id === "pdf")!;
