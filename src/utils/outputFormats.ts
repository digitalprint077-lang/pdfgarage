import { ALL_FORMATS, getFormat } from "../data/catalog";
import type { FormatCategory } from "../data/catalog";
import type { PickerOption } from "../components/FormatPickerPanel";

export function getOutputFormatOptions(fromFormat: string): PickerOption[] {
  const from = fromFormat.toLowerCase();
  const fromDef = getFormat(from);

  if (from === "pdf") {
    return ALL_FORMATS.filter((f) => f.id !== "pdf").map(toPicker);
  }

  if (fromDef?.category === "image") {
    return ALL_FORMATS.filter(
      (f) => f.category === "image" || f.id === "pdf" || f.category === "document"
    ).map(toPicker);
  }

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
