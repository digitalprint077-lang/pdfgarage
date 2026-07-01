import type { Operation } from "./catalog";
import { creditsForJob } from "./pricing";

export interface CalculatorOperationDef {
  id: Operation;
  label: string;
  needsInput: boolean;
  needsOutput: boolean;
  defaultInput?: string;
  defaultOutput?: string;
}

export const CALCULATOR_OPERATIONS: CalculatorOperationDef[] = [
  {
    id: "convert",
    label: "Convert",
    needsInput: true,
    needsOutput: true,
    defaultInput: "pdf",
    defaultOutput: "docx",
  },
  {
    id: "compress",
    label: "Compress / Optimize",
    needsInput: true,
    needsOutput: false,
    defaultInput: "pdf",
  },
  { id: "merge", label: "Merge", needsInput: true, needsOutput: false, defaultInput: "pdf" },
  { id: "extract", label: "Extract pages", needsInput: true, needsOutput: false, defaultInput: "pdf" },
  { id: "ocr", label: "OCR", needsInput: true, needsOutput: false, defaultInput: "pdf" },
  { id: "translate", label: "Translate", needsInput: true, needsOutput: false, defaultInput: "pdf" },
  {
    id: "create-archive",
    label: "Create archive",
    needsInput: true,
    needsOutput: false,
    defaultInput: "pdf",
  },
];

const OFFICE_TO_PDF = new Set([
  "abw",
  "djvu",
  "doc",
  "docm",
  "docx",
  "dot",
  "dotx",
  "html",
  "hwp",
  "hwpx",
  "lwp",
  "md",
  "odt",
  "pages",
  "rst",
  "rtf",
  "sdw",
  "tex",
  "txt",
  "wpd",
  "wps",
  "zabw",
  "dps",
  "key",
  "odp",
  "pot",
  "potx",
  "pps",
  "ppsx",
  "ppt",
  "pptm",
  "pptx",
  "sda",
  "azw",
  "azw3",
  "azw4",
  "cbc",
  "cbr",
  "cbz",
  "chm",
  "epub",
  "fb2",
  "htmlz",
  "lit",
  "lrf",
  "mobi",
  "oeb",
  "pdb",
  "pml",
  "prc",
  "rb",
  "snb",
  "tcr",
  "txtz",
  "ai",
  "cdr",
  "cgm",
  "emf",
  "sk",
  "sk1",
  "svg",
  "svgz",
  "vsd",
  "wmf",
  "dwf",
  "dwg",
  "dxf",
  "xls",
  "xlsx",
  "ods",
  "odt",
  "rtf",
]);

const PDF_TO_OFFICE = new Set([
  "docx",
  "doc",
  "pptx",
  "ppt",
  "xlsx",
  "xls",
  "odt",
  "ods",
  "odp",
  "rtf",
  "txt",
]);

export function baseCreditsForConvert(inputFormat: string, outputFormat: string): number {
  const input = inputFormat.toLowerCase();
  const output = outputFormat.toLowerCase();
  if (input === "pdf" && PDF_TO_OFFICE.has(output)) return 4;
  if (output === "pdf" && OFFICE_TO_PDF.has(input)) return 2;
  return 1;
}

export function estimateJobCredits(params: {
  operation: Operation;
  inputFormat?: string;
  outputFormat?: string;
  minutes?: number;
}): { total: number; base: number; extraMinutes: number } {
  const minutes = Math.max(0.1, params.minutes ?? 1);
  let base = 1;

  switch (params.operation) {
    case "ocr":
    case "translate":
      base = 2;
      break;
    case "convert":
      if (params.inputFormat && params.outputFormat) {
        base = baseCreditsForConvert(params.inputFormat, params.outputFormat);
      }
      break;
    default:
      base = 1;
  }

  const total = creditsForJob(base, minutes);
  return { total, base, extraMinutes: Math.max(0, Math.ceil(minutes) - 1) };
}

export const FORMAT_CATEGORY_LABELS: Record<string, string> = {
  document: "Document",
  image: "Image",
  presentation: "Presentation",
  spreadsheet: "Spreadsheet",
  ebook: "Ebook",
  vector: "Vector",
  cad: "Cad",
  archive: "Archive",
  font: "Font",
};

export const FORMAT_CATEGORY_ORDER = [
  "archive",
  "cad",
  "document",
  "ebook",
  "font",
  "image",
  "presentation",
  "spreadsheet",
  "vector",
];
