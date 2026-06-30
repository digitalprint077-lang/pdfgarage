import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { franc } from "franc-min";
import {
  TRANSLATE_LANGUAGES,
  OCR_LANGUAGES,
  SUPPORTED_TRANSLATE_CODES,
  FRANC_TO_APP,
} from "./translateLanguages.js";
import { translateWithProviders, getMaxChunkChars } from "./translateProviders.js";

export { TRANSLATE_LANGUAGES, OCR_LANGUAGES };

const MIN_DETECT_CHARS = 20;
const REQUEST_INTERVAL_MS = Number(process.env.TRANSLATE_REQUEST_INTERVAL_MS) || 350;
const CACHE_MAX = 400;

const chunkCache = new Map();

let requestQueue = Promise.resolve();
let lastRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serialize translation API calls to avoid provider rate limits. */
function scheduleTranslationRequest(fn) {
  const run = requestQueue.then(async () => {
    const wait = Math.max(0, lastRequestAt + REQUEST_INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    try {
      return await fn();
    } finally {
      lastRequestAt = Date.now();
    }
  });
  requestQueue = run.catch(() => {});
  return run;
}

/**
 * Split text into chunks that stay under the active provider's limit.
 */
export function splitIntoChunks(text, maxLen = getMaxChunkChars()) {
  const chunks = [];
  let remaining = String(text || "");

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    const window = remaining.slice(0, maxLen + 1);
    let cut = -1;

    for (const sep of [". ", "! ", "? ", "; ", ", ", " "]) {
      const idx = window.lastIndexOf(sep);
      if (idx > maxLen * 0.2) {
        cut = idx + sep.length;
        break;
      }
    }

    if (cut <= 0) cut = maxLen;

    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Plan translation in fewer, larger API segments while keeping paragraph breaks.
 * Merges lines within a paragraph up to MAX_QUERY_CHARS per request.
 */
export function buildTranslationPlan(text) {
  const maxLen = getMaxChunkChars();
  const plan = [];
  const parts = String(text || "").split(/(\n\n+)/);

  for (const part of parts) {
    if (!part) continue;
    if (/^\n+$/.test(part)) {
      plan.push({ type: "break", value: part });
      continue;
    }

    let remaining = part;
    while (remaining.length > 0) {
      if (remaining.length <= maxLen) {
        plan.push({ type: "translate", text: remaining });
        break;
      }

      const window = remaining.slice(0, maxLen + 1);
      let cut = window.lastIndexOf("\n");
      if (cut <= maxLen * 0.15) {
        cut = -1;
        for (const sep of [". ", "! ", "? ", "; ", ", ", " "]) {
          const idx = window.lastIndexOf(sep);
          if (idx > maxLen * 0.15) {
            cut = idx + sep.length;
            break;
          }
        }
      } else {
        cut += 1;
      }
      if (cut <= 0) cut = maxLen;

      plan.push({ type: "translate", text: remaining.slice(0, cut) });
      remaining = remaining.slice(cut);
    }
  }

  return plan;
}

export function countTranslationSegments(text) {
  return buildTranslationPlan(text).filter((p) => p.type === "translate").length;
}

/** Split document into text runs and structural line/paragraph breaks (preserved verbatim). */
export function tokenizeStructure(text) {
  const tokens = [];
  const re = /(\n\n+|\n)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ kind: "text", value: text.slice(last, m.index) });
    tokens.push({ kind: "break", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: "text", value: text.slice(last) });
  return tokens;
}

function leadingWhitespace(s) {
  const m = s.match(/^\s*/);
  return m ? m[0] : "";
}

function trailingWhitespace(s) {
  const m = s.match(/\s*$/);
  return m ? m[0] : "";
}

function normalizeLang(code) {
  return String(code || "").trim().toLowerCase();
}

export function detectLanguage(text) {
  const sample = String(text || "").trim();
  if (sample.length < MIN_DETECT_CHARS) return "en";

  const iso3 = franc(sample, { minLength: MIN_DETECT_CHARS });
  if (!iso3 || iso3 === "und") return "en";

  return FRANC_TO_APP[iso3] || "en";
}

export function resolveSourceLang(fromLang, text) {
  const from = normalizeLang(fromLang);
  if (from === "auto") return detectLanguage(text);
  if (!SUPPORTED_TRANSLATE_CODES.has(from)) {
    throw new Error(`Unsupported source language: ${fromLang}`);
  }
  return from;
}

