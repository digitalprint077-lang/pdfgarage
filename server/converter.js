import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { PDFDocument } from "pdf-lib";
import pdfParse from "pdf-parse";
import PDFDocumentKit from "pdfkit";
import sharp from "sharp";
import archiver from "archiver";
import { pdf } from "pdf-to-img";
import libre from "libreoffice-convert";
import mammoth from "mammoth";
import PptxGenJS from "pptxgenjs";
import ExcelJS from "exceljs";
import { promisify } from "util";
import { convertPdfToDocxEditable, convertDocxToDoc } from "./pdf2docx.js";
import { renderPdfToPngPages, PDF_RENDER_SCALE } from "./pdfRender.js";
import {
  convertWithFfmpeg,
  extractAudioFromVideo,
  isMediaFormat,
  isAudioOnly,
  isVideoFormat,
  getMediaMime,
  findFfmpeg,
  resolveOutputFilename,
} from "./mediaConvert.js";

const libreConvert = promisify(libre.convert);

const IMAGE_FORMATS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "tif", "ico", "heic", "avif"]);
const OFFICE_FORMATS = new Set([
  "doc", "docx", "docm", "dotx", "ppt", "pptx", "xls", "xlsx", "csv", "odt", "odp", "ods", "rtf",
  "html", "htm", "txt", "md", "epub", "mobi", "azw3", "pages", "wps", "abw",
]);
const PDF_TO_OFFICE = new Set(["docx", "doc", "pptx", "ppt", "xlsx", "xls", "odt", "odp", "ods", "rtf"]);

const MIME = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  txt: "text/plain",
  md: "text/markdown",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  rtf: "application/rtf",
  csv: "text/csv",
  epub: "application/epub+zip",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  webm: "video/webm",
  svg: "image/svg+xml",
  zip: "application/zip",
};

export async function convertFile({ buffer, originalName, fromFormat, toFormat, tmpDir, options = {} }) {
  const baseName = path.basename(originalName, path.extname(originalName));
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  if (from === "pdf") {
    return convertFromPdf(buffer, baseName, to, tmpDir);
  }

  if (to === "pdf") {
    return convertToPdf(buffer, baseName, from, tmpDir);
  }

  if (IMAGE_FORMATS.has(from) && IMAGE_FORMATS.has(to)) {
    return convertImageToImage(buffer, baseName, from, to, options);
  }

  if (from === "svg" && IMAGE_FORMATS.has(to)) {
    return convertSvgToRaster(buffer, baseName, to);
  }

  if (isVideoFormat(from) && isAudioOnly(to)) {
    return videoToAudio(buffer, baseName, from, to, tmpDir);
  }

  if (isMediaFormat(from) && isMediaFormat(to)) {
    return convertMedia(buffer, baseName, from, to, tmpDir);
  }

  if (IMAGE_FORMATS.has(from) && (to === "txt" || to === "md" || to === "docx")) {
    throw new Error(
      "Cannot extract text from images with the standard converter. Use Tools → Image OCR instead."
    );
  }

  if (OFFICE_FORMATS.has(from) && OFFICE_FORMATS.has(to)) {
    return libreOfficeConvert(buffer, baseName, `.${from}`, `.${to}`);
  }

  if (OFFICE_FORMATS.has(from) || OFFICE_FORMATS.has(to)) {
    return libreOfficeConvert(buffer, baseName, `.${from}`, `.${to}`);
  }

  throw new Error(`Conversion from ${from.toUpperCase()} to ${to.toUpperCase()} is not supported yet`);
}

async function convertImageToImage(buffer, baseName, from, to, options) {
  const fmt = to === "jpg" ? "jpeg" : to === "tif" ? "tiff" : to;
  let img = sharp(buffer);
  if (options.quality && (fmt === "jpeg" || fmt === "webp" || fmt === "png")) {
    if (fmt === "jpeg") img = img.jpeg({ quality: options.quality, mozjpeg: true });
    else if (fmt === "webp") img = img.webp({ quality: options.quality });
    else img = img.png({ quality: options.quality, compressionLevel: 9 });
  } else {
    img = img.toFormat(fmt);
  }
  const out = await img.toBuffer();
  const ext = to === "jpeg" ? "jpg" : to;
  return { buffer: out, filename: `${baseName}.${ext}`, mimeType: MIME[ext] || MIME.png };
}

