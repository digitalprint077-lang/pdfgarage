export type FormatCategory =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "spreadsheet"
  | "presentation"
  | "ebook"
  | "archive"
  | "vector"
  | "cad"
  | "font";

export type Operation =
  | "convert"
  | "merge"
  | "compress"
  | "extract"
  | "create-archive"
  | "ocr"
  | "translate";

export interface FormatDef {
  id: string;
  label: string;
  category: FormatCategory;
}

export const CATEGORIES: { id: FormatCategory; label: string; count: number }[] = [
  { id: "document", label: "Documents", count: 23 },
  { id: "image", label: "Images", count: 42 },
  { id: "video", label: "Video", count: 28 },
  { id: "audio", label: "Audio", count: 21 },
  { id: "spreadsheet", label: "Spreadsheets", count: 8 },
  { id: "presentation", label: "Slides", count: 11 },
  { id: "ebook", label: "E-books", count: 22 },
  { id: "archive", label: "Archives", count: 39 },
  { id: "vector", label: "Vector", count: 10 },
  { id: "cad", label: "CAD", count: 3 },
  { id: "font", label: "Fonts", count: 5 },
];

export const ALL_FORMATS: FormatDef[] = [
  // Documents
  { id: "pdf", label: "PDF", category: "document" },
  { id: "docx", label: "DOCX", category: "document" },
  { id: "doc", label: "DOC", category: "document" },
  { id: "odt", label: "ODT", category: "document" },
  { id: "rtf", label: "RTF", category: "document" },
  { id: "txt", label: "TXT", category: "document" },
  { id: "md", label: "MD", category: "document" },
  { id: "html", label: "HTML", category: "document" },
  { id: "htm", label: "HTM", category: "document" },
  { id: "docm", label: "DOCM", category: "document" },
  { id: "dotx", label: "DOTX", category: "document" },
  { id: "rst", label: "RST", category: "document" },
  { id: "tex", label: "TEX", category: "document" },
  // Images
  { id: "png", label: "PNG", category: "image" },
  { id: "jpg", label: "JPG", category: "image" },
  { id: "jpeg", label: "JPEG", category: "image" },
  { id: "webp", label: "WEBP", category: "image" },
  { id: "gif", label: "GIF", category: "image" },
  { id: "bmp", label: "BMP", category: "image" },
  { id: "tiff", label: "TIFF", category: "image" },
  { id: "tif", label: "TIF", category: "image" },
  { id: "ico", label: "ICO", category: "image" },
  { id: "heic", label: "HEIC", category: "image" },
  { id: "avif", label: "AVIF", category: "image" },
  { id: "svg", label: "SVG", category: "image" },
  // Video
  { id: "mp4", label: "MP4", category: "video" },
  { id: "webm", label: "WEBM", category: "video" },
  { id: "avi", label: "AVI", category: "video" },
  { id: "mov", label: "MOV", category: "video" },
  { id: "mkv", label: "MKV", category: "video" },
  { id: "wmv", label: "WMV", category: "video" },
  { id: "flv", label: "FLV", category: "video" },
  { id: "m4v", label: "M4V", category: "video" },
  { id: "mpg", label: "MPG", category: "video" },
  { id: "mpeg", label: "MPEG", category: "video" },
  { id: "3gp", label: "3GP", category: "video" },
  { id: "3g2", label: "3G2", category: "video" },
  { id: "ogv", label: "OGV", category: "video" },
  { id: "ts", label: "TS", category: "video" },
  { id: "mts", label: "MTS", category: "video" },
  { id: "m2ts", label: "M2TS", category: "video" },
  { id: "vob", label: "VOB", category: "video" },
  { id: "asf", label: "ASF", category: "video" },
  { id: "rm", label: "RM", category: "video" },
  { id: "f4v", label: "F4V", category: "video" },
  { id: "dv", label: "DV", category: "video" },
  { id: "mxf", label: "MXF", category: "video" },
  { id: "ogm", label: "OGM", category: "video" },
  { id: "m2v", label: "M2V", category: "video" },
  { id: "nut", label: "NUT", category: "video" },
  { id: "swf", label: "SWF", category: "video" },
  { id: "hevc", label: "HEVC", category: "video" },
  { id: "mod", label: "MOD", category: "video" },
  // Audio
  { id: "mp3", label: "MP3", category: "audio" },
  { id: "wav", label: "WAV", category: "audio" },
  { id: "flac", label: "FLAC", category: "audio" },
  { id: "aac", label: "AAC", category: "audio" },
  { id: "ogg", label: "OGG", category: "audio" },
  { id: "m4a", label: "M4A", category: "audio" },
  { id: "wma", label: "WMA", category: "audio" },
  { id: "opus", label: "OPUS", category: "audio" },
  { id: "aiff", label: "AIFF", category: "audio" },
  { id: "aif", label: "AIF", category: "audio" },
  { id: "amr", label: "AMR", category: "audio" },
  { id: "ac3", label: "AC3", category: "audio" },
  { id: "au", label: "AU", category: "audio" },
  { id: "caf", label: "CAF", category: "audio" },
  { id: "mka", label: "MKA", category: "audio" },
  { id: "wv", label: "WV", category: "audio" },
  { id: "ape", label: "APE", category: "audio" },
  { id: "dts", label: "DTS", category: "audio" },
  { id: "mid", label: "MID", category: "audio" },
  { id: "midi", label: "MIDI", category: "audio" },
  { id: "voc", label: "VOC", category: "audio" },
  // Spreadsheets
  { id: "xlsx", label: "XLSX", category: "spreadsheet" },
  { id: "xls", label: "XLS", category: "spreadsheet" },
  { id: "ods", label: "ODS", category: "spreadsheet" },
  { id: "csv", label: "CSV", category: "spreadsheet" },
  // Presentations
  { id: "pptx", label: "PPTX", category: "presentation" },
  { id: "ppt", label: "PPT", category: "presentation" },
  { id: "odp", label: "ODP", category: "presentation" },
  // E-books
  { id: "epub", label: "EPUB", category: "ebook" },
  { id: "mobi", label: "MOBI", category: "ebook" },
  { id: "azw3", label: "AZW3", category: "ebook" },
  // Archives
  { id: "zip", label: "ZIP", category: "archive" },
  { id: "tar", label: "TAR", category: "archive" },
  { id: "gz", label: "GZ", category: "archive" },
  { id: "7z", label: "7Z", category: "archive" },
  { id: "rar", label: "RAR", category: "archive" },
  // Vector / CAD / Font (LibreOffice/ffmpeg limited)
  { id: "dxf", label: "DXF", category: "cad" },
  { id: "ttf", label: "TTF", category: "font" },
  { id: "woff", label: "WOFF", category: "font" },
  { id: "woff2", label: "WOFF2", category: "font" },
];

