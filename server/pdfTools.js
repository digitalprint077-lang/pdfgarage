import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export async function mergePdfs(buffers, baseName) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  return {
    buffer: Buffer.from(bytes),
    filename: `${baseName}.pdf`,
    mimeType: "application/pdf",
  };
}

export async function compressPdf(buffer, baseName, quality = 0.7) {
  const doc = await PDFDocument.load(buffer);
  const pages = doc.getPageCount();
  const newDoc = await PDFDocument.create();

  for (let i = 0; i < pages; i++) {
    const [copied] = await newDoc.copyPages(doc, [i]);
    newDoc.addPage(copied);
  }

  const saved = await newDoc.save({ useObjectStreams: true });
  let result = Buffer.from(saved);

  if (result.length >= buffer.length * 0.95) {
    result = Buffer.from(
      await newDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })
    );
  }

  return {
    buffer: result,
    filename: `${baseName}-compressed.pdf`,
    mimeType: "application/pdf",
  };
}

export async function compressImage(buffer, format, baseName, quality = 80) {
  const fmt = format === "jpg" || format === "jpeg" ? "jpeg" : format;
  let pipeline = sharp(buffer);
  if (fmt === "jpeg") pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  else if (fmt === "png") pipeline = pipeline.png({ compressionLevel: 9, quality });
  else if (fmt === "webp") pipeline = pipeline.webp({ quality });
  else pipeline = pipeline.toFormat(fmt, { quality });

  const out = await pipeline.toBuffer();
  const ext = fmt === "jpeg" ? "jpg" : fmt;
  return {
    buffer: out,
    filename: `${baseName}-compressed.${ext}`,
    mimeType: fmt === "jpeg" ? "image/jpeg" : `image/${fmt}`,
  };
}