async function convertSvgToRaster(buffer, baseName, to) {
  const fmt = to === "jpg" ? "jpeg" : to;
  const out = await sharp(buffer).toFormat(fmt).toBuffer();
  const ext = to === "jpeg" ? "jpg" : to;
  return { buffer: out, filename: `${baseName}.${ext}`, mimeType: MIME[ext] || MIME.png };
}

async function convertMedia(buffer, baseName, from, to, tmpDir) {
  const inPath = path.join(tmpDir, `input.${from}`);
  const outPath = path.join(tmpDir, `output.${to}`);
  await fs.writeFile(inPath, buffer);
  const out = await convertWithFfmpeg(inPath, outPath, { toFormat: to });
  const filename = resolveOutputFilename(`${baseName}.${to}`, to);
  return { buffer: out, filename, mimeType: getMediaMime(to) };
}

async function videoToAudio(buffer, baseName, from, to, tmpDir) {
  const inPath = path.join(tmpDir, `input.${from}`);
  const outPath = path.join(tmpDir, `output.${to}`);
  await fs.writeFile(inPath, buffer);
  const out = await extractAudioFromVideo(inPath, outPath, to);
  const filename = resolveOutputFilename(`${baseName}.${to}`, to);
  return { buffer: out, filename, mimeType: getMediaMime(to) };
}

export { findFfmpeg };

async function convertFromPdf(buffer, baseName, toFormat, tmpDir) {
  if (IMAGE_FORMATS.has(toFormat)) {
    return pdfToImages(buffer, baseName, toFormat, tmpDir);
  }

  if (toFormat === "txt" || toFormat === "md") {
    return pdfToText(buffer, baseName, toFormat);
  }

  if (toFormat === "docx") {
    return pdfToDocx(buffer, baseName, tmpDir);
  }

  if (toFormat === "doc") {
    return pdfToDoc(buffer, baseName, tmpDir);
  }

  if (toFormat === "pptx") {
    return pdfToPptx(buffer, baseName, tmpDir);
  }

  if (toFormat === "xlsx") {
    return pdfToXlsx(buffer, baseName);
  }

  if (toFormat === "rtf") {
    return pdfToRtf(buffer, baseName);
  }

  if (PDF_TO_OFFICE.has(toFormat)) {
    return libreOfficeConvert(buffer, baseName, ".pdf", `.${toFormat}`);
  }

  throw new Error(`PDF to ${toFormat.toUpperCase()} conversion is not available`);
}

async function convertToPdf(buffer, baseName, fromFormat, tmpDir) {
  if (IMAGE_FORMATS.has(fromFormat)) {
    return imagesToPdf([buffer], baseName);
  }

  if (fromFormat === "txt" || fromFormat === "md") {
    return textToPdf(buffer, baseName);
  }

  if (fromFormat === "docx" || fromFormat === "doc") {
    return docxToPdf(buffer, baseName, fromFormat);
  }

  if (fromFormat === "pptx" || fromFormat === "ppt") {
    return pptxToPdf(buffer, baseName);
  }

  if (fromFormat === "xlsx" || fromFormat === "xls") {
    return xlsxToPdf(buffer, baseName, fromFormat);
  }

  if (fromFormat === "html" || fromFormat === "htm") {
    return htmlToPdf(buffer, baseName);
  }

  if (OFFICE_FORMATS.has(fromFormat)) {
    return libreOfficeConvert(buffer, baseName, `.${fromFormat}`, ".pdf");
  }

  throw new Error(`${fromFormat.toUpperCase()} to PDF conversion is not available`);
}

async function pdfToText(buffer, baseName, toFormat) {
  const data = await pdfParse(buffer);
  const text = data.text || "";
  return {
    buffer: Buffer.from(text, "utf-8"),
    filename: `${baseName}.${toFormat}`,
    mimeType: MIME[toFormat],
  };
}

async function pdfToDoc(buffer, baseName, tmpDir) {
  const pdfPath = path.join(tmpDir, "input.pdf");
  const docxPath = path.join(tmpDir, "editable.docx");
  const docPath = path.join(tmpDir, "output.doc");

  await fs.writeFile(pdfPath, buffer);
  await convertPdfToDocxEditable(pdfPath, docxPath);

  try {
    await convertDocxToDoc(docxPath, docPath);
    const docBuffer = await fs.readFile(docPath);
    return {
      buffer: docBuffer,
      filename: `${baseName}.doc`,
      mimeType: MIME.doc,
    };
  } catch {
    try {
      const docxBuffer = await fs.readFile(docxPath);
      return await libreOfficeConvert(docxBuffer, baseName, ".docx", ".doc");
    } catch {
      throw new Error(
        "PDF to DOC needs LibreOffice or Microsoft Word to finalize the .doc file. " +
          "The editable content is ready — try PDF to DOCX instead, or install LibreOffice from https://www.libreoffice.org/download/"
      );
    }
  }
}