export const ANY_FORMAT: FormatDef = { id: "any", label: "ANY", category: "document" };

export function getFormatsByCategory(cat: FormatCategory): FormatDef[] {
  return ALL_FORMATS.filter((f) => f.category === cat);
}

export function getFormat(id: string): FormatDef | undefined {
  if (id === "any") return ANY_FORMAT;
  return ALL_FORMATS.find((f) => f.id === id);
}

export interface ToolDef {
  id: string;
  label: string;
  group: "convert" | "optimize" | "merge" | "capture" | "archives" | "ocr" | "translate";
  category?: FormatCategory;
  operation: Operation;
  defaultFrom?: string;
  defaultTo?: string;
  description?: string;
}

export const TOOLS: ToolDef[] = [
  { id: "home", label: "PDF Garage", group: "convert", operation: "convert", defaultFrom: "pdf", defaultTo: "any" },
  { id: "document", label: "Document Converter", group: "convert", category: "document", operation: "convert", defaultFrom: "pdf", defaultTo: "docx" },
  { id: "image", label: "Image Converter", group: "convert", category: "image", operation: "convert", defaultFrom: "png", defaultTo: "jpg" },
  { id: "video", label: "Video Converter", group: "convert", category: "video", operation: "convert", defaultFrom: "mp4", defaultTo: "webm" },
  { id: "audio", label: "Audio Converter", group: "convert", category: "audio", operation: "convert", defaultFrom: "mp3", defaultTo: "wav" },
  { id: "spreadsheet", label: "Spreadsheet Converter", group: "convert", category: "spreadsheet", operation: "convert", defaultFrom: "xlsx", defaultTo: "csv" },
  { id: "presentation", label: "Presentation Converter", group: "convert", category: "presentation", operation: "convert", defaultFrom: "pptx", defaultTo: "pdf" },
  { id: "ebook", label: "Ebook Converter", group: "convert", category: "ebook", operation: "convert", defaultFrom: "epub", defaultTo: "pdf" },
  { id: "archive", label: "Archive Converter", group: "convert", category: "archive", operation: "convert", defaultFrom: "zip", defaultTo: "tar" },
  { id: "vector", label: "Vector Converter", group: "convert", category: "vector", operation: "convert", defaultFrom: "svg", defaultTo: "png" },
  { id: "compress-pdf", label: "Compress PDF", group: "optimize", operation: "compress", defaultFrom: "pdf", defaultTo: "pdf" },
  { id: "compress-png", label: "Compress PNG", group: "optimize", operation: "compress", defaultFrom: "png", defaultTo: "png" },
  { id: "compress-jpg", label: "Compress JPG", group: "optimize", operation: "compress", defaultFrom: "jpg", defaultTo: "jpg" },
  { id: "merge-pdf", label: "Merge PDF", group: "merge", operation: "merge", defaultFrom: "pdf", defaultTo: "pdf" },
  { id: "create-archive", label: "Create Archive", group: "archives", operation: "create-archive", defaultTo: "zip" },
  { id: "extract-archive", label: "Extract Archive", group: "archives", operation: "extract", defaultFrom: "zip" },
  { id: "pdf-ocr", label: "PDF OCR", group: "ocr", operation: "ocr", defaultFrom: "pdf", defaultTo: "txt", description: "Extract text from scanned PDFs using OCR." },
  { id: "image-ocr", label: "Image OCR", group: "ocr", operation: "ocr", defaultFrom: "png", defaultTo: "txt", description: "Recognize text in images (PNG, JPG, etc.)." },
  { id: "translate-doc", label: "Translate Document", group: "translate", operation: "translate", defaultFrom: "pdf", defaultTo: "txt", description: "Translate PDF, DOCX, or TXT to another language." },
];

