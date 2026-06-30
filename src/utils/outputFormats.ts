import { ALL_FORMATS, getFormat } from "../data/catalog";
import type { FormatCategory } from "../data/catalog";
import type { PickerOption } from "../components/FormatPickerPanel";

/** Formats listed in catalog but not available as conversion output. */
const AUDIO_OUTPUT_SKIP = new Set(["ape", "mid", "midi"]);
const VIDEO_OUTPUT_SKIP = new Set(["rm", "swf"]);

function isValidMediaOutput(id: string, category: "audio" | "video") {
  if (category === "audio") return !AUDIO_OUTPUT_SKIP.has(id);
  return !VIDEO_OUTPUT_SKIP.has(id);
}
export function getOutputFormatOptions(fromFormat: string): PickerOption[] {
  const from = fromFormat.toLowerCase();
  const fromDef = getFormat(from);

  if (from === "pdf") {
    return ALL_FORMATS.filter((f) => f.category !== "video" && f.category !== "audio").map(toPicker);
  }

  if (fromDef?.category === "image") {
    return ALL_FORMATS.filter(
      (f) => f.category === "image" || f.id === "pdf" || f.category === "document"
    ).map(toPicker);
  }

  if (fromDef?.category === "video") {
    return ALL_FORMATS.filter(
      (f) =>
        (f.category === "video" || f.category === "audio") &&
        (f.category === "audio" ? isValidMediaOutput(f.id, "audio") : isValidMediaOutput(f.id, "video"))
    ).map(toPicker);
  }

  if (fromDef?.category === "audio") {
    return ALL_FORMATS.filter((f) => f.category === "audio" && isValidMediaOutput(f.id, "audio")).map(toPicker);
  }
  // Office / document / default → PDF + documents + images
  return ALL_FORMATS.filter(
    (f) =>
      f.id === "pdf" ||
      f.category === "document" ||
      f.category === "image" ||
      f.category === "spreadsheet" ||
      f.category === "presentation"
  )
    .filter((f) => f.id !== from)
    .map(toPicker);
}

function toPicker(f: { id: string; label: string; category: FormatCategory }): PickerOption {
  return { id: f.id, label: f.label, category: f.category };
}

export function formatFileTypeLabel(format: string): string {
  const def = getFormat(format);
  if (!def) return format.toUpperCase();
  const labels: Partial<Record<FormatCategory, string>> = {
    document: "Document",
    image: "Image",
    video: "Video",
    audio: "Audio",
    spreadsheet: "Spreadsheet",
    presentation: "Presentation",
    ebook: "E-book",
    archive: "Archive",
    vector: "Vector",
    cad: "CAD",
    font: "Font",
  };
  return `${def.label} ${labels[def.category] || "File"}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