async function pdfToDocx(buffer, baseName, tmpDir) {
  const pdfPath = path.join(tmpDir, "input.pdf");
  const docxPath = path.join(tmpDir, "output.docx");
  const loDocxPath = path.join(tmpDir, "libre.docx");
  await fs.writeFile(pdfPath, buffer);

  let duplicateLayers = 0;

  try {
    const meta = await convertPdfToDocxEditable(pdfPath, docxPath);
    duplicateLayers = meta.duplicateLayersRemoved || 0;

    // Form-style PDFs with many duplicate text layers often look cleaner via LibreOffice
    if (duplicateLayers >= 8) {
      try {
        const loResult = await libreOfficeConvert(buffer, baseName, ".pdf", ".docx");
        await fs.writeFile(loDocxPath, loResult.buffer);
        const pdf2docxSize = (await fs.stat(docxPath)).size;
        const loSize = loResult.buffer.length;
        // Prefer LibreOffice when it produces a substantially different (usually cleaner) result
        if (loSize > pdf2docxSize * 0.5 && loSize < pdf2docxSize * 2.5) {
          return loResult;
        }
      } catch {
        /* keep pdf2docx result */
      }
    }

    const docxBuffer = await fs.readFile(docxPath);
    return {
      buffer: docxBuffer,
      filename: `${baseName}.docx`,
      mimeType: MIME.docx,
    };
  } catch (pdf2docxErr) {
    try {
      return await libreOfficeConvert(buffer, baseName, ".pdf", ".docx");
    } catch {
      const hint =
        pdf2docxErr instanceof Error ? pdf2docxErr.message : "Conversion failed";
      throw new Error(
        `Could not create an editable DOCX. ${hint} For scanned/image PDFs, OCR is required — try LibreOffice or re-save the PDF with selectable text.`
      );
    }
  }
}

async function pdfToPptx(buffer, baseName, tmpDir) {
  try {
    return await libreOfficeConvert(buffer, baseName, ".pdf", ".pptx");
  } catch {
    return pdfToPptxFromPages(buffer, baseName, tmpDir);
  }
}

async function pdfToPptxFromPages(buffer, baseName, tmpDir) {
  const pdfPath = path.join(tmpDir, "input.pdf");
  await fs.writeFile(pdfPath, buffer);

  const document = await pdf(pdfPath, { scale: PDF_RENDER_SCALE });
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  let count = 0;

  for await (const pageBuffer of document) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: `image/png;base64,${pageBuffer.toString("base64")}`,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
    });
    count++;
  }

  if (count === 0) {
    const data = await pdfParse(buffer);
    const slide = pptx.addSlide();
    slide.addText(data.text || "Empty PDF", { x: 0.5, y: 0.5, w: 9, h: 5, fontSize: 14 });
  }

  const out = await pptx.write({ outputType: "nodebuffer" });
  return {
    buffer: Buffer.from(out),
    filename: `${baseName}.pptx`,
    mimeType: MIME.pptx,
  };
}

async function pdfToXlsx(buffer, baseName) {
  try {
    return await libreOfficeConvert(buffer, baseName, ".pdf", ".xlsx");
  } catch {
    const data = await pdfParse(buffer);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Content");
    sheet.getColumn(1).width = 80;

    const lines = (data.text || "").split(/\r?\n/);
    if (lines.length === 0 || (lines.length === 1 && !lines[0].trim())) {
      sheet.getCell(1, 1).value = "(No extractable text in PDF)";
    } else {
      lines.forEach((line, i) => {
        sheet.getCell(i + 1, 1).value = line;
      });
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(xlsxBuffer),
      filename: `${baseName}.xlsx`,
      mimeType: MIME.xlsx,
    };
  }
}

async function pptxToPdf(buffer, baseName) {
  try {
    return await libreOfficeConvert(buffer, baseName, ".pptx", ".pdf");
  } catch {
    const text = await extractTextFromOfficeZip(buffer, "ppt/slides/slide");
    return textToPdf(Buffer.from(text || "Empty presentation", "utf-8"), baseName);
  }
}