export const POPULAR_CONVERSIONS = [
  { from: "pdf", to: "docx", tag: "editable Word document" },
  { from: "docx", to: "pdf", tag: "print-ready PDF" },
  { from: "html", to: "txt", tag: "plain text export" },
  { from: "png", to: "jpg", tag: "smaller image" },
  { from: "mp4", to: "mp3", tag: "extract audio" },
  { from: "mp4", to: "webm", tag: "web-friendly video" },
  { from: "wav", to: "mp3", tag: "compressed audio" },
  { from: "flac", to: "mp3", tag: "lossless to MP3" },
  { from: "heic", to: "jpg", tag: "iPhone photos" },
];

export const CATEGORY_COMMON_CONVERSIONS: Record<
  FormatCategory,
  { from: string; to: string; tag: string }[]
> = {
  document: [
    { from: "pdf", to: "docx", tag: "editable Word document" },
    { from: "docx", to: "pdf", tag: "print-ready PDF" },
    { from: "html", to: "txt", tag: "plain text export" },
  ],
  image: [
    { from: "png", to: "jpg", tag: "smaller file size" },
    { from: "heic", to: "jpg", tag: "iPhone photos" },
    { from: "webp", to: "png", tag: "lossless image" },
  ],
  video: [
    { from: "mp4", to: "mp3", tag: "extract audio track" },
    { from: "mp4", to: "webm", tag: "web-friendly video" },
    { from: "mov", to: "mp4", tag: "universal playback" },
  ],
  audio: [
    { from: "wav", to: "mp3", tag: "compressed audio" },
    { from: "flac", to: "m4a", tag: "portable lossless library" },
    { from: "ogg", to: "aac", tag: "mobile playback" },
  ],
  spreadsheet: [
    { from: "xlsx", to: "csv", tag: "spreadsheet export" },
    { from: "csv", to: "xlsx", tag: "Excel workbook" },
    { from: "ods", to: "xlsx", tag: "LibreOffice to Excel" },
  ],
  presentation: [
    { from: "pptx", to: "pdf", tag: "shareable slides" },
    { from: "ppt", to: "pptx", tag: "modern PowerPoint" },
    { from: "odp", to: "pdf", tag: "OpenDocument to PDF" },
  ],
  ebook: [
    { from: "epub", to: "pdf", tag: "readable on any device" },
    { from: "mobi", to: "epub", tag: "Kindle to EPUB" },
    { from: "azw3", to: "epub", tag: "Amazon to EPUB" },
  ],
  archive: [
    { from: "zip", to: "tar", tag: "Unix archive" },
    { from: "rar", to: "zip", tag: "universal archive" },
    { from: "7z", to: "zip", tag: "wide compatibility" },
  ],
  vector: [
    { from: "svg", to: "png", tag: "raster preview" },
    { from: "svg", to: "pdf", tag: "print-ready vector" },
    { from: "svg", to: "jpg", tag: "web image" },
  ],
  cad: [{ from: "dxf", to: "pdf", tag: "drawing preview" }],
  font: [
    { from: "ttf", to: "woff2", tag: "web font" },
    { from: "woff", to: "woff2", tag: "modern web font" },
    { from: "ttf", to: "woff", tag: "legacy web font" },
  ],
};