export function resolveTargetLang(toLang) {
  const to = normalizeLang(toLang);
  if (!SUPPORTED_TRANSLATE_CODES.has(to)) {
    throw new Error(`Unsupported target language: ${toLang}`);
  }
  return to;
}

export async function extractText(buffer, format) {
  const fmt = format.toLowerCase();
  if (fmt === "pdf") {
    const data = await pdfParse(buffer);
    return data.text || "";
  }
  if (fmt === "docx" || fmt === "doc") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  if (["txt", "md", "rtf", "csv", "html", "htm"].includes(fmt)) {
    return buffer.toString("utf-8");
  }
  throw new Error(`Translation supports PDF, DOCX, TXT, and MD — not ${fmt.toUpperCase()}`);
}

async function callTranslationApi(core, fromLang, toLang) {
  const cacheKey = `${fromLang}|${toLang}|${core}`;
  const cached = chunkCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const translated = await scheduleTranslationRequest(() =>
    translateWithProviders(core, fromLang, toLang)
  );

  if (chunkCache.size >= CACHE_MAX) {
    const first = chunkCache.keys().next().value;
    chunkCache.delete(first);
  }
  chunkCache.set(cacheKey, translated);
  return translated;
}

async function translateChunk(text, fromLang, toLang) {
  if (!text) return "";
  if (!text.trim()) return text;

  const lead = leadingWhitespace(text);
  const trail = trailingWhitespace(text);
  const core = text.trim();
  const maxLen = getMaxChunkChars();

  if (core.length > maxLen) {
    throw new Error(`Internal chunking error: ${core.length} chars exceeds ${maxLen} limit`);
  }

  const translated = await callTranslationApi(core, fromLang, toLang);
  return lead + translated + trail;
}

async function translateTextBlock(text, source, target) {
  if (!text.trim()) return text;
  return translateChunk(text, source, target);
}

export async function translateText(text, fromLang, toLang, onProgress) {
  if (!text.trim()) throw new Error("No text found to translate");

  const source = resolveSourceLang(fromLang, text);
  const target = resolveTargetLang(toLang);
  if (source === target) return text;

  const plan = buildTranslationPlan(text);
  const total = plan.filter((p) => p.type === "translate").length;
  let done = 0;
  onProgress?.({ phase: "translating", done, total });

  const out = [];
  for (const item of plan) {
    if (item.type === "break") {
      out.push(item.value);
      continue;
    }
    out.push(await translateTextBlock(item.text, source, target));
    done++;
    onProgress?.({ phase: "translating", done, total });
  }

  return out.join("");
}

function translatedToDocxParagraphs(translated) {
  if (!translated.trim()) {
    return [new Paragraph({ children: [new TextRun(" ")] })];
  }

  const paragraphs = [];
  const parts = translated.split(/(\n\n+)/);

  for (const part of parts) {
    if (!part) continue;
    if (/^\n+$/.test(part)) {
      const gaps = Math.max(1, Math.floor(part.length / 2));
      for (let i = 0; i < gaps; i++) {
        paragraphs.push(new Paragraph({ children: [new TextRun(" ")] }));
      }
      continue;
    }

    const lines = part.split("\n");
    if (lines.length === 1) {
      paragraphs.push(new Paragraph({ children: [new TextRun(lines[0] || " ")] }));
      continue;
    }

    const children = [];
    lines.forEach((line, i) => {
      if (i > 0) children.push(new TextRun({ break: 1 }));
      children.push(new TextRun(line || " "));
    });
    paragraphs.push(new Paragraph({ children }));
  }

  return paragraphs.length ? paragraphs : [new Paragraph({ children: [new TextRun(" ")] })];
}

export async function translateFile({
  buffer,
  originalName,
  fromFormat,
  fromLang,
  toLang,
  toFormat = "txt",
  onProgress,
}) {
  onProgress?.({ phase: "extracting", done: 0, total: 0 });
  const text = await extractText(buffer, fromFormat);
  const total = countTranslationSegments(text);
  onProgress?.({ phase: "translating", done: 0, total });
  const translated = await translateText(text, fromLang || "auto", toLang || "en", onProgress);
  const baseName = originalName.replace(/\.[^.]+$/, "");

  if (toFormat === "docx") {
    const doc = new Document({
      sections: [{ children: translatedToDocxParagraphs(translated) }],
    });
    const docxBuffer = await Packer.toBuffer(doc);
    return {
      buffer: docxBuffer,
      filename: `${baseName}_${toLang}.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }

  return {
    buffer: Buffer.from(translated, "utf-8"),
    filename: `${baseName}_${toLang}.txt`,
    mimeType: "text/plain",
  };
}