async function xlsxToPdf(buffer, baseName, fromFormat) {
  try {
    return await libreOfficeConvert(buffer, baseName, `.${fromFormat}`, ".pdf");
  } catch {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const lines = [];
    workbook.eachSheet((sheet) => {
      lines.push(`--- ${sheet.name} ---`);
      sheet.eachRow((row) => {
        const vals = row.values
          .slice(1)
          .map((v) => (v == null ? "" : String(v)))
          .filter(Boolean);
        if (vals.length) lines.push(vals.join("\t"));
      });
    });
    return textToPdf(Buffer.from(lines.join("\n") || "Empty spreadsheet", "utf-8"), baseName);
  }
}

async function extractTextFromOfficeZip(buffer, pathPrefix) {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(buffer);
  const texts = [];
  const entries = Object.keys(zip.files)
    .filter((n) => n.startsWith(pathPrefix) && n.endsWith(".xml"))
    .sort();
  for (const name of entries) {
    const xml = await zip.files[name].async("string");
    const plain = xml.replace(/<a:t[^>]*>([^<]*)<\/a:t>/g, "$1 ").replace(/<[^>]+>/g, " ");
    texts.push(plain.replace(/\s+/g, " ").trim());
  }
  return texts.filter(Boolean).join("\n\n");
}