export function getCategoryFormatCount(cat: FormatCategory): number {
  return ALL_FORMATS.filter((f) => f.category === cat).length;
}

export function getTotalFormatCount(): number {
  return ALL_FORMATS.length;
}

export function inferFormatFromFile(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const aliases: Record<string, string> = {
    jpeg: "jpg",
    mpeg: "mpg",
    h264: "hevc",
    h265: "hevc",
    rmvb: "rm",
  };
  const id = aliases[ext] || ext;
  return getFormat(id) ? id : ext;
}

const PDF_TO_IMAGE_FORMATS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "tif",
  "ico",
  "heic",
  "avif",
]);

export function supportsMultiFileConvert(fromFormat: string, toFormat: string | null | undefined): boolean {
  if (!toFormat || toFormat === "any") return false;
  if (fromFormat.toLowerCase() !== "pdf") return false;
  const to = toFormat.toLowerCase().replace("jpeg", "jpg");
  return PDF_TO_IMAGE_FORMATS.has(to);
}

export function getAcceptTypes(fromFormat: string, toFormat: string, operation: Operation): string {
  if (operation === "ocr") return ".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.tif,application/pdf,image/*";
  if (operation === "translate") return ".pdf,.docx,.doc,.txt,.md,application/pdf";
  if (operation === "merge") return ".pdf,application/pdf";
  if (operation === "create-archive") return "*/*";
  if (operation === "extract") return ".zip,.tar,.gz,.7z,.rar,application/zip,application/x-rar-compressed";
  if (fromFormat === "any" || toFormat === "any") return "*/*";
  const fmt = getFormat(fromFormat);
  if (fmt?.category === "image") return "image/*";
  if (fmt?.category === "video") return "video/*";
  if (fmt?.category === "audio") return "audio/*";
  if (fmt?.category === "archive") return ".zip,.tar,.gz,.7z,.rar";
  return `.${fromFormat},*/*`;
}