async function pdfToRtf(buffer, baseName) {
  const data = await pdfParse(buffer);
  const text = (data.text || "").replace(/\\/g, "\\\\").replace(/[{}]/g, "\\$&");
  const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 ${text.replace(/\n/g, "\\par ")}}`;
  return {
    buffer: Buffer.from(rtf, "utf-8"),
    filename: `${baseName}.rtf`,
    mimeType: MIME.rtf,
  };
}

async function docxToPdf(buffer, baseName, fromFormat) {
  try {
    return await libreOfficeConvert(buffer, baseName, `.${fromFormat}`, ".pdf");
  } catch {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || "Empty document";
    return textToPdf(Buffer.from(text, "utf-8"), baseName);
  }
}

async function htmlToPdf(buffer, baseName) {
  const html = buffer.toString("utf-8");
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return textToPdf(Buffer.from(text || "Empty HTML", "utf-8"), baseName);
}

export function isPdfToImageConversion(fromFormat, toFormat) {
  if (!fromFormat || !toFormat) return false;
  if (fromFormat.toLowerCase() !== "pdf") return false;
  return IMAGE_FORMATS.has(toFormat.toLowerCase());
}

async function getPdfImagePageBuffers(buffer, format, tmpDir, workId = "default") {
  const normalized = format === "jpg" ? "jpeg" : format === "tif" ? "tiff" : format;
  const workDir = path.join(tmpDir, workId);
  await fs.mkdir(workDir, { recursive: true });
  const pdfPath = path.join(workDir, "input.pdf");
  await fs.writeFile(pdfPath, buffer);

  const pngPages = await renderPdfToPngPages(pdfPath, PDF_RENDER_SCALE);
  const pages = [];

  for (const page of pngPages) {
    let imgBuffer = page;
    if (normalized === "jpeg") {
      imgBuffer = await sharp(page).jpeg({ quality: 95, mozjpeg: true }).toBuffer();
    } else if (normalized === "webp") {
      imgBuffer = await sharp(page).webp({ quality: 92 }).toBuffer();
    } else if (normalized !== "png") {
      imgBuffer = await sharp(page)[normalized]().toBuffer();
    }
    pages.push(imgBuffer);
  }

  if (pages.length === 0) {
    throw new Error("PDF has no pages to convert");
  }

  return pages;
}

function imageExtension(format) {
  const f = format.toLowerCase();
  if (f === "jpeg" || f === "jpg") return "jpg";
  if (f === "tif") return "tiff";
  return f;
}

function dedupeEntryNames(entries) {
  const used = new Set();
  return entries.map((entry) => {
    let name = entry.name;
    if (!used.has(name)) {
      used.add(name);
      return entry;
    }
    const dot = name.lastIndexOf(".");
    const stem = dot >= 0 ? name.slice(0, dot) : name;
    const ext = dot >= 0 ? name.slice(dot) : "";
    let n = 2;
    while (used.has(`${stem} (${n})${ext}`)) n++;
    name = `${stem} (${n})${ext}`;
    used.add(name);
    return { ...entry, name };
  });
}

async function createZipFromNamedEntries(zipPath, entries) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    for (const { name, buffer } of entries) {
      archive.append(buffer, { name });
    }
    archive.finalize();
  });
}

export async function batchPdfToImages(files, toFormat, tmpDir, zipBaseName = "converted") {
  const format = toFormat.toLowerCase();
  const ext = imageExtension(format);
  let entries = [];

  for (let i = 0; i < files.length; i++) {
    const { buffer, originalName } = files[i];
    const baseName = path.basename(originalName, path.extname(originalName));
    const pages = await getPdfImagePageBuffers(buffer, format, tmpDir, `batch-${i}`);

    if (pages.length === 1) {
      entries.push({ name: `${baseName}.${ext}`, buffer: pages[0] });
    } else {
      pages.forEach((pageBuf, pageIndex) => {
        entries.push({ name: `${baseName}-page-${pageIndex + 1}.${ext}`, buffer: pageBuf });
      });
    }
  }

  entries = dedupeEntryNames(entries);

  if (entries.length === 1) {
    return {
      buffer: entries[0].buffer,
      filename: entries[0].name,
      mimeType: MIME[format] || MIME.png,
    };
  }

  const zipPath = path.join(tmpDir, "batch-output.zip");
  await createZipFromNamedEntries(zipPath, entries);
  const zipBuffer = await fs.readFile(zipPath);
  return {
    buffer: zipBuffer,
    filename: `${zipBaseName}.zip`,
    mimeType: MIME.zip,
  };
}

async function pdfToImages(buffer, baseName, format, tmpDir) {
  const pages = await getPdfImagePageBuffers(buffer, format, tmpDir);
  const ext = imageExtension(format);

  if (pages.length === 1) {
    return {
      buffer: pages[0],
      filename: `${baseName}.${ext}`,
      mimeType: MIME[format] || MIME.png,
    };
  }

  const zipPath = path.join(tmpDir, "output.zip");
  await createZip(zipPath, pages, baseName, format);

  const zipBuffer = await fs.readFile(zipPath);
  return {
    buffer: zipBuffer,
    filename: `${baseName}.zip`,
    mimeType: MIME.zip,
  };
}

async function createZip(zipPath, pages, baseName, format) {
  const ext = format === "jpeg" ? "jpg" : format;

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    pages.forEach((page, i) => {
      archive.append(page, { name: `${baseName}-page-${i + 1}.${ext}` });
    });
    archive.finalize();
  });
}

async function imagesToPdf(buffers, baseName) {
  const doc = await PDFDocument.create();

  for (const buf of buffers) {
    const metadata = await sharp(buf).metadata();
    const { width = 800, height = 600 } = metadata;

    let embedBuffer = buf;
    let image;

    if (metadata.format === "jpeg" || metadata.format === "jpg") {
      image = await doc.embedJpg(embedBuffer);
    } else if (metadata.format === "png") {
      image = await doc.embedPng(embedBuffer);
    } else {
      embedBuffer = await sharp(buf).png().toBuffer();
      image = await doc.embedPng(embedBuffer);
    }

    const page = doc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await doc.save();
  return {
    buffer: Buffer.from(pdfBytes),
    filename: `${baseName}.pdf`,
    mimeType: MIME.pdf,
  };
}

async function textToPdf(buffer, baseName) {
  const text = buffer.toString("utf-8");

  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocumentKit({ margin: 50 });
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      resolve({
        buffer: Buffer.concat(chunks),
        filename: `${baseName}.pdf`,
        mimeType: MIME.pdf,
      });
    });
    doc.on("error", reject);

    doc.fontSize(12).text(text, { align: "left" });
    doc.end();
  });
}

async function libreOfficeConvert(buffer, baseName, fromExt, toExt) {
  try {
    const converted = await libreConvert(buffer, toExt, undefined);
    const outExt = toExt.replace(".", "");
    return {
      buffer: converted,
      filename: `${baseName}.${outExt}`,
      mimeType: MIME[outExt] || "application/octet-stream",
    };
  } catch {
    const outExt = toExt.replace(".", "").toUpperCase();
    const inExt = fromExt.replace(".", "").toUpperCase();
    throw new Error(
      `${inExt} to ${outExt} could not be converted. Try DOCX, PPTX, XLSX, PNG, or TXT.`
    );
  }
}
